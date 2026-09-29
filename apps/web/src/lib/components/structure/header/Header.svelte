<script lang="ts">
  // import { page } from '$app/state';
  import userStore from '$lib/stores/user';
</script>

<header
  class="flex h-(--header-height) w-full shrink-0 items-center justify-between px-4 ring-1 ring-slate-200"
>
  <div class="flex items-center gap-2">
    <figure class="size-10 rounded-full bg-amber-100">
      <img
        src="/avatar.png"
        alt="Avatar"
        class="size-full rounded-full object-contain ring-1 ring-slate-400"
      />
    </figure>
  </div>

  <div class="flex items-center gap-2">
    {#if $userStore}
      <div class="flex items-center gap-1 rounded-full bg-amber-200 py-1 pr-3 pl-2">
        <img src="/solberry.png" alt="Solana" class="size-6 object-contain" />
        <span class="font-secondary text-sm font-bold text-amber-700">
          {$userStore.balance_sol}
        </span>
      </div>
    {/if}
  </div>
</header>
