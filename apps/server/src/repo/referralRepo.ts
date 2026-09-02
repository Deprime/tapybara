import { eq } from 'drizzle-orm';
import { db, referrals, users, type Referral } from '@capyberries/db';

export type ReferralWithUser = Referral & {
  refereeUsername: string;
  refereeTelegramId: number;
};

export const referralRepo = {
  /** Everyone invited by the given user. */
  getByReferrerId(referrerId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  },

  /** Who invited the given user (unique per referee). */
  getByRefereeId(refereeId: number): Promise<Referral | null> {
    return db
      .select()
      .from(referrals)
      .where(eq(referrals.refereeId, refereeId))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  /** Referrals of a user joined with the invited user's profile — for UI lists. */
  getRefereesWithUsers(referrerId: number): Promise<ReferralWithUser[]> {
    return db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        refereeId: referrals.refereeId,
        createdAt: referrals.createdAt,
        claimedAt: referrals.claimedAt,
        refereeUsername: users.username,
        refereeTelegramId: users.telegramId,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.refereeId, users.id))
      .where(eq(referrals.referrerId, referrerId));
  },
};
