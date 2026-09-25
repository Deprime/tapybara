import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createBot, botToken, botCommands } from '@capyberries/bot';
import { cleanupExpired } from './helpers/session';
import healthController from './controllers/healthController';
import itemsController from './controllers/itemsController';
import authController from './controllers/authController';
import unitsController from './controllers/unitsController';
import authPageController from './controllers/authPageController';
import spaController from './controllers/spaController';
import { createTelegramController } from './controllers/telegramController';

const app = new Hono();
const API_PREFIX = '/api';

app.use(logger());
app.use(`${API_PREFIX}/*`, cors());

app.route(`${API_PREFIX}/health`, healthController);
app.route(`${API_PREFIX}/items`, itemsController);
app.route(`${API_PREFIX}/auth`, authController);
app.route(`${API_PREFIX}/units`, unitsController);
app.route('/auth', authPageController);

// Hourly sweep of expired login tokens and sessions.
setInterval(() => cleanupExpired().catch((e) => console.warn('cleanup failed:', e)), 60 * 60 * 1000);

// Telegram webhook: bot logic lives in @capyberries/bot, updates are delivered
// by Telegram to WEBHOOK_PATH and verified via X-Telegram-Bot-Api-Secret-Token.
const token = botToken();
if (token) {
  const bot = createBot(token);
  app.route('/', createTelegramController(bot));
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

// Catch-all SPA serving must be last: every specific route above wins over it.
app.route('/', spaController);

const port = Number(process.env.PORT ?? 3000);
Bun.serve({ port, fetch: app.fetch });

console.log(`Server listening on http://localhost:${port}`);
