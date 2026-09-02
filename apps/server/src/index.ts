import { join } from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createBot, webhookCallback, botToken, webhookSecret, botCommands, WEBHOOK_PATH } from '@capyberries/bot';
import { api } from './routes';
import { authRouter, authApi, meApi, cleanupExpired } from './auth';
import { mobileOnly } from './middlewares/mobileOnly';

const app = new Hono();

app.use(logger());
app.use('/api/*', cors());

app.route('/api', api);
app.route('/api/auth', authApi);
app.route('/api/me', meApi);
// Before the auth handler: a desktop visit must not burn the one-time token.
app.use('/auth', mobileOnly);
app.route('/auth', authRouter);

// Hourly sweep of expired login tokens and sessions.
setInterval(() => cleanupExpired().catch((e) => console.warn('cleanup failed:', e)), 60 * 60 * 1000);

// Telegram webhook: bot logic lives in @capyberries/bot, updates are delivered
// by Telegram to WEBHOOK_PATH and verified via X-Telegram-Bot-Api-Secret-Token.
const token = botToken();
if (token) {
  const bot = createBot(token);
  app.post(WEBHOOK_PATH, webhookCallback(bot, 'hono', { secretToken: webhookSecret() }));
  // grammY validates the token via getMe on the first update; warm it up at boot
  // instead. Failures must not prevent the server from starting.
  bot
    .init()
    .then(() => bot.api.setMyCommands(botCommands))
    .then(() => console.log('Telegram bot initialized'))
    .catch((e) => console.warn(`Telegram bot init failed (webhook will keep retrying): ${e}`));
} else {
  console.warn('BOT_TOKEN is not set — Telegram webhook is disabled.');
}

// Serve the SvelteKit SPA build: real files first, then fallback to index.html.
app.get('*', mobileOnly, async (c) => {
  const pathname = decodeURIComponent(new URL(c.req.url).pathname);
  let file = Bun.file(join(import.meta.dir, '../../web/build', pathname));
  if (!(await file.exists())) file = Bun.file(join(import.meta.dir, '../../web/build/index.html'));
  return new Response(file, {
    headers: { 'content-type': file.type || 'text/html; charset=utf-8' },
  });
});

const port = Number(process.env.PORT ?? 3000);

Bun.serve({ port, fetch: app.fetch });

console.log(`Server listening on http://localhost:${port}`);
