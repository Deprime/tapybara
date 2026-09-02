import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/capyberries';

export const pool = mysql.createPool({ uri: url });

export const db = drizzle(pool);

export const dbReady = (async () => {
  await pool.query('SELECT 1');
  return true;
})().catch(() => false);

export const webBuildDir = join(import.meta.dir, '../../web/build');
