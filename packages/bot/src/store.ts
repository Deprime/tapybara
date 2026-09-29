import { randomBytes, randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { and, eq, gt } from 'drizzle-orm';
import { db, users, referrals, authTokens, units } from '@capyberries/db';
import { generateUnitName, getRandomSkinId } from '@capyberries/shared';

const now = () => Math.floor(Date.now() / 1000);

export type User = typeof users.$inferSelect;
export type Unit = typeof units.$inferSelect;

export const findUserByTelegramId = async (telegram_id: number): Promise<User | null> => {
  const [row] = await db.select().from(users).where(eq(users.telegram_id, telegram_id)).limit(1);
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
  telegram_id: number,
  telegram_username: string | null
): Promise<{ user: User; created: boolean }> => {
  const existing = await findUserByTelegramId(telegram_id);
  if (existing) {
    // Only sync the username while the Telegram profile actually has one;
    // generated usernames must survive users who never set an @username.
    if (telegram_username && telegram_username !== existing.username) {
      await db
        .update(users)
        .set({ username: telegram_username, updated_at: now() })
        .where(eq(users.id, existing.id));
      return { user: (await findUserByTelegramId(telegram_id))!, created: false };
    }
    return { user: existing, created: false };
  }

  const username = telegram_username || faker.internet.username();
  try {
    const ts = now();
    const { insertId } = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(users)
        .values({ telegram_id, username, uuid: randomUUID(), created_at: ts, updated_at: ts });
      // Every new player starts with a level-1 base unit wearing a random
      // base skin and a generated name. harvest_at stays 0 (schema default)
      // so the first visit already has a full stack to click.
      await tx.insert(units).values({
        uuid: randomUUID(),
        name: generateUnitName(),
        user_id: row.insertId,
        skin_uuid: getRandomSkinId('base') ?? '',
        rarity: 'base',
        created_at: ts,
        updated_at: ts
      });
      return row;
    });
    const [created] = await db.select().from(users).where(eq(users.id, insertId));
    return { user: created, created: true };
  } catch (error) {
    const user = await findUserByTelegramId(telegram_id);
    if (!user) throw error;
    return { user, created: false };
  }
};

/** Attach a freshly registered user to the inviter from the /start deep link. */
export const applyReferral = async (user_id: number, referrerUuid: string): Promise<boolean> => {
  const referrer = await findUserByUuid(referrerUuid);
  if (!referrer || referrer.id === user_id) return false;

  await db.update(users).set({ parent_id: referrer.id }).where(eq(users.id, user_id));
  await db
    .insert(referrals)
    .values({ referrer_id: referrer.id, referee_id: user_id, created_at: now() });
  return true;
};

/**
 * Issue a one-time login token, keeping at most one active link per user:
 * previous unexpired tokens are revoked so the newest link always wins.
 */
export const issueAuthToken = async (user_id: number, ttlSeconds: number): Promise<string> => {
  const token = randomBytes(32).toString('hex');
  await db
    .delete(authTokens)
    .where(and(eq(authTokens.user_id, user_id), gt(authTokens.expires_at, now())));
  await db
    .insert(authTokens)
    .values({ user_id, token, expires_at: now() + ttlSeconds, created_at: now() });
  return token;
};

export const getUserUnits = (user_id: number): Promise<Unit[]> =>
  db.select().from(units).where(eq(units.user_id, user_id)).orderBy(units.id);
