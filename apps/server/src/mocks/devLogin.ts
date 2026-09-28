import { Hono, type Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { createSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from '../helpers/session';
import { isHttps } from '../helpers/utils';
import { ensureDevUser } from './devUser';

/**
 * Dev-only login: mints a session for the deterministic dev mock user so the
 * developer can pass the page auth gate without the Telegram bot.
 * GET /auth/dev-login → cookie → redirect to /.
 */
const devLogin = async (c: Context) => {
  const user = await ensureDevUser();
  const sid = await createSession(user.id);
  setCookie(c, SESSION_COOKIE, sid, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: isHttps(c),
    maxAge: SESSION_TTL_SECONDS
  });
  return c.redirect('/');
};

// Mounted only in dev (DEV_LOGIN=true is set by the dev script, never in
// production): without this the developer cannot get past pageAuth locally,
// since /login links come from the Telegram bot.
export const mountDevLogin = (controller: Hono) => {
  if (process.env.DEV_LOGIN !== 'true' || process.env.NODE_ENV === 'production') return;
  console.warn('DEV_LOGIN: GET /auth/dev-login will create a session for the local dev user');
  controller.get('/dev-login', devLogin);
};
