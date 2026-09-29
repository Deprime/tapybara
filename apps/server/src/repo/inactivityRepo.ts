import { and, eq, gt, isNull, lte, ne } from 'drizzle-orm';
import { db, users } from '@capyberries/db';
import { DEV_TELEGRAM_ID } from '../mocks/devUser';

export const INACTIVITY_SECONDS = 24 * 60 * 60;

const eligible = (cutoff: number) =>
  and(
    lte(users.last_seen_at, cutoff),
    isNull(users.inactivity_reminder_at),
    isNull(users.blocked_at),
    ne(users.telegram_id, DEV_TELEGRAM_ID)
  );

export const inactivityRepo = {
  async visit(user_id: number, now: number): Promise<void> {
    await db
      .update(users)
      .set({ last_seen_at: now, inactivity_reminder_at: null })
      .where(eq(users.id, user_id));
  },

  async due(cutoff: number, after_id: number) {
    return db
      .select({ id: users.id, telegram_id: users.telegram_id, last_seen_at: users.last_seen_at })
      .from(users)
      .where(and(eligible(cutoff), gt(users.id, after_id)))
      .orderBy(users.id)
      .limit(100);
  },

  async stillDue(id: number, last_seen_at: number, cutoff: number): Promise<boolean> {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, id), eq(users.last_seen_at, last_seen_at), eligible(cutoff)))
      .limit(1);
    return rows.length > 0;
  },

  async handled(id: number, last_seen_at: number, now: number): Promise<void> {
    // A visit during delivery starts a new cycle, which this result must not close.
    await db
      .update(users)
      .set({ inactivity_reminder_at: now })
      .where(and(eq(users.id, id), eq(users.last_seen_at, last_seen_at)));
  }
};
