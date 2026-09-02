import { join } from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { api } from './routes';
import { webBuildDir } from './db';

const app = new Hono();

app.use(logger());
app.use('/api/*', cors());

app.route('/api', api);

// Serve the SvelteKit SPA build: real files first, then fallback to index.html.
app.get('*', async (c) => {
  const pathname = decodeURIComponent(new URL(c.req.url).pathname);
  let file = Bun.file(join(webBuildDir, pathname));
  if (!(await file.exists())) file = Bun.file(join(webBuildDir, 'index.html'));
  return c.body(file, {
    headers: { 'content-type': file.type || 'text/html; charset=utf-8' },
  });
});

const port = Number(process.env.PORT ?? 3000);

Bun.serve({ port, fetch: app.fetch });

console.log(`Server listening on http://localhost:${port}`);
