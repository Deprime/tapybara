import { createPersistedStore } from './createPersistedStore';

export type Me = {
  id: number;
  username: string;
  balance: number;
  balanceSol: number;
};

export const userStore = createPersistedStore<Me | null>('capyberries:user', null);
