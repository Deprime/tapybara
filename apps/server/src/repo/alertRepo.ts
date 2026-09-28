import { and, desc, eq, isNull } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db, alerts, type Alert } from '@capyberries/db';

export const alertRepo = {
  getByUserId(userId: number): Promise<Alert[]> {
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  },

  getById(id: number): Promise<Alert | null> {
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.id, id))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  /** Fetch an alert while asserting it belongs to the given owner. */
  getByIdAndUserId(id: number, userId: number): Promise<Alert | null> {
    return db
      .select()
      .from(alerts)
      .where(and(eq(alerts.id, id), eq(alerts.userId, userId)))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  async create(values: typeof alerts.$inferInsert): Promise<Alert> {
    const [row] = await db.insert(alerts).values(values);
    const [created] = await db.select().from(alerts).where(eq(alerts.id, row.insertId));
    return created;
  },

  /**
   * Stamp claimed_at on an unclaimed alert. Rewards are free-form JSON and are
   * not credited here — crediting arrives with the reward payout feature.
   */
  async claim(id: number, userId: number): Promise<Alert> {
    const alert = await this.getByIdAndUserId(id, userId);
    if (!alert) throw new HTTPException(404, { message: 'alert not found' });
    if (alert.claimedAt !== null)
      throw new HTTPException(409, { message: 'alert already claimed' });

    const now = Math.floor(Date.now() / 1000);
    // The isNull condition turns the update itself into the authority on
    // claimed state, so two racing claims cannot both succeed.
    const [row] = await db
      .update(alerts)
      .set({ claimedAt: now, updatedAt: now })
      .where(and(eq(alerts.id, id), isNull(alerts.claimedAt)));
    if (row.affectedRows === 0) throw new HTTPException(409, { message: 'alert already claimed' });

    return { ...alert, claimedAt: now, updatedAt: now };
  }
};
