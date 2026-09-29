<script lang="ts">
  // Components
  import { UnitFrame, RarityLabel } from '$lib/components/shared';

  // Stores
  import userStore from '$lib/stores/user';
  import unitsStore from '$lib/stores/units';
</script>

<svelte:head>
  <title>Главная · Capyberries</title>
</svelte:head>

<main class="mx-auto max-w-7xl py-4">
  <ul class="space-y-2">
    {#each $unitsStore as unit (unit.id)}
      <UnitFrame rarity={unit.rarity} class="pt-4 pb-1">
        <span>
          {unit.level}
        </span>

        <RarityLabel rarity={unit.rarity}>
          {unit.rarity}
        </RarityLabel>

        <span>
          {unit.name}
        </span>
        <span>
          {unit.status}
        </span>
        <span class="font-medium">{unit.balance_sol.toFixed(2)} SOL</span>

        <img
          src="/skins/{unit.skin_uuid}.png"
          alt="Скин юнита"
          class="relative z-1 mx-auto size-full min-h-20 object-contain"
          loading="lazy"
        />
      </UnitFrame>
    {/each}
  </ul>
</main>
