import { Hono } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import type { User } from '@capyberries/db';
import { resolveSession, deleteSessionBySid, SESSION_COOKIE } from '../helpers/session';

const authController = new Hono();

const meDto = (user: User) => ({
  id: user.id,
  username: user.username,
  balance: Number(user.balance),
  balanceSol: Number(user.balanceSol),
});

/** Current session user; no valid session → 401. */
authController.get('/me', async (c) => {
  const user = await resolveSession(getCookie(c, SESSION_COOKIE));
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  return c.json(meDto(user));
});

/** Deletes the server-side session and its cookie. */
authController.post('/logout', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE);
  if (sid) await deleteSessionBySid(sid).catch(() => {});
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

export default authController;
