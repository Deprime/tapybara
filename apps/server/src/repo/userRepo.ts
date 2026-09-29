import { eq } from 'drizzle-orm';
import { db, users, type User } from '@capyberries/db';

export const userRepo = {
  list(): Promise<User[]> {
    return db.select().from(users).orderBy(users.id);
  },

  getById(id: number): Promise<User | null> {
    return db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then(([row]) => row ?? null);
  },

  getByTelegramId(telegram_id: number): Promise<User | null> {
    return db
      .select()
      .from(users)
      .where(eq(users.telegram_id, telegram_id))
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
