<script lang="ts">
  import { unitsStore } from '$lib/stores';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const units = $derived($unitsStore);
</script>

<svelte:head>
  <title>Главная · Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-md p-8">
  <h1 class="text-2xl font-bold">Главная</h1>
  <p class="mt-2 text-gray-500">Привет, {data.user.username} 🦫</p>

  <h2 class="mt-6 mb-2 text-sm font-medium text-gray-600">Мои юниты</h2>
  {#if units.length === 0}
    <p class="text-sm text-gray-400">Юнитов нет</p>
  {:else}
    <ul class="space-y-2">
      {#each units as u (u.id)}
        <li class="flex items-center justify-between rounded border p-3 text-sm">
          <span>
            <b>#{u.id}</b> · {u.rarity} · lvl {u.level}
            <span class="text-gray-400">({u.status})</span>
          </span>
          <span class="font-medium">{u.balanceSol.toFixed(2)} SOL</span>
        </li>
      {/each}
    </ul>
  {/if}
</main>
