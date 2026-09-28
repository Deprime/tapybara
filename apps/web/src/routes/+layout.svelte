<script lang="ts">
  import '../app.css';
  import { onDestroy } from 'svelte';

  // Components
  import LoadingScreen from '$lib/components/structure/loading-screen/LoadingScreen.svelte';

  // Stores
  import userStore from '$lib/stores/user';

  // Props
  let { children } = $props();

  let loading = $state(true);
  let timeoutId: NodeJS.Timeout | null = null;

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
