import { eq } from 'drizzle-orm';
import { db, users, type User } from '@capyberries/db';
import { getRandomSkinId } from '@capyberries/shared';
import { getUnixTimestamp } from '../helpers/datetime';
import { unitRepo } from '../repo/unitRepo';

// Deterministic local-dev mock: fixed known fields, so snippets and tests
// can rely on them. Created on demand by /auth/dev-login and `bun run
// dev:session`; never referenced when those dev entry points are disabled.
export const DEV_USERNAME = 'dev';
export const DEV_TELEGRAM_ID = 1000000000000001;
export const DEV_UUID = 'deadbeef-0000-4000-8000-00000000c0de';

export const ensureDevUser = async (): Promise<User> => {
  const ts = getUnixTimestamp();
  let [user] = await db.select().from(users).where(eq(users.username, DEV_USERNAME)).limit(1);

  if (!user) {
    await db.insert(users).values({
      telegramId: DEV_TELEGRAM_ID,
      uuid: DEV_UUID,
      username: DEV_USERNAME,
      createdAt: ts,
      updatedAt: ts
    });
    [user] = await db.select().from(users).where(eq(users.username, DEV_USERNAME)).limit(1);
    // Same starting base unit as a real registration, so local dev mirrors prod.
    await unitRepo.createForUser(user.id, getRandomSkinId('base') ?? '');
  } else if (user.telegramId !== DEV_TELEGRAM_ID || user.uuid !== DEV_UUID) {
    // Normalize a row created before the fixture fields were fixed.
    await db
      .update(users)
      .set({ telegramId: DEV_TELEGRAM_ID, uuid: DEV_UUID, updatedAt: ts })
      .where(eq(users.id, user.id));
    user = { ...user, telegramId: DEV_TELEGRAM_ID, uuid: DEV_UUID };
  }

  return user;
};
