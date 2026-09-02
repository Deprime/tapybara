import { randomBytes, randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { and, eq, gt } from 'drizzle-orm';
import { db, users, referrals, authTokens, units } from '@capyberries/db';

const now = () => Math.floor(Date.now() / 1000);

export type User = typeof users.$inferSelect;
export type Unit = typeof units.$inferSelect;

export const findUserByTelegramId = async (telegramId: number): Promise<User | null> => {
  const [row] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
  return row ?? null;
};

const findUserByUuid = async (uuid: string): Promise<User | null> => {
  const [row] = await db.select().from(users).where(eq(users.uuid, uuid)).limit(1);
  return row ?? null;
};

/**
 * Find the user by telegram id, creating it on first /start. A concurrent
 * duplicate insert loses the race on users.telegram_id unique and re-reads.
 */
export const registerUser = async (
  telegramId: number,
  telegramUsername: string | null
): Promise<{ user: User; created: boolean }> => {
  const existing = await findUserByTelegramId(telegramId);
  if (existing) {
    // Only sync the username while the Telegram profile actually has one;
    // generated usernames must survive users who never set an @username.
    if (telegramUsername && telegramUsername !== existing.username) {
      await db
        .update(users)
        .set({ username: telegramUsername, updatedAt: now() })
        .where(eq(users.id, existing.id));
      return { user: (await findUserByTelegramId(telegramId))!, created: false };
    }
    return { user: existing, created: false };
  }

  const username = telegramUsername || faker.internet.username();
  try {
    const ts = now();
    const { insertId } = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(users)
        .values({ telegramId, username, uuid: randomUUID(), createdAt: ts, updatedAt: ts });
      // Every new player starts with a level-1 base unit. harvest_at stays 0
      // (schema default) so the first visit already has a full stack to click.
      await tx.insert(units).values({
        uuid: randomUUID(),
        userId: row.insertId,
        createdAt: ts,
        updatedAt: ts
      });
      return row;
    });
    const [created] = await db.select().from(users).where(eq(users.id, insertId));
    return { user: created, created: true };
  } catch {
    return { user: (await findUserByTelegramId(telegramId))!, created: false };
  }
};

/** Attach a freshly registered user to the inviter from the /start deep link. */
export const applyReferral = async (userId: number, referrerUuid: string): Promise<boolean> => {
  const referrer = await findUserByUuid(referrerUuid);
  if (!referrer || referrer.id === userId) return false;

  await db.update(users).set({ parentId: referrer.id }).where(eq(users.id, userId));
  await db
    .insert(referrals)
    .values({ referrerId: referrer.id, refereeId: userId, createdAt: now() });
  return true;
};

/**
 * Issue a one-time login token, keeping at most one active link per user:
 * previous unexpired tokens are revoked so the newest link always wins.
 */
export const issueAuthToken = async (userId: number, ttlSeconds: number): Promise<string> => {
  const token = randomBytes(32).toString('hex');
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), gt(authTokens.expiresAt, now())));
  await db
    .insert(authTokens)
    .values({ userId, token, expiresAt: now() + ttlSeconds, createdAt: now() });
  return token;
};

export const getUserUnits = (userId: number): Promise<Unit[]> =>
  db.select().from(units).where(eq(units.userId, userId)).orderBy(units.id);
