<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { UnitRarity } from '@capyberries/shared';

  let {
    rarity,
    children,
    ...other
  }: {
    rarity: UnitRarity;
    children: Snippet;
    class?: string;
  } = $props();
</script>

<figure class="bg-linear-to-b rarity-{rarity} rounded-lg p-0.5">
  <div class="frame-inner relative flex flex-col rounded-md bg-white px-2 {other.class}">
    {@render children()}
  </div>
</figure>

<style>
  @reference "#theme.css";

  .rarity-base {
    @apply from-slate-300 via-slate-300 to-slate-400;
  }
  .rarity-uncommon {
    @apply from-lime-300 via-lime-300 to-lime-500;
  }
  .rarity-rare {
    @apply from-blue-300 via-blue-300 to-blue-500;
  }
  .rarity-epic {
    @apply from-amber-300 via-amber-300 to-amber-500;
  }
  .rarity-legendary {
    @apply from-purple-300 via-purple-300 to-purple-500;
  }
</style>
