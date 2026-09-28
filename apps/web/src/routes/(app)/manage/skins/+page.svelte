<script lang="ts">
  import { onMount } from 'svelte';

  // Components
  import { RarityLabel, UnitFrame } from '$lib/components/shared';

  // API
  import managerApi from '$lib/api/manager';

  // Types
  import type { Skin } from '@capyberries/shared';

  const APP_NAME = import.meta.env.APP_NAME;
  let skins = $state<Skin[]>([]);
  let loading = $state(false);

  async function loadSkins() {
    loading = true;
    try {
      skins = await managerApi.skins();
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadSkins();
  });
</script>

<svelte:head>
  <title>Скины · {APP_NAME}</title>
</svelte:head>

<main class="mx-auto max-w-7xl px-4 pt-4 pb-[calc(var(--footer-height)+30px)]">
  <h1 class="text-2xl font-bold">Скины</h1>

  {#if loading}
    <p class="mt-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">Загрузка...</p>
  {:else if skins.length === 0}
    <p class="mt-2 text-sm text-gray-400">Скинов нет</p>
  {:else}
    <ul
      class="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
    >
      {#each skins as skin (`${skin.id}-${skin.rarity}`)}
        <UnitFrame rarity={skin.rarity} class="pt-4 pb-1">
          <p
            class="absolute top-1 right-0 z-2 text-center font-secondary text-[10px]/[12px] text-gray-600"
          >
            {skin.id}
          </p>
          <img
            src="/skins/{skin.id}.png"
            alt="Скин юнита"
            class="relative z-1 mx-auto size-full min-h-20 object-contain"
            loading="lazy"
          />

          <RarityLabel rarity={skin.rarity}>
            {skin.rarity}
          </RarityLabel>
        </UnitFrame>
      {/each}
    </ul>
  {/if}
</main>
