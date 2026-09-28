import { persisted } from 'svelte-persisted-store';

import type { SessionResponse } from '$lib/types/auth';

export type Me = SessionResponse;

const { subscribe, set, update } = persisted<Me | null>('user', null);
const clear = () => set(null);

const userStore = {
  subscribe,
  set,
  update,
  clear
};

export default userStore;
