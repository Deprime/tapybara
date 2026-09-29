import { eq } from 'drizzle-orm';
import { db, referrals, users, type Referral } from '@capyberries/db';

export type ReferralWithUser = Referral & {
  referee_username: string;
  referee_telegram_id: number;
};

export const referralRepo = {
  /** Everyone invited by the given user. */
  getByReferrerId(referrer_id: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrer_id, referrer_id));
  },

  /** Who invited the given user (unique per referee). */
  getByRefereeId(referee_id: number): Promise<Referral | null> {
    return db
      .select()
      .from(referrals)
      .where(eq(referrals.referee_id, referee_id))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  /** Referrals of a user joined with the invited user's profile — for UI lists. */
  getRefereesWithUsers(referrer_id: number): Promise<ReferralWithUser[]> {
    return db
      .select({
        id: referrals.id,
        referrer_id: referrals.referrer_id,
        referee_id: referrals.referee_id,
        created_at: referrals.created_at,
        claimed_at: referrals.claimed_at,
        referee_username: users.username,
        referee_telegram_id: users.telegram_id
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referee_id, users.id))
      .where(eq(referrals.referrer_id, referrer_id));
  }
};
