import { and, desc, eq, isNull } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db, alerts, type Alert } from '@capyberries/db';

export const alertRepo = {
  getByUserId(user_id: number): Promise<Alert[]> {
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.user_id, user_id))
      .orderBy(desc(alerts.created_at));
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
  getByIdAndUserId(id: number, user_id: number): Promise<Alert | null> {
    return db
      .select()
      .from(alerts)
      .where(and(eq(alerts.id, id), eq(alerts.user_id, user_id)))
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
  async claim(id: number, user_id: number): Promise<Alert> {
    const alert = await this.getByIdAndUserId(id, user_id);
    if (!alert) throw new HTTPException(404, { message: 'alert not found' });
    if (alert.claimed_at !== null)
      throw new HTTPException(409, { message: 'alert already claimed' });

    const now = Math.floor(Date.now() / 1000);
    // The isNull condition turns the update itself into the authority on
    // claimed state, so two racing claims cannot both succeed.
    const [row] = await db
      .update(alerts)
      .set({ claimed_at: now, updated_at: now })
      .where(and(eq(alerts.id, id), isNull(alerts.claimed_at)));
    if (row.affectedRows === 0) throw new HTTPException(409, { message: 'alert already claimed' });

    return { ...alert, claimed_at: now, updated_at: now };
  }
};
