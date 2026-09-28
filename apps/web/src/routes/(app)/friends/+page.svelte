<script lang="ts">
  import { onMount } from 'svelte';

  // Stores
  import referralsStore from '$lib/stores/referrals';

  // API
  import referralsApi from '$lib/api/referrals';

  // Data
  let loading = $state(false);

  const fetchReferrals = async () => {
    loading = true;
    try {
      referralsStore.set(await referralsApi.list());
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    fetchReferrals();
  });
</script>

<svelte:head>
  <title>Друзья · Capyberries</title>
</svelte:head>

<div class="w-full p-4">
  <h3 class="h3 text-slate-700">Друзья</h3>
</div>
