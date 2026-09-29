import { Hono, type Context } from 'hono';
import { and, eq, gt } from 'drizzle-orm';
import { setCookie } from 'hono/cookie';
import { db, authTokens } from '@capyberries/db';
import { createSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from '../helpers/session';
import { userRepo } from '../repo/userRepo';
import { mountDevLogin } from '../mocks/devLogin';
import { isHttps } from '../helpers/utils';
import { getUnixTimestamp } from '../helpers/datetime';
import { mobileOnly } from '../middlewares/mobileOnly';
import { unauthorizedPageHtml } from '../templates/index';

const authPageController = new Hono();

// A desktop visit must not burn the one-time token.
authPageController.use(mobileOnly);

const unauthorizedPage = (c: Context, status: 401 | 500 = 401) =>
  c.html(unauthorizedPageHtml, status);

/**
 * GET /auth?token=... — one-time token from the bot /login link.
 * Valid: consume the token, open a session, set the HttpOnly cookie, redirect.
 * Invalid/expired/raced: a static "not authorized" HTML page.
 */
authPageController.get('/', async (c) => {
  const token = c.req.query('token') ?? '';
  try {
    const [tokenRow] = token
      ? await db.select().from(authTokens).where(eq(authTokens.token, token)).limit(1)
      : [];
    if (!tokenRow || tokenRow.expires_at <= getUnixTimestamp()) return unauthorizedPage(c);

    // Atomic one-time consumption: only one racing request deletes the row.
    const [consumed] = await db
      .delete(authTokens)
      .where(and(eq(authTokens.id, tokenRow.id), gt(authTokens.expires_at, getUnixTimestamp())));
    if (consumed.affectedRows === 0) return unauthorizedPage(c);

    const user = await userRepo.getById(tokenRow.user_id);
    if (!user || user.blocked_at) return unauthorizedPage(c);

    const sid = await createSession(user.id);
    setCookie(c, SESSION_COOKIE, sid, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: isHttps(c),
      maxAge: SESSION_TTL_SECONDS
    });
    return c.redirect('/');
  } catch (e) {
    console.error('auth route failed:', e);
    return unauthorizedPage(c, 500);
  }
});

mountDevLogin(authPageController);

export default authPageController;
