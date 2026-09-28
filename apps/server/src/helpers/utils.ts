import { createHash } from 'node:crypto';
import type { Context } from 'hono';

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

// Behind nginx the scheme is only visible via x-forwarded-proto.
export const isHttps = (c: Context) =>
  c.req.header('x-forwarded-proto') === 'https' || new URL(c.req.url).protocol === 'https:';
