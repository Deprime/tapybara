import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import type { User } from '@capyberries/db';
import { resolveSession, SESSION_COOKIE } from '../helpers/session';

export type SessionEnv = { Variables: { user: User } };

/**
 * JSON-API counterpart of pageAuth: resolves the session cookie and exposes
 * the user as c.get('user'); no valid session → 401 JSON.
 */
export const requireAuth = createMiddleware<SessionEnv>(async (c, next) => {
  const user = await resolveSession(getCookie(c, SESSION_COOKIE));
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  c.set('user', user);
  await next();
});
