<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Главная · Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-md p-8">
  <h1 class="text-2xl font-bold">Главная</h1>
  <p class="mt-2 text-gray-500">Привет, {data.user.username} 🦫</p>
</main>
