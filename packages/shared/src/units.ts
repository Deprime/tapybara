// Unit game balance: seeds per rarity + formulas that expand them per level.
// Shared between the server (harvest/click logic), the client (UI/timers) and the bot.

export const UNIT_RARITIES = ['base', 'uncommon', 'rare', 'epic', 'legendary'] as const;
export type UnitRarity = (typeof UNIT_RARITIES)[number];

export const MAX_UNIT_LEVEL = 5;

/** Unit lifecycle: harvest (accruing) → pre_party (exp full, choosing) → party (level-up in progress). */
export const UNIT_STATUSES = ['harvest', 'pre_party', 'party', 'staking'] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

/** Level-up process durations: 4h with a partner (invite link), 12h autonomous. */
export const PARTY_DURATION_COOP_SECONDS = 4 * 60 * 60;
export const PARTY_DURATION_SOLO_SECONDS = 12 * 60 * 60;

/** Every click gives exactly +1 exp, regardless of rarity and level. */
export const EXP_PER_CLICK = 1;

/**
 * Level-1 seeds per rarity. Everything else is derived by getUnitParams:
 * - minutes_per_point DROPS by 20s per level (higher levels accumulate faster);
 * - reward_per_point grows linearly with level and jumps with rarity;
 * - exp_to_next_level doubles every level;
 * - max_stack gets +1 every 2 levels (on top of the rarity seed).
 */
type RaritySeeds = {
  minutes_per_point: number;
  reward_per_point: number;
  exp_to_next_level: number;
  max_stack: number;
};

/**
 * max_stack seeds follow the rarity chain: each rarity's L1 = previous rarity's
 * L5 (seed + 2 from level steps) + 1 for the new rarity, i.e. +3 per tier:
 * base L5 = 7 → uncommon L1 = 8 → uncommon L5 = 10 → rare L1 = 11 → ...
 *
 * base exp_to_next_level is the onboarding tune: full stack of 5 points × 1 exp
 * per click × 4 visits = 20 exp → level 2. Upper rarities are tuned so that a
 * player visiting ~4 times a day reaches legendary L5 in about 4 months.
 */
export const UNIT_SEEDS: Record<UnitRarity, RaritySeeds> = {
  base: { minutes_per_point: 20, reward_per_point: 0.01, exp_to_next_level: 20, max_stack: 5 },
  uncommon: { minutes_per_point: 20, reward_per_point: 0.02, exp_to_next_level: 50, max_stack: 8 },
  rare: { minutes_per_point: 20, reward_per_point: 0.04, exp_to_next_level: 75, max_stack: 11 },
  epic: { minutes_per_point: 20, reward_per_point: 0.08, exp_to_next_level: 110, max_stack: 14 },
  legendary: { minutes_per_point: 20, reward_per_point: 0.16, exp_to_next_level: 160, max_stack: 17 }
};

export type UnitParams = {
  rarity: UnitRarity;
  level: number;
  /** Minutes to accumulate one point at this level. */
  minutes_per_point: number;
  /** SOL credited to balance_sol per clicked point. */
  reward_per_point: number;
  /** Max points held in the stack. */
  max_stack: number;
  /** Exp required to reach the next level; null at max level. */
  exp_to_next_level: number | null;
};

export function getUnitParams(rarity: UnitRarity, level: number): UnitParams {
  const seeds = UNIT_SEEDS[rarity];
  const lvl = Math.min(Math.max(1, Math.floor(level)), MAX_UNIT_LEVEL);
  const isMax = lvl === MAX_UNIT_LEVEL;

  return {
    rarity,
    level: lvl,
    // 20 minutes at L1, minus 20 seconds per level: 20:00 → 19:40 → … → 18:40
    minutes_per_point: (seeds.minutes_per_point * 60 - 20 * (lvl - 1)) / 60,
    reward_per_point: Math.round(seeds.reward_per_point * lvl * 100) / 100,
    max_stack: seeds.max_stack + Math.floor((lvl - 1) / 2),
    exp_to_next_level: isMax ? null : Math.round(seeds.exp_to_next_level * 2 ** (lvl - 1))
  };
}

/**
 * Points accumulated since harvest_at (unix seconds), capped by max_stack.
 * Fractional progress toward the next point is discarded.
 */
export function getAccruedPoints(params: UnitParams, harvest_at: number, now: number): number {
  const elapsedMinutes = Math.max(0, now - harvest_at) / 60;
  return Math.min(params.max_stack, Math.floor(elapsedMinutes / params.minutes_per_point));
}

/** Whole seconds per point at this level (integer, same rounding on client and server). */
export const getPeriodSeconds = (params: UnitParams) => Math.round(params.minutes_per_point * 60);

/**
 * How many of the requested clicks are actually allowed right now.
 * The single source of truth shared by the collect button and the server:
 * the server clamps the same way, so extra clicks cannot bypass the accrual cap.
 */
export const getCollectableClicks = (
  params: UnitParams,
  harvest_at: number,
  now: number,
  requested: number
): number => Math.min(requested, getAccruedPoints(params, harvest_at, now));

/**
 * harvest_at after `collected` points are clicked off the stack.
 * The stack remainder (accrued - collected) and the fractional progress
 * toward the next point both survive; only the time earned beyond the cap is
 * discarded. A plain `harvest_at + collected * period` is correct only while
 * the stack is uncapped — for a capped stack it would let the excess elapsed
 * time instantly refill the stack after harvest.
 */
export function getNextHarvestAt(
  params: UnitParams,
  harvest_at: number,
  now: number,
  collected: number
): number {
  const period = getPeriodSeconds(params);
  const accrued = getAccruedPoints(params, harvest_at, now);
  const remainder = Math.max(0, now - harvest_at) % period;
  return now - remainder - (accrued - collected) * period;
}
