<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { fly } from 'svelte/transition';
  import { useDebounce } from 'runed';
  import useEmblaCarousel from 'embla-carousel-svelte';
  import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';

  import {
    getUnitParams,
    getAccruedPoints,
    getCollectableClicks,
    getPeriodSeconds,
    EXP_PER_CLICK,
    getNextHarvestAt
  } from '@capyberries/shared';

  // Components
  import InfoIcon from '@lucide/svelte/icons/info';
  import RocketIcon from '@lucide/svelte/icons/rocket';
  import { UnitFrame, RarityLabel } from '$lib/components/shared';
  import { UButton } from '$lib/components/ui';
  import UnitSlide from '$lib/modules/home/components/UnitSlide.svelte';
  import PrePartyStateAnimation from '$lib/modules/home/components/PrePartyStateAnimation.svelte';

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

  const animatedBalance = new Tween(0, {
    duration: 250
  });

  // Live clock (unix seconds) so the stack counter accrues in real time
  let now = $state(Math.floor(Date.now() / 1000));
  $effect(() => {
    const timer = setInterval(() => (now = Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  });

  $effect(() => {
    if (activeUnit) {
      animatedBalance.set(activeUnit.balance_sol);
    }
  });

  // Click collection: each tap applies the server's collect math for one
  // click to the store right away and buffers its timestamp; after a pause
  // one collect request per unit goes out and the response syncs the store
  const clickBuffer = $state(new Map<number, number[]>());

  /**
   * Points ready to click off (harvest_at in the store is optimistic).
   */
  const availableStacks = (unit: UnitListItem) => {
    if (unit.status !== 'harvest') return 0;
    const params = getUnitParams(unit.rarity, unit.level);
    return getAccruedPoints(params, unit.harvest_at, now);
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
   * Level progress in %: current exp toward the exp required for the next level.
   */
  const levelProgressWidth = (unit: UnitListItem) => {
    const required = getUnitParams(unit.rarity, unit.level).exp_to_next_level;
    if (required === null) return 100; // max level — nothing left to progress
    return (unit.exp / required) * 100;
  };

  /** Restore the server truth when a flush fails or is rejected. */
  const resyncStore = async () => {
    try {
      unitsStore.set(await unitsApi.list());
    } catch {
      // offline: a later successful sync will restore the server truth
    }
  };

  const runFlush = async () => {
    const entries = [...clickBuffer.entries()];
    clickBuffer.clear();
    for (const [unit_id, clicks] of entries) {
      try {
        unitsStore.set(await unitsApi.collect(unit_id, clicks));
      } catch (error) {
        console.error('Failed to collect clicks', error);
        // the optimistic store is now ahead of the server — roll it back
        await resyncStore();
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
    if (getCollectableClicks(params, unit.harvest_at, now, 1) <= 0) return;

    // Apply the server's collect math for one click to the store right away
    // so stacks, exp and SOL react instantly; the flushed response syncs it
    unitsStore.update((units) =>
      units.map((u) => {
        if (u.id !== unit.id) return u;
        const exp =
          params.exp_to_next_level === null
            ? u.exp
            : Math.min(u.exp + EXP_PER_CLICK, params.exp_to_next_level);
        return {
          ...u,
          harvest_at: getNextHarvestAt(params, u.harvest_at, now, 1),
          balance_sol: Math.round((u.balance_sol + params.reward_per_point) * 100) / 100,
          exp,
          // exp full → the unit leaves harvest, mirroring the server
          status:
            params.exp_to_next_level !== null && exp >= params.exp_to_next_level
              ? 'pre_party'
              : u.status
        };
      })
    );

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

<main class="relative mx-auto flex h-full min-h-0 max-w-7xl flex-col items-center gap-4">
  <div class="fixed mt-26 flex h-84 w-8/12 min-w-64 flex-col gap-1">
    <UnitFrame rarity={activeUnit?.rarity ?? 'common'} class="h-84 w-full py-5">
      {#if activeUnit}
        <RarityLabel rarity={activeUnit.rarity} class="absolute top-2 right-3">
          {activeUnit.rarity}
        </RarityLabel>

        <span class="absolute top-1 left-2 flex items-center gap-1">
          <img src="/solberry.png" alt="solberry" class="size-5 object-contain" />
          <span class="font-secondary text-xs font-bold text-amber-700">
            {animatedBalance.current.toFixed(2)}
          </span>
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
      <footer class="flex h-7 w-full items-center gap-0.5 rounded-lg bg-gray-400 p-0.5">
        {#if activeUnit.status === 'harvest'}
          <div
            class="flex h-7 w-full items-center gap-0.5"
            in:fly={{ duration: 300, y: 5, opacity: 0 }}
          >
            {#each Array.from({ length: activeUnitParams.max_stack }), index (index)}
              <div class="h-6 w-full overflow-hidden rounded-lg bg-slate-50">
                <div
                  id="stack-indicator-{index}"
                  class="h-full rounded bg-purple-500 transition-[width] duration-300 {100 <=
                  stackSegmentWidth(activeUnit, index)
                    ? 'opacity-100'
                    : 'opacity-75'}"
                  style="width: {stackSegmentWidth(activeUnit, index)}%"
                ></div>
              </div>
            {/each}
          </div>
        {/if}
        {#if activeUnit.status === 'pre_party'}
          <div
            class="flex h-6 w-full items-center justify-center rounded-lg bg-white"
            in:fly={{ duration: 300, y: 5, opacity: 0 }}
          >
            <span class="font-secondary text-sm font-bold text-slate-700 uppercase">
              Готов потусить
            </span>
          </div>
        {/if}
      </footer>
    {/if}
  </div>

  <div class="flex h-full min-h-0 flex-col pt-32">
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
    <div
      class="relative h-24 overflow-hidden rounded-xl bg-white shadow-lg ring-2 transition-all duration-300 ease-linear"
      class:ring-slate-300={activeUnit?.status === 'harvest'}
      class:ring-purple-400={activeUnit?.status === 'pre_party'}
    >
      {#if activeUnit?.status === 'pre_party'}
        <PrePartyStateAnimation />
      {/if}
      <div class="absolute inset-0 flex h-full w-full gap-4 p-4">
        <UButton class="w-full gap-2">
          <InfoIcon size={16} /> <span> Info </span>
        </UButton>
        <UButton class="w-full gap-2" variant="secondary">
          <RocketIcon size={16} /> <span>Boost</span>
        </UButton>
      </div>
    </div>
  </div>
</main>

<style>
  .embla {
    max-width: 48rem;
    margin-inline: auto;
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
