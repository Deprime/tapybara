import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { createItemSchema, updateItemSchema, type Item } from '@capyberries/shared';
import { db, items } from '@capyberries/db';

const itemsController = new Hono();

const toDto = (row: typeof items.$inferSelect): Item => ({
  id: row.id,
  title: row.title,
  done: row.done,
  created_at: row.created_at.toISOString()
});

/** Demo list of items. */
itemsController
  .get('/', async (c) => {
    const rows = await db.select().from(items).orderBy(items.id);
    return c.json(rows.map(toDto));
  })
  .post('/', zValidator('json', createItemSchema), async (c) => {
    const input = c.req.valid('json');
    const [row] = await db.insert(items).values(input);
    const [created] = await db.select().from(items).where(eq(items.id, row.insertId));
    return c.json(toDto(created), 201);
  })
  .patch('/:id', zValidator('json', updateItemSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const input = c.req.valid('json');
    const [row] = await db.update(items).set(input).where(eq(items.id, id));
    if (row.affectedRows === 0) return c.json({ error: 'not found' }, 404);
    const [updated] = await db.select().from(items).where(eq(items.id, id));
    return c.json(toDto(updated));
  })
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const [row] = await db.delete(items).where(eq(items.id, id));
    if (row.affectedRows === 0) return c.json({ error: 'not found' }, 404);
    return c.body(null, 204);
  });

export default itemsController;
