<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  const links = [
    { href: '/app/home', label: 'Главная' },
    { href: '/app/profile', label: 'Профиль' },
    { href: '/app/friends', label: 'Друзья' },
    { href: '/app/loot', label: 'Лут' }
  ];

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    goto('/');
  }
</script>

<div class="min-h-screen">
  <nav class="border-b bg-white">
    <div class="mx-auto flex max-w-md items-center justify-between px-8 py-3">
      <div class="flex gap-4">
        {#each links as link (link.href)}
          <a
            href={link.href}
            class={page.url.pathname === link.href
              ? 'font-semibold text-blue-600'
              : 'text-gray-500 hover:text-gray-900'}
          >
            {link.label}
          </a>
        {/each}
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-400">{data.user.username}</span>
        <button class="text-red-500 hover:underline" onclick={logout}>Выйти</button>
      </div>
    </div>
  </nav>
  {@render children()}
</div>
