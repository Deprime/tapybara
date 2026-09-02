import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { db, authTokens, sessions, users, type User } from '@capyberries/db';
import { userRepo } from './repo/userRepo';
import { unitRepo } from './repo/unitRepo';

const now = () => Math.floor(Date.now() / 1000);

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const SESSION_COOKIE = 'sid';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

// Behind nginx the scheme is only visible via x-forwarded-proto.
const isHttps = (c: Context) =>
  c.req.header('x-forwarded-proto') === 'https' || new URL(c.req.url).protocol === 'https:';

// --- session store ---

export async function createSession(userId: number): Promise<string> {
  const sid = randomBytes(32).toString('base64url');
  const values = {
    userId,
    tokenHash: sha256(sid),
    createdAt: now(),
    expiresAt: now() + SESSION_TTL_SECONDS,
  };
  // Upsert: user_id is UNIQUE, so a new login atomically replaces the single
  // existing session — the previous device's cookie stops resolving.
  await db.insert(sessions).values(values).onDuplicateKeyUpdate({ set: values });
  return sid;
}

export async function resolveSession(sid: string | undefined): Promise<User | null> {
  if (!sid) return null;
  try {
    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, sha256(sid)), gt(sessions.expiresAt, now())))
      .limit(1);
    if (!row) return null;
    if (row.user.blockedAt) {
      // Banned users lose every session at once.
      await db.delete(sessions).where(eq(sessions.userId, row.user.id));
      return null;
    }
    return row.user;
  } catch (e) {
    console.error('resolveSession failed:', e);
    return null;
  }
}

const deleteSessionBySid = (sid: string) =>
  db.delete(sessions).where(eq(sessions.tokenHash, sha256(sid)));

export const cleanupExpired = async () => {
  await db.delete(authTokens).where(lt(authTokens.expiresAt, now()));
  await db.delete(sessions).where(lt(sessions.expiresAt, now()));
};

// --- middleware ---

export type SessionEnv = { Variables: { user: User } };

export const requireAuth = createMiddleware<SessionEnv>(async (c, next) => {
  const user = await resolveSession(getCookie(c, SESSION_COOKIE));
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  c.set('user', user);
  await next();
});

// --- routes ---

const unauthorizedPage = (c: Context, status: 401 | 500 = 401) =>
  c.html(
    `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Не авторизован</title>
</head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f5f5f4;margin:0">
  <div style="text-align:center;padding:2rem">
    <h1 style="font-size:2rem;margin:0 0 .5rem">🦫 Не авторизован</h1>
    <p style="color:#57534e;margin:0">Ссылка недействительна или устарела.<br>Запросите новую через команду /login в боте.</p>
  </div>
</body>
</html>`,
    status
  );

/**
 * GET /auth?token=... — one-time token from the bot /login link.
 * Valid: consume the token, open a session, set the HttpOnly cookie, redirect.
 * Invalid/expired/raced: a static "not authorized" HTML page.
 */
export const authRouter = new Hono().get('/', async (c) => {
  const token = c.req.query('token') ?? '';
  try {
    const [tokenRow] = token
      ? await db.select().from(authTokens).where(eq(authTokens.token, token)).limit(1)
      : [];
    if (!tokenRow || tokenRow.expiresAt <= now()) return unauthorizedPage(c);

    // Atomic one-time consumption: only one racing request deletes the row.
    const [consumed] = await db
      .delete(authTokens)
      .where(and(eq(authTokens.id, tokenRow.id), gt(authTokens.expiresAt, now())));
    if (consumed.affectedRows === 0) return unauthorizedPage(c);

    const user = await userRepo.getById(tokenRow.userId);
    if (!user || user.blockedAt) return unauthorizedPage(c);

    const sid = await createSession(user.id);
    setCookie(c, SESSION_COOKIE, sid, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: isHttps(c),
      maxAge: SESSION_TTL_SECONDS,
    });
    return c.redirect('/');
  } catch (e) {
    console.error('auth route failed:', e);
    return unauthorizedPage(c, 500);
  }
});

const meDto = (user: User) => ({
  id: user.id,
  username: user.username,
  balance: Number(user.balance),
  balanceSol: Number(user.balanceSol),
});

export const authApi = new Hono()
  .get('/me', async (c) => {
    const user = await resolveSession(getCookie(c, SESSION_COOKIE));
    if (!user) return c.json({ error: 'unauthorized' }, 401);
    return c.json(meDto(user));
  })
  .post('/logout', async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (sid) await deleteSessionBySid(sid).catch(() => {});
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
    return c.json({ ok: true });
  });

// Shared response shape for GET /api/me/units and POST .../collect:
// the client needs level/rarity/exp/harvestAt to compute ready points
// with the same shared formula the server validates clicks against.
const listUnits = async (userId: number) => {
  const rows = await unitRepo.getByUserId(userId);
  return rows.map((u) => ({
    id: u.id,
    level: u.level,
    rarity: u.rarity,
    status: u.status,
    exp: u.exp,
    balanceSol: Number(u.balanceSol),
    points: u.points,
    harvestAt: u.harvestAt
  }));
};

export const meApi = new Hono<SessionEnv>()
  .use('*', requireAuth)
  .get('/units', async (c) => c.json(await listUnits(c.get('user').id)))
  .post(
    '/units/:id/collect',
    zValidator('json', z.object({ clicks: z.array(z.number().int().nonnegative()).max(1000) })),
    async (c) => {
      await unitRepo.collect(Number(c.req.param('id')), c.get('user').id, c.req.valid('json').clicks);
      return c.json(await listUnits(c.get('user').id));
    }
  );
