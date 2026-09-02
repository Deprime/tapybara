import { z } from 'zod';

export * from './units';

export const itemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  done: z.boolean(),
  createdAt: z.string(),
});

export const createItemSchema = z.object({
  title: z.string().min(1, 'title is required').max(200),
  done: z.boolean().default(false),
});

export const updateItemSchema = createItemSchema.partial();

export type Item = z.infer<typeof itemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
