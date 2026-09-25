<script lang="ts">
  import type { Item } from '@capyberries/shared';
  import { userStore, unitsStore, referralsStore, type UnitDto } from '$lib/stores';

  let items = $state<Item[]>([]);
  let title = $state('');
  let itemsError = $state<string | null>(null);

  const me = $derived($userStore);
  const myUnits = $derived<UnitDto[]>($unitsStore);

  async function loadMe() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        userStore.set(await res.json());
        const unitsRes = await fetch('/api/units');
        unitsStore.set(unitsRes.ok ? await unitsRes.json() : []);
      } else {
        userStore.clear();
        unitsStore.clear();
      }
    } catch {
      userStore.clear();
      unitsStore.clear();
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    userStore.clear();
    unitsStore.clear();
    referralsStore.clear();
  }

  async function loadItems() {
    itemsError = null;
    try {
      items = await fetch('/api/items').then((r) => r.json());
    } catch {
      itemsError = 'Не удалось загрузить демо-список (нет соединения с API).';
    }
  }

  async function add(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: title.trim() })
    });
    title = '';
    await loadItems();
  }

  async function toggle(item: Item) {
    await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ done: !item.done })
    });
    await loadItems();
  }

  async function remove(item: Item) {
    await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
    await loadItems();
  }

  loadMe();
  loadItems();
</script>

<svelte:head>
  <title>Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-md p-8">
  <h1 class="mb-4 text-2xl font-bold">🦫 Capyberries</h1>

  {#if me === null}
    <div class="rounded border p-4 text-center">
      <p class="mb-1 font-medium">Не авторизован</p>
      <p class="text-sm text-gray-500">
        Войдите через Telegram-бота: отправьте ему команду <code>/login</code> и перейдите по ссылке.
      </p>
    </div>
  {:else}
    <section class="mb-8 rounded border p-4">
      <div class="mb-2 flex items-center justify-between">
        <p class="font-medium">{me.username}</p>
        <button class="text-sm text-red-500 hover:underline" onclick={logout}>Выйти</button>
      </div>
      <div class="flex gap-4 text-sm">
        <span>💰 Баланс: <b>{me.balance.toFixed(2)}</b></span>
        <span>🪙 SOL: <b>{me.balanceSol.toFixed(2)}</b></span>
      </div>

      <p class="mt-3 mb-1 text-sm font-medium text-gray-600">Юниты</p>
      {#if myUnits.length === 0}
        <p class="text-sm text-gray-400">Юнитов нет</p>
      {:else}
        <ul class="space-y-1 text-sm">
          {#each myUnits as u (u.id)}
            <li>#{u.id} · {u.rarity} · lvl {u.level} · {u.status} — {u.balanceSol.toFixed(2)} SOL</li>
          {/each}
        </ul>
      {/if}

      <a
        href="/app/home"
        class="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        Перейти в приложение →
      </a>
    </section>
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
            <span class="flex-1 {item.done ? 'line-through text-gray-400' : ''}">{item.title}</span>
            <button class="text-red-500" onclick={() => remove(item)} aria-label="Удалить">✕</button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</main>
