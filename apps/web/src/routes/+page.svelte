<script lang="ts">
  import type { Item } from '@capyberries/shared';
  import userStore from '$lib/stores/user';
  import unitsStore from '$lib/stores/units';
  import referralsStore from '$lib/stores/referrals';
  import authApi from '$lib/api/auth';
  import itemsApi from '$lib/api/items';

  import { UButton } from '$lib/components/ui';

  let items = $state<Item[]>([]);
  let title = $state('');
  let itemsError = $state<string | null>(null);

  const me = $derived($userStore);
  const myUnits = $derived($unitsStore);

  async function logout() {
    await authApi.logout().catch(() => {});
    userStore.clear();
    unitsStore.clear();
    referralsStore.clear();
  }

  async function loadItems() {
    itemsError = null;
    try {
      items = await itemsApi.list();
    } catch {
      itemsError = 'Не удалось загрузить демо-список (нет соединения с API).';
    }
  }

  async function add(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await itemsApi.create({ title: title.trim() });
    title = '';
    await loadItems();
  }

  async function toggle(item: Item) {
    await itemsApi.update(item.id, { done: !item.done });
    await loadItems();
  }

  async function remove(item: Item) {
    await itemsApi.remove(item.id);
    await loadItems();
  }

  loadItems();
</script>

<svelte:head>
  <title>Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-md p-4">
  <h3 class="h1">🦫 Capyberries</h3>
  <h3 class="h2">🦫 Capyberries</h3>
  <h3 class="h3">🦫 Capyberries</h3>
  <h3 class="h4">🦫 Capyberries</h3>
  <h3 class="h5">🦫 Capyberries</h3>

  {#if me}
    <section class="mt-6 mb-8 rounded border p-4">
      <div class="mb-2 flex items-center justify-between">
        <p class="font-medium">{me.username}</p>
        <button class="text-sm text-red-500 hover:underline" onclick={logout}>Выйти</button>
      </div>

      <p class="text-xl">😒1</p>
      <div class="flex gap-4 text-sm">
        <span>💰 Баланс: <b>{me.balance.toFixed(2)}</b></span>
        <span>🪙 SOL: <b>{me.balance_sol.toFixed(2)}</b></span>
      </div>

      <p class="mt-3 mb-1 text-sm font-medium text-gray-600">Юниты</p>
      {#if myUnits.length === 0}
        <p class="text-sm text-gray-400">Юнитов нет</p>
      {:else}
        <ul class="space-y-1 text-sm">
          {#each myUnits as u (u.id)}
            <li>
              #{u.id} · {u.rarity} · lvl {u.level} · {u.status} — {u.balance_sol.toFixed(2)} SOL
            </li>
          {/each}
        </ul>
      {/if}

      <footer class="flex items-center gap-2">
        <UButton size="sm">Claim</UButton>
        <UButton size="md">Claim</UButton>
        <UButton size="lg">Claim</UButton>
      </footer>

      <footer class="flex items-center gap-2">
        <UButton size="sm" variant="secondary">Claim</UButton>
        <UButton size="md" variant="secondary">Claim</UButton>
        <UButton size="lg" variant="secondary">Claim</UButton>
      </footer>
    </section>
  {:else}
    <p class="mt-6 mb-8 text-sm text-gray-500">Не авторизован — войдите через бота.</p>
  {/if}

  <section>
    <h2 class="mb-2 text-sm font-medium text-gray-600">Демо-список (REST API)</h2>
    {#if itemsError}
      <p class="rounded bg-yellow-100 p-3 text-sm text-yellow-800">{itemsError}</p>
    {:else}
      <form class="mb-4 flex gap-2" onsubmit={add}>
        <input
          class="flex-1 rounded border px-3 py-2"
          placeholder="Новый пункт..."
          bind:value={title}
        />
        <button class="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Добавить</button>
      </form>

      <ul class="space-y-2">
        {#each items as item (item.id)}
          <li class="flex items-center gap-2 rounded border p-2">
            <input type="checkbox" checked={item.done} onchange={() => toggle(item)} />
            <span class="flex-1 {item.done ? 'text-gray-400 line-through' : ''}">{item.title}</span>
            <button class="text-red-500" onclick={() => remove(item)} aria-label="Удалить">✕</button
            >
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</main>
