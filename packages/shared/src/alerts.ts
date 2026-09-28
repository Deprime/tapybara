import { z } from 'zod';

export const ALERT_TYPES = ['parent_referral', 'child_referral', 'friend_registered'] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

// Reward structure is intentionally free-form: claiming an alert only marks
// claimed_at for now, crediting rewards is a separate future feature.
export type IRewardSet = Record<string, unknown>;

export const rewardSetSchema = z.record(z.unknown());

export const alertSchema = z.object({
  id: z.number().int().positive(),
  typeId: z.enum(ALERT_TYPES),
  userId: z.number().int().positive(),
  metadata: z.record(z.unknown()).nullable(),
  rewards: rewardSetSchema.nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  claimedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export type AlertDto = z.infer<typeof alertSchema>;
