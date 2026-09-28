<script lang="ts">
  // Components
  import Navigation from '$lib/components/structure/navigation/Navigation.svelte';
  import Header from '$lib/components/structure/header/Header.svelte';

  // Types
  import type { LayoutProps } from './$types';

  // Props
  let { children }: LayoutProps = $props();
</script>

<main class="flex h-screen flex-col">
  <Header />
  <div class="min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
    {@render children()}
  </div>
  <Navigation />
</main>
