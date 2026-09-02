import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/capyberries';

export const pool = mysql.createPool({ uri: url });

export const db = drizzle(pool, { schema, mode: 'default' });

// Resolves to false instead of throwing so /api/health can report DB status
// without taking the whole server down.
export const dbReady = (async () => {
  await pool.query('SELECT 1');
  return true;
})().catch(() => false);

export * from './schema';

export type User = typeof schema.users.$inferSelect;
export type Unit = typeof schema.units.$inferSelect;
