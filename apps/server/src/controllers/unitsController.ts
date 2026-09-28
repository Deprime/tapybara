import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { unitRepo } from '../repo/unitRepo';
import { requireAuth, type SessionEnv } from '../middlewares/requireAuth';

const unitsController = new Hono<SessionEnv>();

unitsController.use('*', requireAuth);

// Shared response shape for GET /api/units and POST /:id/collect: the client
// needs level/rarity/exp/harvestAt to compute ready points with the same
// shared formula the server validates clicks against.
const listUnits = async (userId: number) => {
  const rows = await unitRepo.getByUserId(userId);
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    level: u.level,
    rarity: u.rarity,
    status: u.status,
    exp: u.exp,
    balanceSol: Number(u.balanceSol),
    points: u.points,
    harvestAt: u.harvestAt
  }));
};

/** Units of the current session user. */
unitsController.get('/', async (c) => c.json(await listUnits(c.get('user').id)));

/** Collect clicks for one unit; responds with the refreshed unit list. */
unitsController.post(
  '/:id/collect',
  zValidator('json', z.object({ clicks: z.array(z.number().int().nonnegative()).max(1000) })),
  async (c) => {
    await unitRepo.collect(Number(c.req.param('id')), c.get('user').id, c.req.valid('json').clicks);
    return c.json(await listUnits(c.get('user').id));
  }
);

export default unitsController;
