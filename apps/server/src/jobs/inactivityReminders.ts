import { getUnixTimestamp } from '../helpers/datetime';
import { inactivityRepo, INACTIVITY_SECONDS } from '../repo/inactivityRepo';
import { TelegramDeliveryError, type TelegramSender } from '../helpers/telegram';

export const REMINDER_INTERVAL_MS = 5 * 60 * 1000;
export const REMINDER_TEXT = '🦫 Капибары соскучились! Загляни в приложение и продолжи игру';

export function createInactivityJob(
  sender: TelegramSender,
  repo = inactivityRepo,
  now = getUnixTimestamp
) {
  // ponytail: one running server; multiple replicas need a database claim/lease.
  let running = false;
  let stopped = false;
  let retryAt = 0;
  const stop = () => {
    stopped = true;
  };

  const run = async () => {
    if (running || stopped || now() < retryAt) return;
    running = true;
    const cutoff = now() - INACTIVITY_SECONDS;
    try {
      let after_id = 0;
      while (!stopped) {
        const candidates = await repo.due(cutoff, after_id);
        if (!candidates.length) break;
        for (const user of candidates) {
          if (stopped) return;
          after_id = user.id;
          if (user.last_seen_at === null || !(await repo.stillDue(user.id, user.last_seen_at, cutoff)))
            continue;
          try {
            await sender.sendMessage(user.telegram_id, REMINDER_TEXT);
          } catch (error) {
            console.warn('inactivity_reminder_delivery_failed', { user_id: user.id });
            if (error instanceof TelegramDeliveryError && error.permanent) {
              await repo.handled(user.id, user.last_seen_at, now());
            } else if (error instanceof TelegramDeliveryError && error.retryAfter > 0) {
              retryAt = now() + error.retryAfter;
              return;
            }
            continue;
          }
          // Persist only after Telegram acknowledges. A crash before this write can
          // cause a retry; Telegram sendMessage has no idempotency key.
          await repo.handled(user.id, user.last_seen_at, now());
        }
      }
    } catch {
      console.warn('inactivity_reminder_check_failed');
    } finally {
      running = false;
    }
  };
  return { run, stop };
}

export function startInactivityReminders(sender: TelegramSender) {
  const job = createInactivityJob(sender);
  let current: Promise<void> | undefined;
  const tick = () => {
    if (!current)
      current = job.run().finally(() => {
        current = undefined;
      });
  };
  const timer = setInterval(tick, REMINDER_INTERVAL_MS);
  timer.unref();
  tick();
  return async () => {
    clearInterval(timer);
    job.stop();
    await current;
  };
}
