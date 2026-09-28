import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

// Stores
import userStore from '$lib/stores/user';

// Types
import type { LayoutLoad } from './$types';

/**
 * Manage pages are admin-only. The root layout has already put the session
 * user into the store by the time this runs, so the role needs no extra fetch;
 * everyone but admins is sent back to the home screen.
 */
export const load: LayoutLoad = async () => {
  if (get(userStore)?.role !== 'admin') redirect(302, '/home');
};
