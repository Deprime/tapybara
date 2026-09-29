import { persisted } from 'svelte-persisted-store';
import type { UnitListItem } from '$lib/api/units';

// Key is versioned: bump on shape changes so stale localStorage payloads
// (e.g. pre-snake_case camelCase fields) are never hydrated.
const { subscribe, set, update } = persisted<UnitListItem[]>('units:v2', []);
const clear = () => set([]);

const unitsStore = {
  subscribe,
  set,
  update,
  clear
};

export default unitsStore;
