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

<span
  class="rarity-{rarity} inline-flex font-secondary text-xs font-bold text-gray-500 uppercase {other.class}"
>
  {@render children()}
</span>

<style>
  @reference "#theme.css";

  .rarity-base {
    @apply text-slate-500;
  }
  .rarity-uncommon {
    @apply text-lime-700;
  }
  .rarity-rare {
    @apply text-blue-600;
  }
  .rarity-epic {
    @apply text-amber-600;
  }
  .rarity-legendary {
    @apply font-black text-purple-600;
  }
</style>
