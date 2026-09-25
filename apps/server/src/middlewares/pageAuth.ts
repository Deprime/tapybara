import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { resolveSession, SESSION_COOKIE } from '../helpers/session';
import { unauthorizedPageHtml } from '../templates/index';

/**
 * Page counterpart of requireAuth: without a valid session nothing from the
 * SvelteKit build is served — the static "not authorized" page is returned
 * instead, pointing the user to the bot /login command. Fails closed: DB
 * errors are swallowed by resolveSession and treated as no session.
 */
export const pageAuth: MiddlewareHandler = async (c, next) => {
  const user = await resolveSession(getCookie(c, SESSION_COOKIE));
  if (!user) return c.html(unauthorizedPageHtml, 401);
  await next();
};
