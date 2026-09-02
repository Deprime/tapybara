import { createBot } from './bot';

export { webhookCallback } from 'grammy';
export { botCommands } from './bot';

export const WEBHOOK_PATH = '/api/telegram/webhook';
export { createBot };

/**
 * Configure for webhook-only operation: the Hono server mounts
 * webhookCallback(bot, 'hono') at WEBHOOK_PATH, updates come from Telegram.
 */
export const botToken = () => process.env.BOT_TOKEN;
export const webhookSecret = () => process.env.TELEGRAM_WEBHOOK_SECRET;
