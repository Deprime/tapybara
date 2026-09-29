import { z } from 'zod';

export const ALERT_TYPES = ['parent_referral', 'child_referral', 'friend_registered'] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

// Reward structure is intentionally free-form: claiming an alert only marks
// claimed_at for now, crediting rewards is a separate future feature.
export type IRewardSet = Record<string, unknown>;

export const rewardSetSchema = z.record(z.unknown());

export const alertSchema = z.object({
  id: z.number().int().positive(),
  type_id: z.enum(ALERT_TYPES),
  user_id: z.number().int().positive(),
  metadata: z.record(z.unknown()).nullable(),
  rewards: rewardSetSchema.nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  claimed_at: z.number().nullable(),
  created_at: z.number(),
  updated_at: z.number()
});

export type AlertDto = z.infer<typeof alertSchema>;
