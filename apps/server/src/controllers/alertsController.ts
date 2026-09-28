import { Hono } from 'hono';
import { alertRepo } from '../repo/alertRepo';
import { requireAuth, type SessionEnv } from '../middlewares/requireAuth';

const alertsController = new Hono<SessionEnv>();

alertsController.use('*', requireAuth);

/** Alerts of the current session user, newest first. */
alertsController.get('/', async (c) => c.json(await alertRepo.getByUserId(c.get('user').id)));

/** Claim an alert: stamps claimed_at, rewards are not credited yet. */
alertsController.post('/:id/claim', async (c) =>
  c.json(await alertRepo.claim(Number(c.req.param('id')), c.get('user').id))
);

export default alertsController;
