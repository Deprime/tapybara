import { Hono } from 'hono';
import { dbReady } from '@capyberries/db';

const healthController = new Hono();

/** Liveness + DB connectivity probe. */
healthController.get('/', async (c) =>
  c.json({ status: 'ok', database: (await dbReady) ? 'connected' : 'unavailable' })
);

export default healthController;
