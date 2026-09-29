<script lang="ts">
  import { onDestroy } from 'svelte';

  // Stores
  import type { UnitListItem } from '$lib/api/units';

  // Props
  let {
    unit,
    index,
    activeIndex,
    disabled = false,
    onclick
  }: {
    unit: UnitListItem;
    index: number;
    activeIndex: number;
    disabled?: boolean;
    onclick: () => void;
  } = $props();

  // Data
  let clicked = $state(false);
  let timeout = $state<NodeJS.Timeout | null>(null);

  // Methods
  const onClick = () => {
    if (disabled) return;
    clicked = true;
    onclick();
    timeout = setTimeout(() => {
      clicked = false;
    }, 200);
  };

  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
</script>

<div
  class="size-full transition-all duration-100 select-none {clicked ? 'scale-90' : ''}"
  class:grayscale-50={index !== activeIndex}
  class:scale-80={index !== activeIndex}
  class:ml-[-40px]={index === activeIndex + 1}
>
  <button type="button" class="size-full" {disabled} onclick={onClick}>
    <img
      src="/skins/{unit.skin_uuid}.png"
      alt={unit.skin_uuid}
      class="pointer-events-none relative z-1 mx-auto size-full min-h-20 object-contain select-none"
      loading="lazy"
    />
  </button>
</div>
