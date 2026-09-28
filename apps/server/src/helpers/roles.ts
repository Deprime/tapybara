import type { User } from '@capyberries/db';

// Hardcoded role source of truth: Telegram user ids of the admins.
// Everyone not listed here is a regular player.
export const ADMIN_TELEGRAM_IDS: readonly number[] = [
  // DEV_TELEGRAM_ID: uncomment to test admin routes via /auth/dev-login
  // 1000000000000001
  1000000000000001
];

export type UserRole = 'admin' | 'player';

/** Virtual user field: not stored in the DB, derived from the admin list above. */
export const getUserRole = (user: Pick<User, 'telegramId'>): UserRole =>
  ADMIN_TELEGRAM_IDS.includes(user.telegramId) ? 'admin' : 'player';
