<script lang="ts">
  // Stores
  import userStore from '$lib/stores/user';
  import unitsStore from '$lib/stores/units';
</script>

<svelte:head>
  <title>Главная · Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-md p-8">
  <h1 class="text-2xl font-bold">Главная</h1>
  <p class="mt-2 text-gray-500">Привет, {$userStore?.username} 🦫</p>

  <h2 class="mt-6 mb-2 text-sm font-medium text-gray-600">Мои юниты</h2>
  {#if $unitsStore.length === 0}
    <p class="text-sm text-gray-400">Юнитов нет</p>
  {:else}
    <ul class="space-y-2">
      {#each $unitsStore as u (u.id)}
        <li class="flex items-center justify-between rounded border p-3 text-sm">
          <span>
            <b>{u.name}</b> · {u.rarity} · lvl {u.level}
            <span class="text-gray-400">({u.status})</span>
          </span>
          <span class="font-medium">{u.balanceSol.toFixed(2)} SOL</span>
        </li>
      {/each}
    </ul>
  {/if}
</main>
