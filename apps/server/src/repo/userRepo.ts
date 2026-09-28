import { eq } from 'drizzle-orm';
import { db, users, type User } from '@capyberries/db';

export const userRepo = {
  getById(id: number): Promise<User | null> {
    return db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  getByTelegramId(telegramId: number): Promise<User | null> {
    return db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  getByUuid(uuid: string): Promise<User | null> {
    return db
      .select()
      .from(users)
      .where(eq(users.uuid, uuid))
      .limit(1)
      .then(([row]) => row ?? null);
  }
};
