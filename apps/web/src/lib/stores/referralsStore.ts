import { createPersistedStore } from './createPersistedStore';

export type ReferralDto = {
  id: number;
  referrerId: number;
  refereeId: number;
  createdAt: number;
  claimedAt: number;
  refereeUsername: string;
  refereeTelegramId: number;
};

export const referralsStore = createPersistedStore<ReferralDto[]>('capyberries:referrals', []);
