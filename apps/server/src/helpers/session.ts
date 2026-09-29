import { randomBytes } from 'node:crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import { db, authTokens, sessions, users, type User } from '@capyberries/db';
import { sha256 } from './utils';
import { getUnixTimestamp } from './datetime';

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const SESSION_COOKIE = 'sid';

export async function createSession(user_id: number): Promise<string> {
  const sid = randomBytes(32).toString('base64url');
  const values = {
    user_id,
    token_hash: sha256(sid),
    created_at: getUnixTimestamp(),
    expires_at: getUnixTimestamp() + SESSION_TTL_SECONDS
  };
  // Upsert: user_id is UNIQUE, so a new login atomically replaces the single
  // existing session — the previous device's cookie stops resolving.
  await db.insert(sessions).values(values).onDuplicateKeyUpdate({ set: values });
  return sid;
}

export async function resolveSession(sid: string | undefined): Promise<User | null> {
  if (!sid) return null;
  try {
    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.user_id, users.id))
      .where(and(eq(sessions.token_hash, sha256(sid)), gt(sessions.expires_at, getUnixTimestamp())))
      .limit(1);
    if (!row) return null;
    if (row.user.blocked_at) {
      // Banned users lose every session at once.
      await db.delete(sessions).where(eq(sessions.user_id, row.user.id));
      return null;
    }
    return row.user;
  } catch (e) {
    console.error('resolveSession failed:', e);
    return null;
  }
}

export const deleteSessionBySid = (sid: string) =>
  db.delete(sessions).where(eq(sessions.token_hash, sha256(sid)));

/** Sweep of expired one-time login tokens and server-side sessions. */
export const cleanupExpired = async () => {
  await db.delete(authTokens).where(lt(authTokens.expires_at, getUnixTimestamp()));
  await db.delete(sessions).where(lt(sessions.expires_at, getUnixTimestamp()));
};
