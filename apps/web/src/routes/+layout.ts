import { redirect } from '@sveltejs/kit';

// API
import authApi from '$lib/api/auth';
import unitsApi from '$lib/api/units';

// Stores
import userStore from '$lib/stores/user';
import unitsStore from '$lib/stores/units';

// Types
import type { LayoutLoad } from './$types';

// SPA mode: no server-side rendering, everything happens in the browser.
export const ssr = false;
export const prerender = false;

/**
 * App bootstrap: fetch the session user and their units once, keep them in
 * stores, and route by auth state — authorized visitors landing on `/` are
 * sent to the home screen, everyone else is kept on the landing page.
 */
export const load: LayoutLoad = async ({ url }) => {
  try {
    const [user, units] = await Promise.all([authApi.me(), unitsApi.list()]);
    userStore.set(user);
    unitsStore.set(units);
  } catch {
    userStore.clear();
    unitsStore.clear();
    if (url.pathname !== '/') redirect(302, '/');
    return;
  }

  if (url.pathname === '/') redirect(302, '/home');
};
