import { persisted } from 'svelte-persisted-store';
import type { UnitListItem } from '$lib/api/units';

// Key is versioned: bump on shape changes so stale localStorage payloads
// (e.g. pre-snake_case camelCase fields) are never hydrated.
// v3: balance_sol coerced to number by the API client; v4: points field dropped.
const { subscribe, set, update } = persisted<UnitListItem[]>('units:v4', []);
const clear = () => set([]);

const unitsStore = {
  subscribe,
  set,
  update,
  clear
};

export default unitsStore;
