<script lang="ts">
  import { page } from '$app/state';

  let { children } = $props();

  const links = [
    { href: '/app/home', label: 'Главная' },
    { href: '/app/profile', label: 'Профиль' },
    { href: '/app/friends', label: 'Друзья' },
    { href: '/app/loot', label: 'Лут' }
  ];
</script>

<div class="min-h-screen">
  <nav class="border-b bg-white">
    <div class="mx-auto flex max-w-md gap-4 px-8 py-3">
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
  </nav>
  {@render children()}
</div>
