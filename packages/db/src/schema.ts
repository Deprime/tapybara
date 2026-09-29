import {
  bigint,
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
  type AnyMySqlColumn
} from 'drizzle-orm/mysql-core';

// All timestamps are unix time (seconds) stored as BIGINT.
// Property names intentionally mirror the snake_case DB column names 1:1 so
// rows, API responses and types all use the same naming as the database.

export const users = mysqlTable(
  'users',
  {
    id: int('id').autoincrement().primaryKey(),
    parent_id: int('parent_id').references((): AnyMySqlColumn => users.id),
    telegram_id: bigint('telegram_id', { mode: 'number' }).notNull(),
    uuid: varchar('uuid', { length: 36 }).notNull(),
    username: varchar('username', { length: 64 }).notNull(),
    balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0'),
    balance_sol: decimal('balance_sol', { precision: 12, scale: 2 }).notNull().default('0'),
    wallet_usdt: varchar('wallet_usdt', { length: 128 }),
    last_seen_at: bigint('last_seen_at', { mode: 'number' }),
    inactivity_reminder_at: bigint('inactivity_reminder_at', { mode: 'number' }),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(0),
    updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(0),
    blocked_at: bigint('blocked_at', { mode: 'number' }),
    block_reason: varchar('block_reason', { length: 255 })
  },
  (t) => [
    uniqueIndex('users_telegram_id_uq').on(t.telegram_id),
    uniqueIndex('users_uuid_uq').on(t.uuid),
    index('users_parent_id_idx').on(t.parent_id),
    index('users_inactivity_idx').on(t.inactivity_reminder_at, t.last_seen_at)
  ]
);

export const units = mysqlTable(
  'units',
  {
    id: int('id').autoincrement().primaryKey(),
    uuid: varchar('uuid', { length: 36 }).notNull(),
    skin_uuid: varchar('skin_uuid', { length: 36 }).notNull().default(''),
    name: varchar('name', { length: 20 }).notNull(),
    user_id: int('user_id')
      .notNull()
      .references(() => users.id),
    level: int('level').notNull().default(1),
    rarity: mysqlEnum('rarity', ['base', 'uncommon', 'rare', 'epic', 'legendary'])
      .notNull()
      .default('base'),
    exp: int('exp').notNull().default(0),
    balance_sol: decimal('balance_sol', { precision: 12, scale: 2 }).notNull().default('0'),
    points: int('points').notNull().default(0),
    status: mysqlEnum('status', ['harvest', 'pre_party', 'party', 'staking'])
      .notNull()
      .default('harvest'),
    generation: int('generation').notNull().default(0),
    harvest_at: bigint('harvest_at', { mode: 'number' }).notNull().default(0),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(0),
    updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(0)
  },
  (t) => [uniqueIndex('units_uuid_uq').on(t.uuid), index('units_user_id_idx').on(t.user_id)]
);

export const referrals = mysqlTable(
  'referrals',
  {
    id: int('id').autoincrement().primaryKey(),
    referrer_id: int('referrer_id')
      .notNull()
      .references(() => users.id),
    referee_id: int('referee_id')
      .notNull()
      .references(() => users.id),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(0),
    claimed_at: bigint('claimed_at', { mode: 'number' }).notNull().default(0)
  },
  (t) => [
    uniqueIndex('referrals_referee_id_uq').on(t.referee_id),
    index('referrals_referrer_id_idx').on(t.referrer_id)
  ]
);

// One-time login tokens issued by the bot (/login). Deleted right after
// successful auth; expires_at drives the short TTL and expired-token cleanup.
export const authTokens = mysqlTable(
  'auth_tokens',
  {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id')
      .notNull()
      .references(() => users.id),
    token: varchar('token', { length: 64 }).notNull(),
    expires_at: bigint('expires_at', { mode: 'number' }).notNull(),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(0)
  },
  (t) => [
    uniqueIndex('auth_tokens_token_uq').on(t.token),
    index('auth_tokens_user_id_idx').on(t.user_id),
    index('auth_tokens_expires_at_idx').on(t.expires_at)
  ]
);

// Server-side sessions: the cookie carries a random sid, the DB stores only
// its sha256 hash so a database leak cannot forge valid session cookies.
// user_id is UNIQUE: one active session per user — a new login replaces it.
export const sessions = mysqlTable(
  'sessions',
  {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id')
      .notNull()
      .references(() => users.id),
    token_hash: varchar('token_hash', { length: 64 }).notNull(),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(0),
    expires_at: bigint('expires_at', { mode: 'number' }).notNull()
  },
  (t) => [
    uniqueIndex('sessions_token_hash_uq').on(t.token_hash),
    uniqueIndex('sessions_user_id_uq').on(t.user_id),
    index('sessions_expires_at_idx').on(t.expires_at)
  ]
);

// Messages shown to a user (referral events etc.); rewards are free-form JSON,
// claiming only stamps claimed_at — crediting is a future feature.
export const alerts = mysqlTable(
  'alerts',
  {
    id: int('id').autoincrement().primaryKey(),
    type_id: mysqlEnum('type_id', [
      'parent_referral',
      'child_referral',
      'friend_registered'
    ]).notNull(),
    user_id: int('user_id')
      .notNull()
      .references(() => users.id),
    metadata: json('metadata'),
    rewards: json('rewards'),
    title: varchar('title', { length: 200 }),
    description: varchar('description', { length: 1000 }),
    claimed_at: bigint('claimed_at', { mode: 'number' }),
    created_at: bigint('created_at', { mode: 'number' }).notNull().default(0),
    updated_at: bigint('updated_at', { mode: 'number' }).notNull().default(0)
  },
  (t) => [index('alerts_user_id_idx').on(t.user_id)]
);

export const items = mysqlTable('items', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  done: boolean('done').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow()
});
