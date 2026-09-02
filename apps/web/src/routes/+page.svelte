<script lang="ts">
  import type { Item } from '@capyberries/shared';

  let items = $state<Item[]>([]);
  let title = $state('');
  let dbAvailable = $state<boolean | null>(null);
  let error = $state<string | null>(null);

  async function load() {
    error = null;
    try {
      const health = await fetch('/api/health').then((r) => r.json());
      dbAvailable = health.database === 'connected';
      if (!dbAvailable) return;
      items = await fetch('/api/items').then((r) => r.json());
    } catch (e) {
      error = e instanceof Error ? e.message : 'API недоступен';
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
    await load();
  }

  async function toggle(item: Item) {
    await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ done: !item.done })
    });
    await load();
  }

  async function remove(item: Item) {
    await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
    await load();
  }

  load();
</script>

<svelte:head>
  <title>Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-md p-8">
  <h1 class="mb-4 text-2xl font-bold">🦫 Capyberries</h1>

  {#if error}
    <p class="rounded bg-red-100 p-3 text-red-700">{error}</p>
  {:else if dbAvailable === false}
    <p class="rounded bg-yellow-100 p-3 text-yellow-800">
      Сервер работает, но БД недоступна. Проверьте DATABASE_URL и запустите миграции.
    </p>
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
</main>
