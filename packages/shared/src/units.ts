// Unit game balance: seeds per rarity + formulas that expand them per level.
// Shared between the server (harvest/click logic), the client (UI/timers) and the bot.

export const UNIT_RARITIES = ['base', 'uncommon', 'rare', 'epic', 'legendary'] as const;
export type UnitRarity = (typeof UNIT_RARITIES)[number];

export const MAX_UNIT_LEVEL = 5;

/** Every click gives exactly +1 exp, regardless of rarity and level. */
export const EXP_PER_CLICK = 1;

/**
 * Level-1 seeds per rarity. Everything else is derived by getUnitParams:
 * - secondsPerPoint DROPS by 20s per level (higher levels accumulate faster);
 * - rewardPerPoint grows linearly with level and jumps with rarity;
 * - expToNextLevel doubles every level;
 * - maxStack gets +1 every 2 levels (on top of the rarity seed).
 */
type RaritySeeds = {
  minutesPerPoint: number;
  rewardPerPoint: number;
  expToNextLevel: number;
  maxStack: number;
};

/**
 * maxStack seeds follow the rarity chain: each rarity's L1 = previous rarity's
 * L5 (seed + 2 from level steps) + 1 for the new rarity, i.e. +3 per tier:
 * base L5 = 7 → uncommon L1 = 8 → uncommon L5 = 10 → rare L1 = 11 → ...
 *
 * base expToNextLevel is the onboarding tune: full stack of 5 points × 1 exp
 * per click × 4 visits = 20 exp → level 2. Upper rarities are tuned so that a
 * player visiting ~4 times a day reaches legendary L5 in about 4 months.
 */
export const UNIT_SEEDS: Record<UnitRarity, RaritySeeds> = {
  base: { minutesPerPoint: 20, rewardPerPoint: 0.01, expToNextLevel: 20, maxStack: 5 },
  uncommon: { minutesPerPoint: 20, rewardPerPoint: 0.02, expToNextLevel: 50, maxStack: 8 },
  rare: { minutesPerPoint: 20, rewardPerPoint: 0.04, expToNextLevel: 75, maxStack: 11 },
  epic: { minutesPerPoint: 20, rewardPerPoint: 0.08, expToNextLevel: 110, maxStack: 14 },
  legendary: { minutesPerPoint: 20, rewardPerPoint: 0.16, expToNextLevel: 160, maxStack: 17 }
};

export type UnitParams = {
  rarity: UnitRarity;
  level: number;
  /** Minutes to accumulate one point at this level. */
  minutesPerPoint: number;
  /** SOL credited to balance_sol per clicked point. */
  rewardPerPoint: number;
  /** Max points held in the stack. */
  maxStack: number;
  /** Exp required to reach the next level; null at max level. */
  expToNextLevel: number | null;
};

export function getUnitParams(rarity: UnitRarity, level: number): UnitParams {
  const seeds = UNIT_SEEDS[rarity];
  const lvl = Math.min(Math.max(1, Math.floor(level)), MAX_UNIT_LEVEL);
  const isMax = lvl === MAX_UNIT_LEVEL;

  return {
    rarity,
    level: lvl,
    // 20 minutes at L1, minus 20 seconds per level: 20:00 → 19:40 → … → 18:40
    minutesPerPoint: (seeds.minutesPerPoint * 60 - 20 * (lvl - 1)) / 60,
    rewardPerPoint: Math.round(seeds.rewardPerPoint * lvl * 100) / 100,
    maxStack: seeds.maxStack + Math.floor((lvl - 1) / 2),
    expToNextLevel: isMax ? null : Math.round(seeds.expToNextLevel * 2 ** (lvl - 1))
  };
}

/**
 * Points accumulated since harvestAt (unix seconds), capped by maxStack.
 * Fractional progress toward the next point is discarded.
 */
export function getAccruedPoints(params: UnitParams, harvestAt: number, now: number): number {
  const elapsedMinutes = Math.max(0, now - harvestAt) / 60;
  return Math.min(params.maxStack, Math.floor(elapsedMinutes / params.minutesPerPoint));
}
