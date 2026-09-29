<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Stores
  import userStore from '$lib/stores/user';
  import unitsStore from '$lib/stores/units';

  function getTotalBalance() {
    if (!$userStore) return 0;
    const result =
      $unitsStore.reduce((acc, unit) => acc + (unit.balance_sol ?? 0), 0) + $userStore.balance_sol;
    return result.toFixed(2);
  }

  const animatedBalance = new Tween(getTotalBalance(), {
    duration: 400,
    easing: cubicOut
  });

  $effect(() => {
    if ($unitsStore.length > 0) {
      animatedBalance.set(getTotalBalance());
    }
  });
</script>

<header class="flex h-(--header-height) w-full shrink-0 items-center justify-between px-4">
  <div class="flex items-center gap-2">
    <figure class="size-9 rounded-full bg-amber-100">
      <img
        src="/avatar.png"
        alt="Avatar"
        class="size-full rounded-full object-contain ring-1 ring-slate-400"
      />
    </figure>

    <p class="font-secondary text-sm font-bold text-slate-600">
      {$userStore?.username}
    </p>
  </div>

  <div class="flex items-center gap-2">
    {#if $userStore}
      <div class="flex items-center gap-1 rounded-full bg-amber-200 py-1 pr-3 pl-2">
        <img src="/solberry.png" alt="Solana" class="size-6 object-contain" />
        <span class="font-secondary text-sm font-bold text-amber-700">
          {Number(animatedBalance.current).toFixed(2)}
        </span>
      </div>
    {/if}
  </div>
</header>
