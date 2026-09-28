import http from '$lib/config/http';

const PREFIX = '/api/referrals';

/** Referral row joined with the invited user's profile, as returned by GET /api/referrals. */
export type ReferralDto = {
  id: number;
  referrerId: number;
  refereeId: number;
  createdAt: number;
  claimedAt: number;
  refereeUsername: string;
  refereeTelegramId: number;
};

const referralsApi = {
  /**
   * Referrals of the current session user
   */
  list: () => {
    const url = `${PREFIX}`;
    return http.get(url).json<ReferralDto[]>();
  }
};

export default referralsApi;
