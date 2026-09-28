import { Hono } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import type { User } from '@capyberries/db';
import { resolveSession, deleteSessionBySid, SESSION_COOKIE } from '../helpers/session';
import { requireAuth, type SessionEnv } from '../middlewares/requireAuth';
import { inactivityRepo } from '../repo/inactivityRepo';
import { getUnixTimestamp } from '../helpers/datetime';

const authController = new Hono<SessionEnv>();

const meDto = (user: User) => ({
  id: user.id,
  username: user.username,
  balance: Number(user.balance),
  balanceSol: Number(user.balanceSol)
});

/** Current session user; no valid session → 401. */
authController.get('/me', async (c) => {
  const user = await resolveSession(getCookie(c, SESSION_COOKIE));
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  return c.json(meDto(user));
});

/** Browser opening/visibility event, not background session polling. */
authController.post('/visit', requireAuth, async (c) => {
  const origin = c.req.header('origin');
  const siteOrigin = new URL(process.env.SITE_URL ?? 'http://localhost:5173').origin;
  if (
    c.req.header('sec-fetch-site') === 'cross-site' ||
    (origin && origin !== siteOrigin && origin !== new URL(c.req.url).origin)
  ) {
    return c.json({ error: 'forbidden' }, 403);
  }
  await inactivityRepo.visit(c.get('user').id, getUnixTimestamp());
  return c.body(null, 204);
});

/** Deletes the server-side session and its cookie. */
authController.post('/logout', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE);
  if (sid) await deleteSessionBySid(sid).catch(() => {});
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

export default authController;
