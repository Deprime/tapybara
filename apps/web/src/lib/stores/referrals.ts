import { persisted } from 'svelte-persisted-store';
import type { ReferralDto } from '$lib/api/referrals';

export type { ReferralDto };

// Key is versioned: bump on shape changes so stale localStorage payloads
// (e.g. pre-snake_case camelCase fields) are never hydrated.
const { subscribe, set, update } = persisted<ReferralDto[]>('referrals:v2', []);
const clear = () => set([]);

const referralsStore = {
  subscribe,
  set,
  update,
  clear
};

export default referralsStore;
