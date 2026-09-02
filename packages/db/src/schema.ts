import {
  bigint,
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
  type AnyMySqlColumn,
} from 'drizzle-orm/mysql-core';

// All timestamps are unix time (seconds) stored as BIGINT.

export const users = mysqlTable(
  'users',
  {
    id: int('id').autoincrement().primaryKey(),
    parentId: int('parent_id').references((): AnyMySqlColumn => users.id),
    telegramId: bigint('telegram_id', { mode: 'number' }).notNull(),
    uuid: varchar('uuid', { length: 36 }).notNull(),
    username: varchar('username', { length: 64 }).notNull(),
    balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0'),
    balanceSol: decimal('balance_sol', { precision: 12, scale: 2 }).notNull().default('0'),
    walletUsdt: varchar('wallet_usdt', { length: 128 }),
    createdAt: bigint('created_at', { mode: 'number' }).notNull().default(0),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull().default(0),
    blockedAt: bigint('blocked_at', { mode: 'number' }),
    blockReason: varchar('block_reason', { length: 255 }),
  },
  (t) => [
    uniqueIndex('users_telegram_id_uq').on(t.telegramId),
    uniqueIndex('users_uuid_uq').on(t.uuid),
    index('users_parent_id_idx').on(t.parentId),
  ]
);

export const units = mysqlTable(
  'units',
  {
    id: int('id').autoincrement().primaryKey(),
    uuid: varchar('uuid', { length: 36 }).notNull(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id),
    level: int('level').notNull().default(1),
    rarity: mysqlEnum('rarity', ['base', 'uncommon', 'rare', 'epic', 'legendary'])
      .notNull()
      .default('base'),
    exp: int('exp').notNull().default(0),
    balanceSol: decimal('balance_sol', { precision: 12, scale: 2 }).notNull().default('0'),
    points: int('points').notNull().default(0),
    status: mysqlEnum('status', ['harvest', 'pre_party', 'party', 'staking'])
      .notNull()
      .default('harvest'),
    generation: int('generation').notNull().default(0),
    harvestAt: bigint('harvest_at', { mode: 'number' }).notNull().default(0),
    createdAt: bigint('created_at', { mode: 'number' }).notNull().default(0),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull().default(0),
  },
  (t) => [uniqueIndex('units_uuid_uq').on(t.uuid), index('units_user_id_idx').on(t.userId)]
);

export const referrals = mysqlTable(
  'referrals',
  {
    id: int('id').autoincrement().primaryKey(),
    referrerId: int('referrer_id')
      .notNull()
      .references(() => users.id),
    refereeId: int('referee_id')
      .notNull()
      .references(() => users.id),
    createdAt: bigint('created_at', { mode: 'number' }).notNull().default(0),
    claimedAt: bigint('claimed_at', { mode: 'number' }).notNull().default(0),
  },
  (t) => [
    uniqueIndex('referrals_referee_id_uq').on(t.refereeId),
    index('referrals_referrer_id_idx').on(t.referrerId),
  ]
);

// One-time login tokens issued by the bot (/login). Deleted right after
// successful auth; expires_at drives the short TTL and expired-token cleanup.
export const authTokens = mysqlTable(
  'auth_tokens',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id),
    token: varchar('token', { length: 64 }).notNull(),
    expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull().default(0),
  },
  (t) => [
    uniqueIndex('auth_tokens_token_uq').on(t.token),
    index('auth_tokens_user_id_idx').on(t.userId),
    index('auth_tokens_expires_at_idx').on(t.expiresAt),
  ]
);

// Server-side sessions: the cookie carries a random sid, the DB stores only
// its sha256 hash so a database leak cannot forge valid session cookies.
// user_id is UNIQUE: one active session per user — a new login replaces it.
export const sessions = mysqlTable(
  'sessions',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull().default(0),
    expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  },
  (t) => [
    uniqueIndex('sessions_token_hash_uq').on(t.tokenHash),
    uniqueIndex('sessions_user_id_uq').on(t.userId),
    index('sessions_expires_at_idx').on(t.expiresAt),
  ]
);

export const items = mysqlTable('items', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  done: boolean('done').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
