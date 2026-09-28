<script lang="ts">
  import { page } from '$app/state';

  // Components
  import UserGroupIcon from '@lucide/svelte/icons/user-group';
  import WalletIcon from '@lucide/svelte/icons/wallet';
  import GemIcon from '@lucide/svelte/icons/gem';

  // Data
  const NAVS = [
    {
      label: 'Профиль',
      href: '/profile',
      key: 'profile',
      active: false,
      icon: WalletIcon
    },
    {
      label: 'Мани',
      href: '/home',
      key: 'home',
      active: false,
      icon: GemIcon
    },
    {
      label: 'Друзья',
      href: '/friends',
      key: 'friends',
      active: false,
      icon: UserGroupIcon
    }
  ];

  let navs = $derived(
    NAVS.map((nav) => ({
      ...nav,
      active: nav.href === page.url.pathname
    }))
  );
</script>

<nav
  class="fixed right-0 bottom-0 left-0 h-(--footer-height) w-full bg-linear-to-b from-transparent to-slate-200 pt-1"
>
  <ul
    class="mx-auto flex w-fit items-center justify-between rounded-2xl bg-white/50 shadow-lg ring-2 ring-white backdrop-blur-sm"
  >
    {#each navs as nav}
      <li class="w-full p-1">
        <a
          href={nav.href}
          class="flex w-22 flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors"
          class:text-slate-500={!nav.active}
          class:text-indigo-700={nav.active}
          class:bg-white={nav.active}
        >
          <nav.icon size={22} />
          <span class="text-xs/tight font-medium">{nav.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
