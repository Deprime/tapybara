<script lang="ts">
  // Components
  import ULoader from '$lib/components/ui/loader/ULoader.svelte';

  // Types
  import type { ButtonProps } from './types';

  // Props
  let {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    ref = $bindable(),
    type = 'button',
    ...other
  }: ButtonProps = $props();

  let classes = $derived.by(() => {
    return [
      `ui-button`,
      `ui-button--variant-${variant}`,
      `ui-button--size-${size}`,
      loading ? 'ui-button--loading text-transparent!' : '',
      other.class ? other.class : ''
    ];
  });
</script>

<button {type} {...other} class={classes} bind:this={ref}>
  {@render children()}
  {#if loading}
    <ULoader
      size="sm"
      variant={['primary'].includes(variant) ? 'black' : 'green'}
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    />
  {/if}
</button>
