import { redirect } from '@sveltejs/kit';
import { userStore } from '$lib/stores';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  const res = await fetch('/api/auth/me');
  if (!res.ok) redirect(302, '/');
  const user = (await res.json()) as {
    id: number;
    username: string;
    balance: number;
    balanceSol: number;
  };
  userStore.set(user);
  return { user };
};
