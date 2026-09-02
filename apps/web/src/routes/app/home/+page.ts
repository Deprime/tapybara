import { unitsStore, type UnitDto } from '$lib/stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/me/units');
  const units: UnitDto[] = res.ok ? await res.json() : [];
  unitsStore.set(units);
  return { units };
};
