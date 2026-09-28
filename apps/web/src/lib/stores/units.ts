import { persisted } from 'svelte-persisted-store';
import type { UnitListItem } from '$lib/api/units';

export type UnitDto = UnitListItem;
export type { UnitRarity, UnitStatus } from '@capyberries/shared';

const { subscribe, set, update } = persisted<UnitDto[]>('units', []);
const clear = () => set([]);

const unitsStore = {
  subscribe,
  set,
  update,
  clear
};

export default unitsStore;
