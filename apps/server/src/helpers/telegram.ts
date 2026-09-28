import { GrammyError, type createBot } from '@capyberries/bot';
import { z } from 'zod';

const sendTelegramMessageSchema = z.object({
  chatId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  text: z
    .string()
    .trim()
    .min(1)
    .refine((text) => [...text].length <= 4096)
});

/** Sanitized failure: never retain the transport URL, bot token or message text. */
export class TelegramDeliveryError extends Error {
  constructor(
    readonly permanent: boolean,
    readonly retryAfter = 0
  ) {
    super('Telegram delivery failed');
  }
}

/** Reuse the running bot's client, including its proxy and request timeout. */
export function createTelegramSender(
  api: Pick<ReturnType<typeof createBot>['api'], 'sendMessage'>
) {
  return {
    async sendMessage(chatId: number, text: string): Promise<void> {
      const message = sendTelegramMessageSchema.parse({ chatId, text });
      try {
        await api.sendMessage(message.chatId, message.text);
      } catch (error) {
        if (error instanceof GrammyError) {
          throw new TelegramDeliveryError(
            error.error_code === 400 || error.error_code === 403,
            error.parameters.retry_after ?? 0
          );
        }
        throw new TelegramDeliveryError(false);
      }
    }
  };
}

export type TelegramSender = ReturnType<typeof createTelegramSender>;
