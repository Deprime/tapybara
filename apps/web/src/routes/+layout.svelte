<script lang="ts">
  import '../app.css';
  import { onDestroy, onMount } from 'svelte';
  import authApi from '$lib/api/auth';

  // Components
  import LoadingScreen from '$lib/components/structure/loading-screen/LoadingScreen.svelte';

  // Stores
  import userStore from '$lib/stores/user';

  // Props
  let { children } = $props();

  let loading = $state(true);
  let timeoutId: NodeJS.Timeout | null = null;

  onMount(() => {
    const visit = () => {
      if (document.visibilityState === 'visible' && $userStore) {
        void authApi.visit().catch(() => console.warn('Не удалось записать посещение'));
      }
    };
    visit();
    document.addEventListener('visibilitychange', visit);
    return () => {
      document.removeEventListener('visibilitychange', visit);
    };
  });

  $effect(() => {
    if ($userStore) {
      timeoutId = setTimeout(() => {
        loading = false;
      }, 1000);
    }
  });

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

{#if loading}
  <LoadingScreen />
{:else}
  {@render children()}
{/if}
