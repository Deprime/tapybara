import { Hono } from 'hono';
import { createBot, webhookCallback, webhookSecret, WEBHOOK_PATH } from '@capyberries/bot';

// Factory instead of a default export: the bot instance is created in index.ts
// (it needs BOT_TOKEN and also powers bot.init/setMyCommands there).
export const createTelegramController = (bot: ReturnType<typeof createBot>) => {
  const telegramController = new Hono();

  // Updates delivered by Telegram, verified via X-Telegram-Bot-Api-Secret-Token.
  telegramController.post(
    WEBHOOK_PATH,
    webhookCallback(bot, 'hono', { secretToken: webhookSecret() })
  );

  return telegramController;
};
