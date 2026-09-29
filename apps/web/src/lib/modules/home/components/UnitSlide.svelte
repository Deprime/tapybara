<script lang="ts">
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

  // Methods
  const onClick = () => {
    if (disabled) return;
    onclick();
  };
</script>

<div
  class="size-full transition-all duration-200 select-none"
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
