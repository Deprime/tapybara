<script lang="ts">
  // Components
  import { UButton } from '$lib/components/ui';

  // API
  import managerApi, { type ManagerUserListItem } from '$lib/api/manager';

  let users = $state<ManagerUserListItem[]>([]);
  let usersError = $state<string | null>(null);
  let pendingId = $state<number | null>(null);
  let createdNames = $state<Record<number, string>>({});

  async function loadUsers() {
    usersError = null;
    try {
      users = await managerApi.users();
    } catch {
      usersError = 'Не удалось загрузить пользователей.';
    }
  }

  async function createUnit(user: ManagerUserListItem) {
    pendingId = user.id;
    usersError = null;
    try {
      const unit = await managerApi.createUnit(user.id);
      createdNames[user.id] = unit.name;
    } catch {
      usersError = `Не удалось создать юнит для ${user.username}.`;
    } finally {
      pendingId = null;
    }
  }

  loadUsers();
</script>

<svelte:head>
  <title>Пользователи · Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-xl p-4">
  <h1 class="text-2xl font-bold">Пользователи</h1>

  {#if usersError}
    <p class="mt-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">{usersError}</p>
  {:else if users.length === 0}
    <p class="mt-2 text-sm text-gray-400">Пользователей нет</p>
  {:else}
    <ul class="mt-4 space-y-2">
      {#each users as user (user.id)}
        <li
          class="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white p-3 text-sm"
        >
          <span class="min-w-0">
            <b class="block truncate">{user.username}</b>
            <span class="text-xs text-gray-400">{user.telegram_id}</span>
          </span>
          <span class="flex items-center gap-2 whitespace-nowrap">
            {#if createdNames[user.id]}
              <span class="text-xs text-green-600">✓ {createdNames[user.id]}</span>
            {/if}
            <span class="flex items-center gap-1 font-bold text-amber-700">
              {user.balance_sol.toFixed(2)}
              <img src="/solberry.png" alt="SOL" class="size-6" />
            </span>
            <UButton size="sm" loading={pendingId === user.id} onclick={() => createUnit(user)}>
              + Капибара
            </UButton>
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</main>
