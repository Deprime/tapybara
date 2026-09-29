export type UserRole = 'admin' | 'player';

/** Session user DTO returned by GET /api/auth/me. */
export type SessionResponse = {
  id: number;
  username: string;
  balance: number;
  balance_sol: number;
  role: UserRole;
};
