import { persisted } from 'svelte-persisted-store';

/**
 * A persisted writable store with a `clear` method that resets the value
 * (and localStorage) back to the default.
 */
export function createPersistedStore<T>(key: string, defaultValue: T) {
  const store = persisted<T>(key, defaultValue);

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    clear: () => store.set(defaultValue)
  };
}
