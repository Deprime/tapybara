import { and, eq } from 'drizzle-orm';
import { db, units, type Unit } from '@capyberries/db';

export const unitRepo = {
  getByUserId(userId: number): Promise<Unit[]> {
    return db.select().from(units).where(eq(units.userId, userId)).orderBy(units.id);
  },

  getById(id: number): Promise<Unit | null> {
    return db.select().from(units).where(eq(units.id, id)).limit(1).then(([row]) => row ?? null);
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
};
