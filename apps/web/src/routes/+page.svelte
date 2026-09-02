<script lang="ts">
  import type { Item } from '@capyberries/shared';

  type Me = { id: number; username: string; balance: number; balanceSol: number };
  type Unit = { id: number; level: number; rarity: string; status: string; balanceSol: number };

  let me = $state<Me | null>(null);
  let myUnits = $state<Unit[]>([]);
  let authLoading = $state(true);

  let items = $state<Item[]>([]);
  let title = $state('');
  let itemsError = $state<string | null>(null);

  async function loadMe() {
    authLoading = true;
    try {
      const res = await fetch('/api/auth/me');
      me = res.ok ? await res.json() : null;
      myUnits = me
        ? await fetch('/api/me/units').then((r) => (r.ok ? r.json() : []))
        : [];
    } catch {
      me = null;
    }
    authLoading = false;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    me = null;
    myUnits = [];
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

  {#if authLoading}
    <p class="text-gray-400">Загрузка…</p>
  {:else if !me}
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
