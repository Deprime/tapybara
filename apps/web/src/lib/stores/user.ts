import { persisted } from 'svelte-persisted-store';

import type { SessionResponse } from '$lib/types/auth';

export type Me = SessionResponse;

// Key is versioned: bump on shape changes so stale localStorage payloads
// (e.g. pre-snake_case camelCase fields) are never hydrated.
const { subscribe, set, update } = persisted<Me | null>('user:v2', null);
const clear = () => set(null);

const userStore = {
  subscribe,
  set,
  update,
  clear
};

export default userStore;
