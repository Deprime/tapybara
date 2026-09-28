import { and, eq, gt, isNull, lte, ne } from 'drizzle-orm';
import { db, users } from '@capyberries/db';
import { DEV_TELEGRAM_ID } from '../mocks/devUser';

export const INACTIVITY_SECONDS = 24 * 60 * 60;

const eligible = (cutoff: number) =>
  and(
    lte(users.lastSeenAt, cutoff),
    isNull(users.inactivityReminderAt),
    isNull(users.blockedAt),
    ne(users.telegramId, DEV_TELEGRAM_ID)
  );

export const inactivityRepo = {
  async visit(userId: number, now: number): Promise<void> {
    await db
      .update(users)
      .set({ lastSeenAt: now, inactivityReminderAt: null })
      .where(eq(users.id, userId));
  },

  async due(cutoff: number, afterId: number) {
    return db
      .select({ id: users.id, telegramId: users.telegramId, lastSeenAt: users.lastSeenAt })
      .from(users)
      .where(and(eligible(cutoff), gt(users.id, afterId)))
      .orderBy(users.id)
      .limit(100);
  },

  async stillDue(id: number, lastSeenAt: number, cutoff: number): Promise<boolean> {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, id), eq(users.lastSeenAt, lastSeenAt), eligible(cutoff)))
      .limit(1);
    return rows.length > 0;
  },

  async handled(id: number, lastSeenAt: number, now: number): Promise<void> {
    // A visit during delivery starts a new cycle, which this result must not close.
    await db
      .update(users)
      .set({ inactivityReminderAt: now })
      .where(and(eq(users.id, id), eq(users.lastSeenAt, lastSeenAt)));
  }
};
