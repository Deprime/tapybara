import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db, units, type Unit } from '@capyberries/db';
import {
  EXP_PER_CLICK,
  getCollectableClicks,
  getPeriodSeconds,
  getUnitParams
} from '@capyberries/shared';

export const unitRepo = {
  /**
   * Create a fresh level-1 base unit (the admin "+ капибара" action). Mirrors
   * the bot's registration flow: the name is finalized to `Капибара #<unit id>`
   * right after the insert; harvest_at keeps the 0 schema default so the first
   * visit already has a full stack to click.
   */
  async createForUser(userId: number, skinUuid: string): Promise<Unit> {
    const ts = Math.floor(Date.now() / 1000);
    const { id } = await db.transaction(async (tx) => {
      const [row] = await tx.insert(units).values({
        uuid: randomUUID(),
        name: 'Капибара',
        userId,
        skinUuid,
        rarity: 'base',
        createdAt: ts,
        updatedAt: ts
      });
      await tx
        .update(units)
        .set({ name: `Капибара #${row.insertId}` })
        .where(eq(units.id, row.insertId));
      return { id: row.insertId };
    });
    return (await this.getById(id))!;
  },

  getByUserId(userId: number): Promise<Unit[]> {
    return db.select().from(units).where(eq(units.userId, userId)).orderBy(units.id);
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
  getByIdAndUserId(id: number, userId: number): Promise<Unit | null> {
    return db
      .select()
      .from(units)
      .where(and(eq(units.id, id), eq(units.userId, userId)))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  /**
   * Collect clicked points: the click timestamps themselves are not needed —
   * server time is authoritative and only the count matters. Extra clicks are
   * clamped by the shared accrual formula, so the cap cannot be bypassed.
   */
  async collect(unitId: number, userId: number, clicks: number[]): Promise<void> {
    const unit = await this.getByIdAndUserId(unitId, userId);
    if (!unit) throw new HTTPException(404, { message: 'unit not found' });
    if (unit.status !== 'harvest') throw new HTTPException(400, { message: 'unit is busy' });

    const params = getUnitParams(unit.rarity, unit.level);
    const now = Math.floor(Date.now() / 1000);
    const allowed = getCollectableClicks(params, unit.harvestAt, now, clicks.length);
    if (allowed <= 0) throw new HTTPException(400, { message: 'no points ready' });

    const patch: Partial<typeof units.$inferInsert> = {
      harvestAt: unit.harvestAt + allowed * getPeriodSeconds(params),
      balanceSol: (Number(unit.balanceSol) + allowed * params.rewardPerPoint).toFixed(2),
      points: unit.points + allowed,
      updatedAt: now
    };
    if (params.expToNextLevel !== null) {
      const exp = Math.min(unit.exp + allowed * EXP_PER_CLICK, params.expToNextLevel);
      patch.exp = exp;
      if (exp >= params.expToNextLevel) {
        // The level-up itself arrives with the party mechanic; freezing the
        // accrual comes with it too — until then harvest_at keeps ticking.
        patch.status = 'pre_party';
      }
    }
    await db.update(units).set(patch).where(eq(units.id, unit.id));
  }
};
