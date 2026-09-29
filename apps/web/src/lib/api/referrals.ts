import http from '$lib/config/http';

const PREFIX = '/api/referrals';

/** Referral row joined with the invited user's profile, as returned by GET /api/referrals. */
export type ReferralDto = {
  id: number;
  referrer_id: number;
  referee_id: number;
  created_at: number;
  claimed_at: number;
  referee_username: string;
  referee_telegram_id: number;
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
