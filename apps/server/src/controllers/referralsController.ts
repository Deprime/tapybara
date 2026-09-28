import { Hono } from 'hono';
import { referralRepo } from '../repo/referralRepo';
import { requireAuth, type SessionEnv } from '../middlewares/requireAuth';

const referralsController = new Hono<SessionEnv>();

referralsController.use('*', requireAuth);

/** Users invited by the current session user. */
referralsController.get('/', async (c) =>
  c.json(await referralRepo.getRefereesWithUsers(c.get('user').id))
);

export default referralsController;
