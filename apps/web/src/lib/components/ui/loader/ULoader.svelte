<script lang="ts">
  // Types
  import type { ULoaderProps } from './types';

  // Props
  let { size = 'md', variant = 'green', ...other }: ULoaderProps = $props();

  let cssClass = $derived.by(() => {
    return [
      `ui-loader`,
      `ui-loader--variant-${variant}`,
      `ui-loader--size-${size}`,
      other.class ? other.class : ''
    ];
  });
</script>

<figure class={cssClass} aria-live="polite" aria-busy="true"></figure>
