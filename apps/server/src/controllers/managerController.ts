import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SKINS, getRandomSkinId } from '@capyberries/shared';
import { requireAuth, type SessionEnv } from '../middlewares/requireAuth';
import { requireAdmin } from '../middlewares/requireAdmin';
import { userRepo } from '../repo/userRepo';
import { unitRepo } from '../repo/unitRepo';

const managerController = new Hono<SessionEnv>();

managerController.use('*', requireAuth, requireAdmin);

/** All unit skins from the shared catalog. */
managerController.get('/skins', (c) => c.json(SKINS));

/** All users: telegram id, username and SOL balance. */
managerController.get('/users', async (c) => {
  const rows = await userRepo.list();
  return c.json(
    rows.map((u) => ({
      id: u.id,
      telegramId: u.telegramId,
      username: u.username,
      balanceSol: Number(u.balanceSol)
    }))
  );
});

/** Grant a user a fresh level-1 base unit with a random base-rarity skin. */
managerController.post(
  '/users/:id/units',
  zValidator('param', z.object({ id: z.coerce.number().int().positive() })),
  async (c) => {
    const userId = c.req.valid('param').id;
    const user = await userRepo.getById(userId);
    if (!user) throw new HTTPException(404, { message: 'user not found' });

    const skinId = getRandomSkinId('base');
    if (!skinId) throw new HTTPException(500, { message: 'no base skins configured' });

    const unit = await unitRepo.createForUser(userId, skinId);
    return c.json({ id: unit.id, name: unit.name, rarity: unit.rarity, skinUuid: unit.skinUuid });
  }
);

export default managerController;
