import { expect, mock, test } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { Hono } from 'hono';

// Run in a separate process: application modules hold a singleton database pool.
test.skipIf(process.env.MYSQL_INTEGRATION !== '1')(
  'migrations preserve units; auth, names, skin constraints and reminder cycles use MySQL',
  async () => {
    const url = new URL(process.env.TEST_MYSQL_URL ?? process.env.DATABASE_URL ?? '');
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      throw new Error('Integration tests require a local MySQL server');
    }
    const name = `tapybara_test_${randomUUID().replaceAll('-', '')}`;
    url.pathname = '/';
    const admin = await mysql.createConnection(url.toString());
    const migrationsFolder = resolve(import.meta.dir, '../../../packages/db/drizzle');
    const stagedFolder = mkdtempSync(join(tmpdir(), 'tapybara-migrations-'));
    const previous = {
      DATABASE_URL: process.env.DATABASE_URL,
      MOBILE_ONLY: process.env.MOBILE_ONLY,
      DEV_LOGIN: process.env.DEV_LOGIN,
      NODE_ENV: process.env.NODE_ENV
    };
    let connection: mysql.Connection | undefined;
    let pool: mysql.Pool | undefined;
    let created = false;
    try {
      await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4`);
      created = true;
      url.pathname = `/${name}`;
      connection = await mysql.createConnection(url.toString());
      await connection.query("SET SESSION sql_mode = 'STRICT_ALL_TABLES'");
      const migrationDb = drizzle(connection);
      const journal = JSON.parse(
        readFileSync(join(migrationsFolder, 'meta/_journal.json'), 'utf8')
      );
      mkdirSync(join(stagedFolder, 'meta'));
      const migrateThrough = async (index: number) => {
        const entries = journal.entries.filter((entry: { idx: number }) => entry.idx <= index);
        for (const entry of entries) {
          copyFileSync(
            join(migrationsFolder, `${entry.tag}.sql`),
            join(stagedFolder, `${entry.tag}.sql`)
          );
        }
        writeFileSync(
          join(stagedFolder, 'meta/_journal.json'),
          JSON.stringify({ ...journal, entries })
        );
        await migrate(migrationDb, { migrationsFolder: stagedFolder });
      };

      await migrateThrough(5);
      await connection.execute(
        'INSERT INTO users (id, telegram_id, uuid, username) VALUES (1, 123, ?, ?)',
        [randomUUID(), 'legacy']
      );
      await connection.execute('INSERT INTO units (id, uuid, user_id) VALUES (1, ?, 1)', [
        randomUUID()
      ]);
      await migrateThrough(7);
      await connection.execute(
        'INSERT INTO units (id, uuid, user_id, name, skin_uuid) VALUES (2, ?, 1, ?, ?)',
        [randomUUID(), 'Existing', 's'.repeat(28)]
      );
      await migrate(migrationDb, { migrationsFolder });
      const [units] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id, name, skin_uuid FROM units ORDER BY id'
      );
      expect(units).toEqual([
        { id: 1, name: 'Капибара #1', skin_uuid: '' },
        { id: 2, name: 'Existing', skin_uuid: 's'.repeat(28) }
      ]);
      for (const [column, value, code] of [
        ['skin_uuid', null, 'ER_BAD_NULL_ERROR'],
        ['skin_uuid', 's'.repeat(37), 'ER_DATA_TOO_LONG'],
        ['name', null, 'ER_BAD_NULL_ERROR'],
        ['name', 'n'.repeat(21), 'ER_DATA_TOO_LONG']
      ] as const) {
        const error = await connection
          .execute(`UPDATE units SET ${column} = ? WHERE id = 1`, [value])
          .then(
            () => null,
            (error: unknown) => error
          );
        expect(error).toMatchObject({ code });
      }

      process.env.DATABASE_URL = url.toString();
      process.env.MOBILE_ONLY = 'false';
      process.env.DEV_LOGIN = 'true';
      process.env.NODE_ENV = 'test';
      const database = await import('@capyberries/db');
      pool = database.pool;
      const { registerUser, getUserUnits, issueAuthToken } =
        await import('../../../packages/bot/src/store');
      const { createSession } = await import('../src/helpers/session');
      const { inactivityRepo, INACTIVITY_SECONDS } = await import('../src/repo/inactivityRepo');
      const { createInactivityJob } = await import('../src/jobs/inactivityReminders');
      const { DEV_TELEGRAM_ID } = await import('../src/mocks/devUser');
      const { mountDevLogin } = await import('../src/mocks/devLogin');
      const auth = (await import('../src/controllers/authController')).default;
      const authPage = (await import('../src/controllers/authPageController')).default;
      const unitController = (await import('../src/controllers/unitsController')).default;
      const app = new Hono();
      app.route('/auth', authPage);
      app.route('/api/auth', auth);
      app.route('/api/units', unitController);

      const { user } = await registerUser(456, 'test-user');
      const [unit] = await getUserUnits(user.id);
      expect(unit.name).toBe(`Капибара #${unit.id}`);
      expect(unit.rarity).toBe('base');
      const { SKINS } = await import('@capyberries/shared');
      const baseSkinIds = SKINS.filter((s) => s.rarity === 'base').map((s) => s.id);
      expect(baseSkinIds).toContain(unit.skin_uuid);
      expect(await inactivityRepo.due(Number.MAX_SAFE_INTEGER, 0)).toEqual([]);
      const token = await issueAuthToken(user.id, 600);
      const login = await app.request(`/auth?token=${token}`);
      expect(login.status).toBe(302);
      const cookie = login.headers.get('set-cookie')!.split(';')[0];
      expect(cookie.startsWith('sid=')).toBe(true);
      expect((await app.request(`/auth?token=${token}`)).status).toBe(401);
      const expired = await issueAuthToken(user.id, -1);
      expect((await app.request(`/auth?token=${expired}`)).status).toBe(401);
      expect((await app.request('/api/auth/me', { headers: { cookie } })).status).toBe(200);
      const list = await app.request('/api/units', { headers: { cookie } });
      expect((await list.json())[0].name).toBe(unit.name);
      expect((await app.request('/api/auth/visit', { method: 'POST' })).status).toBe(401);
      expect(
        (
          await app.request('/api/auth/visit', {
            method: 'POST',
            headers: { cookie, origin: 'https://other.test' }
          })
        ).status
      ).toBe(403);
      expect(
        (await app.request('/api/auth/visit', { method: 'POST', headers: { cookie } })).status
      ).toBe(204);

      const now = Math.floor(Date.now() / 1000);
      await inactivityRepo.visit(user.id, now - INACTIVITY_SECONDS + 1);
      expect(await inactivityRepo.due(now - INACTIVITY_SECONDS, 0)).toEqual([]);
      await inactivityRepo.visit(user.id, now - INACTIVITY_SECONDS);
      await app.request('/api/auth/me', { headers: { cookie } });
      const sender = { sendMessage: mock(async (_id: number, _text: string) => {}) };
      await createInactivityJob(sender, inactivityRepo, () => now).run();
      await createInactivityJob(sender, inactivityRepo, () => now).run();
      expect(sender.sendMessage).toHaveBeenCalledTimes(1);
      await inactivityRepo.visit(user.id, now);
      await createInactivityJob(sender, inactivityRepo, () => now + INACTIVITY_SECONDS).run();
      expect(sender.sendMessage).toHaveBeenCalledTimes(2);
      await inactivityRepo.visit(user.id, now - INACTIVITY_SECONDS);
      await connection.execute('UPDATE users SET blocked_at = ? WHERE id = ?', [now, user.id]);
      expect(await inactivityRepo.due(now, 0)).toEqual([]);
      await connection.execute('UPDATE users SET blocked_at = NULL, telegram_id = ? WHERE id = ?', [
        DEV_TELEGRAM_ID,
        user.id
      ]);
      expect(await inactivityRepo.due(now, 0)).toEqual([]);

      process.env.NODE_ENV = 'production';
      const productionAuth = new Hono();
      mountDevLogin(productionAuth);
      expect((await productionAuth.request('/dev-login')).status).toBe(404);
      process.env.NODE_ENV = 'test';
      const developmentAuth = new Hono();
      mountDevLogin(developmentAuth);
      expect(developmentAuth.routes.some((route) => route.path === '/dev-login')).toBe(true);
      const oldCookie = `sid=${await createSession(user.id)}`;
      await createSession(user.id);
      expect((await app.request('/api/auth/me', { headers: { cookie: oldCookie } })).status).toBe(
        401
      );
    } finally {
      await pool?.end();
      await connection?.end();
      if (created) await admin.query(`DROP DATABASE \`${name}\``);
      await admin.end();
      rmSync(stagedFolder, { recursive: true, force: true });
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  },
  30_000
);
