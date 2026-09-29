// Progression simulation: how long it takes to reach legendary level 5
// and how much SOL is earned along the way.
//
// Model:
// - progression is linear: rarity in order, levels 1..5; reaching L5 of a
//   non-final rarity instantly becomes L1 of the next rarity (its upgrade
//   mechanic is not implemented yet);
// - every click: +1 exp, +reward_per_point SOL of the current stage;
// - exp resets on every level-up (no overshoot);
// - the player clicks the whole accrued stack on every visit;
// - points produced beyond max_stack between visits are DISCARDED
//   (harvest_at catches up to t - max_stack * minutes_per_point);
// - harvest_at starts at 0 (unix epoch) — the first visit has a full stack.
//
// Run: bun packages/shared/scripts/progression.ts

import { UNIT_RARITIES, getUnitParams } from '../src/units';

const LAST = UNIT_RARITIES.length - 1;

function simulate(intervalMin: number) {
  let rIdx = 0;
  let level = 1;
  let exp = 0;
  let sol = 0;
  let clicks = 0;
  let harvest_at = 0;
  const t0 = 1e9; // arbitrary "now" in unix minutes
  let t = t0;

  while (true) {
    let p = getUnitParams(UNIT_RARITIES[rIdx], level);
    const ready = Math.floor((t - harvest_at) / p.minutes_per_point);
    let accrued = Math.min(p.max_stack, ready);

    while (accrued > 0) {
      if (rIdx === LAST && level === 5) return { days: (t - t0) / 1440, sol, clicks };
      sol += p.reward_per_point;
      clicks += 1;
      exp += 1;
      accrued -= 1;
      if (p.exp_to_next_level !== null && exp >= p.exp_to_next_level) {
        exp = 0;
        level += 1;
        if (level === 5 && rIdx < LAST) {
          rIdx += 1;
          level = 1;
        }
        p = getUnitParams(UNIT_RARITIES[rIdx], level);
      }
    }

    if (ready > 0) {
      harvest_at = Math.max(
        harvest_at + Math.min(ready, p.max_stack) * p.minutes_per_point,
        t - p.max_stack * p.minutes_per_point
      );
    }
    t += intervalMin;
  }
}

const scenarios: Array<[string, number]> = [
  ['оптимально (вход каждые 20 мин)', 20],
  ['каждые 6 часов', 360],
  ['каждые 12 часов', 720],
  ['раз в день', 1440]
];

console.log('Сценарий                        | до legendary L5 | кликов  | SOL в пути');
for (const [name, interval] of scenarios) {
  const r = simulate(interval);
  console.log(
    name.padEnd(31),
    '|',
    (Math.round(r.days) + ' дн').padStart(11),
    '|',
    String(r.clicks).padStart(7),
    '|',
    r.sol.toFixed(2).padStart(10)
  );
}

// Endgame income at legendary L5: production is 1 point per 40 min = 36/day;
// two visits a day already collect it all (18 x 2 < stack 19), one visit caps at 19.
const p5 = getUnitParams('legendary', 5);
const full = ((24 * 60) / p5.minutes_per_point) * p5.reward_per_point;
const once = Math.min(p5.max_stack, Math.floor(1440 / p5.minutes_per_point)) * p5.reward_per_point;
console.log(
  `legendary L5 доход: ${full.toFixed(2)} SOL/день (2+ входа), ${once.toFixed(2)} SOL/день (1 вход)`
);
