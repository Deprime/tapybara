// Simulation of the party/merge progression model (game code untouched):
//
// - level-ups: exp fills via clicks → pre_party → party process (4h coop /
//   12h solo) started immediately → level+1, exp resets;
// - point accrual is FROZEN while a unit is in pre_party/party (fractional
//   progress survives: harvest_at folds the frozen gap on completion);
// - rarity upgrades by MERGING: two max-level units of the same rarity become
//   ONE next-rarity level-1 unit; to reach legendary L5 the player must build
//   16 base L5 → 8 uncommon L5 → 4 rare L5 → 2 epic L5 → 1 legendary L5;
// - the fleet starts with 16 base units at once (i.e. 1 starter + 15 referral
//   rewards — per the reward rule that takes 29 invited friends);
// - a merged unit starts accruing from the merge moment (no free stack);
// - the player clicks every unit's full stack on every visit; max-level units
//   keep earning SOL while waiting for a merge partner;
// - coop (4h) is assumed to start instantly (a partner is always available).
//
// Run: bun packages/shared/scripts/progression-party.ts

import { UNIT_RARITIES, getUnitParams } from '../src/units';

const LAST = UNIT_RARITIES.length - 1;

type Unit = {
  id: number;
  rIdx: number;
  level: number;
  exp: number;
  status: 'harvest' | 'pre_party' | 'party';
  harvestAt: number;
  pausedAt: number | null;
  partyUntil: number | null;
};

const COOP_MIN = 4 * 60;
const SOLO_MIN = 12 * 60;

function simulate(intervalMin: number, partyMin: number) {
  let nextId = 1;
  const mk = (rIdx: number, harvestAt: number): Unit => ({
    id: nextId++,
    rIdx,
    level: 1,
    exp: 0,
    status: 'harvest',
    harvestAt,
    pausedAt: null,
    partyUntil: null
  });

  const fleet: Unit[] = Array.from({ length: 16 }, () => mk(0, 0)); // free first stacks
  let clicks = 0;
  let sol = 0;
  let maxVisitClicks = 0;
  const t0 = 1e9;
  let t = t0;

  const done = () => fleet.some((u) => u.rIdx === LAST && u.level === 5);

  while (!done()) {
    // 1. complete due parties (fold the frozen gap back into harvest_at)
    for (const u of fleet) {
      if (u.status === 'party' && u.partyUntil !== null && u.partyUntil <= t) {
        u.level += 1;
        u.exp = 0;
        u.status = 'harvest';
        u.harvestAt += t - (u.pausedAt ?? t);
        u.pausedAt = null;
        u.partyUntil = null;
      }
    }

    // 2. merge pairs of max-level units of the same non-final rarity
    let merged = true;
    while (merged) {
      merged = false;
      for (let r = 0; r < LAST; r++) {
        const ready = fleet.filter((u) => u.rIdx === r && u.level === 5);
        if (ready.length >= 2) {
          fleet.splice(fleet.indexOf(ready[0]), 1);
          fleet.splice(fleet.indexOf(ready[1]), 1);
          fleet.push(mk(r + 1, t));
          merged = true;
        }
      }
    }
    if (done()) break;

    // 3. click every harvest unit's accrued stack
    let visitClicks = 0;
    for (const u of fleet) {
      if (u.status !== 'harvest') continue;
      const p = getUnitParams(UNIT_RARITIES[u.rIdx], u.level);
      let ready = Math.min(p.maxStack, Math.floor((t - u.harvestAt) / p.minutesPerPoint));
      while (ready > 0 && u.status === 'harvest') {
        sol += p.rewardPerPoint;
        clicks += 1;
        visitClicks += 1;
        u.harvestAt += p.minutesPerPoint;
        ready -= 1;
        if (p.expToNextLevel !== null) {
          u.exp += 1;
          if (u.exp >= p.expToNextLevel) {
            u.status = 'pre_party';
            u.pausedAt = t;
          }
        }
      }
    }
    maxVisitClicks = Math.max(maxVisitClicks, visitClicks);

    // 4. start pending parties right away
    for (const u of fleet) {
      if (u.status === 'pre_party') {
        u.status = 'party';
        u.partyUntil = t + partyMin;
      }
    }

    t += intervalMin;
  }

  return { days: (t - t0) / 1440, clicks, sol, maxVisitClicks };
}

const scenarios: Array<[string, number, number]> = [
  ['кооп 4ч · вход каждые 6ч', 360, COOP_MIN],
  ['кооп 4ч · вход каждые 12ч', 720, COOP_MIN],
  ['соло 12ч · вход каждые 6ч', 360, SOLO_MIN],
  ['соло 12ч · вход каждые 12ч', 720, SOLO_MIN],
  ['кооп 4ч · оптимально (20 мин)', 20, COOP_MIN]
];

console.log('Сценарий                          | до legendary L5 | кликов  | SOL     | макс. кликов/вход');
for (const [name, interval, party] of scenarios) {
  const r = simulate(interval, party);
  console.log(
    name.padEnd(32),
    '|', (Math.round(r.days) + ' дн').padStart(11),
    '|', String(r.clicks).padStart(7),
    '|', r.sol.toFixed(2).padStart(7),
    '|', String(r.maxVisitClicks).padStart(6)
  );
}
