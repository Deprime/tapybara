import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db, units, type Unit } from '@capyberries/db';
import {
  EXP_PER_CLICK,
  generateUnitName,
  getCollectableClicks,
  getNextHarvestAt,
  getUnitParams
} from '@capyberries/shared';

export const unitRepo = {
  /**
   * Create a fresh level-1 base unit (the admin "+ капибара" action). Mirrors
   * the bot's registration flow: the name comes from the shared generator;
   * harvest_at keeps the 0 schema default so the first visit already has a
   * full stack to click.
   */
  async createForUser(user_id: number, skin_uuid: string): Promise<Unit> {
    const ts = Math.floor(Date.now() / 1000);
    const [row] = await db.insert(units).values({
      uuid: randomUUID(),
      name: generateUnitName(),
      user_id,
      skin_uuid,
      rarity: 'base',
      created_at: ts,
      updated_at: ts
    });
    return (await this.getById(row.insertId))!;
  },

  getByUserId(user_id: number): Promise<Unit[]> {
    return db.select().from(units).where(eq(units.user_id, user_id)).orderBy(units.id);
  },

  getById(id: number): Promise<Unit | null> {
    return db
      .select()
      .from(units)
      .where(eq(units.id, id))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  /** Fetch a unit while asserting it belongs to the given owner. */
  getByIdAndUserId(id: number, user_id: number): Promise<Unit | null> {
    return db
      .select()
      .from(units)
      .where(and(eq(units.id, id), eq(units.user_id, user_id)))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  /**
   * Collect clicked points: the click timestamps themselves are not needed —
   * server time is authoritative and only the count matters. Extra clicks are
   * clamped by the shared accrual formula, so the cap cannot be bypassed.
   */
  async collect(unit_id: number, user_id: number, clicks: number[]): Promise<void> {
    const unit = await this.getByIdAndUserId(unit_id, user_id);
    if (!unit) throw new HTTPException(404, { message: 'unit not found' });
    if (unit.status !== 'harvest') throw new HTTPException(400, { message: 'unit is busy' });

    const params = getUnitParams(unit.rarity, unit.level);
    const now = Math.floor(Date.now() / 1000);
    const allowed = getCollectableClicks(params, unit.harvest_at, now, clicks.length);
    if (allowed <= 0) throw new HTTPException(400, { message: 'no points ready' });

    const patch: Partial<typeof units.$inferInsert> = {
      harvest_at: getNextHarvestAt(params, unit.harvest_at, now, allowed),
      balance_sol: (Number(unit.balance_sol) + allowed * params.reward_per_point).toFixed(2),
      updated_at: now
    };
    if (params.exp_to_next_level !== null) {
      const exp = Math.min(unit.exp + allowed * EXP_PER_CLICK, params.exp_to_next_level);
      patch.exp = exp;
      if (exp >= params.exp_to_next_level) {
        // The level-up itself arrives with the party mechanic; freezing the
        // accrual comes with it too — until then harvest_at keeps ticking.
        patch.status = 'pre_party';
      }
    }
    await db.update(units).set(patch).where(eq(units.id, unit.id));
  }
};
