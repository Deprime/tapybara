<script lang="ts">
  import { onDestroy } from 'svelte';
  import { useDebounce } from 'runed';
  import useEmblaCarousel from 'embla-carousel-svelte';
  import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';

  import {
    getUnitParams,
    getAccruedPoints,
    getCollectableClicks,
    getPeriodSeconds
  } from '@capyberries/shared';

  // Components

  import InfoIcon from '@lucide/svelte/icons/info';
  import RocketIcon from '@lucide/svelte/icons/rocket';
  import { UnitFrame, RarityLabel } from '$lib/components/shared';
  import { UButton } from '$lib/components/ui';
  import UnitSlide from '$lib/modules/home/components/UnitSlide.svelte';

  // Stores
  // import userStore from '$lib/stores/user';
  import unitsStore from '$lib/stores/units';
  import unitsApi, { type UnitListItem } from '$lib/api/units';

  // Data
  let emblaApi: EmblaCarouselType | undefined = $state(undefined);
  let options: EmblaOptionsType = {
    loop: false,
    align: 'center',
    containScroll: false,
    skipSnaps: true
  };
  let activeIndex = $state(0);
  let activeUnit = $derived($unitsStore[activeIndex] ?? null);
  let activeUnitParams = $derived(
    activeUnit ? getUnitParams(activeUnit.rarity, activeUnit.level) : null
  );

  // Live clock (unix seconds) so the stack counter accrues in real time
  let now = $state(Math.floor(Date.now() / 1000));
  $effect(() => {
    const timer = setInterval(() => (now = Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  });

  // Click collection: taps buffer timestamps; after a pause one collect
  // request per unit goes out, and its clicks stay counted as in flight
  // until the store is refreshed with the server response
  const clickBuffer = $state(new Map<number, number[]>());
  const inflightClicks = $state(new Map<number, number>());

  /** Clicks taken from the stack but not yet confirmed by the server. */
  const pendingCount = (unit_id: number) =>
    (clickBuffer.get(unit_id)?.length ?? 0) + (inflightClicks.get(unit_id) ?? 0);

  /**
   * Points ready to click off, minus pending clicks.
   */
  const availableStacks = (unit: UnitListItem) => {
    if (unit.status !== 'harvest') return 0;
    const params = getUnitParams(unit.rarity, unit.level);
    return Math.max(0, getAccruedPoints(params, unit.harvest_at, now) - pendingCount(unit.id));
  };

  /**
   * Fraction of the accruing segment already earned, 0..1.
   */
  const stackProgress = (unit: UnitListItem) => {
    if (unit.status !== 'harvest') return 0;
    const params = getUnitParams(unit.rarity, unit.level);
    const period = getPeriodSeconds(params);
    return (Math.max(0, now - unit.harvest_at) % period) / period;
  };

  /**
   * Per-segment fill in %: full for ready stacks, partial for the accruing one.
   */
  const stackSegmentWidth = (unit: UnitListItem, index: number) => {
    const available = availableStacks(unit);
    if (index < available) return 100;
    if (index === available) return stackProgress(unit) * 100;
    return 0;
  };

  /**
   * SOL earned by pending clicks, shown live before the server confirms.
   */
  const pendingSol = (unit: UnitListItem) => {
    const pending = pendingCount(unit.id);
    return pending === 0 ? 0 : pending * getUnitParams(unit.rarity, unit.level).reward_per_point;
  };

  /**
   * Level progress in %: current exp (plus pending clicks, live) toward
   * the exp required for the next level.
   */
  const levelProgressWidth = (unit: UnitListItem) => {
    const required = getUnitParams(unit.rarity, unit.level).exp_to_next_level;
    if (required === null) return 100; // max level — nothing left to progress
    const exp = Math.min(unit.exp + pendingCount(unit.id), required);
    return (exp / required) * 100;
  };

  const runFlush = async () => {
    const entries = [...clickBuffer.entries()];
    clickBuffer.clear();
    for (const [unit_id, clicks] of entries) {
      inflightClicks.set(unit_id, (inflightClicks.get(unit_id) ?? 0) + clicks.length);
    }
    for (const [unit_id, clicks] of entries) {
      try {
        unitsStore.set(await unitsApi.collect(unit_id, clicks));
      } catch (error) {
        console.error('Failed to collect clicks', error);
      } finally {
        // success: the refreshed store already counts these clicks;
        // failure: they are lost — release them either way
        const rest = (inflightClicks.get(unit_id) ?? 0) - clicks.length;
        if (rest > 0) inflightClicks.set(unit_id, rest);
        else inflightClicks.delete(unit_id);
      }
    }
  };

  // Serialize flushes so overlapping batches never race on the server
  let flushChain: Promise<void> = Promise.resolve();
  const flushClicks = () => {
    flushChain = flushChain.then(runFlush).catch(() => {});
    return flushChain;
  };

  const debouncedFlush = useDebounce(flushClicks, 600);

  // Methods
  const onInit = (event: CustomEvent<EmblaCarouselType>) => {
    const api = event.detail;
    emblaApi = api;
    api.on('select', () => {
      activeIndex = api.selectedScrollSnap();
    });
  };

  /**
   * Handle unit click
   * @param index
   */
  const onUnitClick = (index: number) => {
    const unit = $unitsStore[index];
    if (!unit || unit.status !== 'harvest') return;

    const params = getUnitParams(unit.rarity, unit.level);
    if (getCollectableClicks(params, unit.harvest_at, now, pendingCount(unit.id) + 1) <= 0) return;

    const clicks = clickBuffer.get(unit.id) ?? [];
    clicks.push(Date.now());
    clickBuffer.set(unit.id, clicks);
    debouncedFlush();
  };

  onDestroy(() => {
    debouncedFlush.cancel();
    if (clickBuffer.size > 0) void flushClicks();
  });
</script>

<main
  class="relative mx-auto flex h-full min-h-0 max-w-7xl flex-col items-center justify-center gap-4"
>
  <div class="fixed -mt-24 flex h-84 w-8/12 min-w-64 flex-col gap-1">
    <UnitFrame rarity={activeUnit?.rarity ?? 'common'} class="h-84 w-full py-5">
      {#if activeUnit}
        <RarityLabel rarity={activeUnit.rarity} class="absolute top-2 right-3">
          {activeUnit.rarity}
        </RarityLabel>

        <span
          class="absolute top-1 left-2 flex items-center gap-1 font-secondary text-xs font-bold text-amber-700"
        >
          <img src="/solberry.png" alt="Solana" class="size-6 object-contain" />
          {(activeUnit.balance_sol + pendingSol(activeUnit)).toFixed(2)}
        </span>
      {/if}

      {#if activeUnit}
        <div
          class="absolute bottom-0 left-0 flex w-full justify-between overflow-hidden rounded-b-md"
        >
          <div
            class="relative z-2 flex h-5 w-10 items-center justify-center rounded-tr-md rounded-bl-md border-r border-slate-400 bg-slate-300 font-secondary text-xs font-bold text-slate-700"
          >
            Lvl {activeUnit.level}
          </div>
          <div class="absolute right-0 left-9.5 h-5 bg-slate-200">
            <div
              id="level-progress"
              class="h-full bg-linear-to-r from-amber-300 to-amber-400 transition-[width] duration-300 ease-linear"
              style="width: {levelProgressWidth(activeUnit)}%"
            ></div>
          </div>
        </div>
      {/if}
    </UnitFrame>

    {#if activeUnit && activeUnitParams}
      {#key activeUnit.id}
        <footer class="flex w-full items-center gap-0.5 rounded-lg bg-slate-300 p-0.75">
          {#each Array.from({ length: activeUnitParams.max_stack }), index (index)}
            <div class="h-4 w-full overflow-hidden rounded-md bg-slate-400">
              <div
                id="stack-indicator-{index}"
                class="h-full rounded-md transition-[width] duration-300 ease-linear"
                class:bg-yellow-200={100 > stackSegmentWidth(activeUnit, index)}
                class:bg-yellow-300={100 <= stackSegmentWidth(activeUnit, index)}
                style="width: {stackSegmentWidth(activeUnit, index)}%"
              ></div>
            </div>
          {/each}
        </footer>
      {/key}
    {/if}
  </div>
  <div class="flex h-full min-h-0 flex-col">
    <div class="embla">
      <div
        class="embla__viewport"
        onemblaInit={onInit}
        use:useEmblaCarousel={{ options, plugins: [] }}
      >
        <div class="embla__container">
          {#each $unitsStore as unit, index (unit.id)}
            <div class="embla__slide">
              <UnitSlide
                {unit}
                {index}
                {activeIndex}
                onclick={() => {
                  onUnitClick(index);
                }}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="w-full px-6 pb-8">
    <div class="flex gap-4 rounded-xl bg-white p-4 shadow-lg">
      <UButton class="w-full gap-2">
        <InfoIcon size={16} /> <span> Info </span>
      </UButton>
      <UButton class="w-full gap-2" variant="secondary">
        <RocketIcon size={16} /> <span>Boost</span>
      </UButton>
    </div>
  </div>
</main>

<style>
  .embla {
    max-width: 48rem;
    margin: auto;
  }

  .embla__viewport {
    overflow: hidden;
  }

  .embla__container {
    display: flex;
    touch-action: pan-y pinch-zoom;
  }

  .embla__slide {
    flex: 0 0 65%;
    min-width: 0;
  }
</style>
