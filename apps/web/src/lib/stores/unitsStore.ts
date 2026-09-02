import { createPersistedStore } from './createPersistedStore';

export type UnitRarity = 'base' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type UnitStatus = 'harvest' | 'pre_party' | 'party' | 'staking';

export type UnitDto = {
  id: number;
  level: number;
  rarity: UnitRarity;
  status: UnitStatus;
  balanceSol: number;
};

export const unitsStore = createPersistedStore<UnitDto[]>('capyberries:units', []);
