import { createMiddleware } from 'hono/factory';
import { getUserRole } from '../helpers/roles';
import type { SessionEnv } from './requireAuth';

/**
 * Admin-only gate for JSON-API routes: mount after requireAuth, which fills
 * c.get('user'); non-admins get 403 JSON.
 */
export const requireAdmin = createMiddleware<SessionEnv>(async (c, next) => {
  if (getUserRole(c.get('user')) !== 'admin') return c.json({ error: 'forbidden' }, 403);
  await next();
});
