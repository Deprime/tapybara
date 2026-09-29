<script lang="ts">
  import { page } from '$app/state';

  // Components
  import UserGroupIcon from '@lucide/svelte/icons/user-group';
  import WalletIcon from '@lucide/svelte/icons/wallet';
  import GemIcon from '@lucide/svelte/icons/gem';
  import PlayingCardsIcon from '@lucide/svelte/icons/playing-cards';
  import UsersIcon from '@lucide/svelte/icons/users';

  import userStore from '$lib/stores/user';

  // Data
  const NAVS = [
    {
      label: 'Skins',
      href: '/manage/skins',
      key: 'skins',
      active: false,
      icon: PlayingCardsIcon,
      admin: true
    },
    {
      label: 'Профиль',
      href: '/profile',
      key: 'profile',
      active: false,
      icon: WalletIcon,
      admin: false
    },
    {
      label: 'Мани',
      href: '/home',
      key: 'home',
      active: false,
      icon: GemIcon,
      admin: false
    },
    {
      label: 'Друзья',
      href: '/friends',
      key: 'friends',
      active: false,
      icon: UserGroupIcon,
      admin: false
    },
    {
      label: 'Users',
      href: '/manage/users',
      key: 'users',
      active: false,
      icon: UsersIcon,
      admin: true
    }
  ];

  let navs = $derived(
    NAVS.map((nav) => ({
      ...nav,
      active: nav.href === page.url.pathname
    })).filter((nav) => {
      if (nav.admin) {
        return $userStore?.role === 'admin';
      }
      return true;
    })
  );
</script>

<nav
  class="fixed right-0 bottom-0 left-0 z-10 h-(--footer-height) w-full bg-linear-to-b from-transparent to-slate-200 pt-1"
>
  <ul
    class="mx-auto flex w-fit items-center justify-between rounded-2xl bg-white/50 shadow-lg ring-2 ring-white backdrop-blur-sm"
  >
    {#each navs as nav}
      <li class="w-full p-1">
        <a
          href={nav.href}
          class="flex flex-col items-center justify-center rounded-xl py-1 transition-colors"
          class:w-17={navs.length === 5}
          class:w-22={navs.length !== 5}
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
