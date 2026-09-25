import { join } from 'node:path';
import { Hono } from 'hono';
import { mobileOnly } from '../middlewares/mobileOnly';
import { pageAuth } from '../middlewares/pageAuth';

// Serve the SvelteKit SPA build to authorized mobile sessions only:
// real files first, then fallback to index.html for client-side routes.
// Must be mounted last (see index.ts) so every specific route wins over it.
const spaController = new Hono();

spaController.get('*', mobileOnly, pageAuth, async (c) => {
  const pathname = decodeURIComponent(new URL(c.req.url).pathname);
  let file = Bun.file(join(import.meta.dir, '../../../web/build', pathname));
  if (!(await file.exists())) file = Bun.file(join(import.meta.dir, '../../../web/build/index.html'));
  return new Response(file, {
    headers: { 'content-type': file.type || 'text/html; charset=utf-8' },
  });
});

export default spaController;
