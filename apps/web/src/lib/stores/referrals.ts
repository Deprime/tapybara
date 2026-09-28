import { persisted } from 'svelte-persisted-store';
import type { ReferralDto } from '$lib/api/referrals';

export type { ReferralDto };

const { subscribe, set, update } = persisted<ReferralDto[]>('referrals', []);
const clear = () => set([]);

const referralsStore = {
  subscribe,
  set,
  update,
  clear
};

export default referralsStore;
