import { z } from 'zod';

export * from './units';
export * from './alerts';
export * from './skins';

export const itemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  done: z.boolean(),
  createdAt: z.string()
});

export const createItemSchema = z.object({
  title: z.string().min(1, 'title is required').max(200),
  done: z.boolean().default(false)
});

export const updateItemSchema = createItemSchema.partial();

export type Item = z.infer<typeof itemSchema>;
// Input types: `done` stays optional because the schema fills in the default.
export type CreateItemInput = z.input<typeof createItemSchema>;
export type UpdateItemInput = z.input<typeof updateItemSchema>;
