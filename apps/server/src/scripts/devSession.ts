// Local-dev helper: mint a real session for the deterministic dev fixture
// user and print it. Run as `bun run dev:session`.
import { createSession, SESSION_TTL_SECONDS } from '../helpers/session';
import { ensureDevUser, DEV_USERNAME, DEV_TELEGRAM_ID } from '../mocks/devUser';

const user = await ensureDevUser();
const sid = await createSession(user.id);

console.log(`Dev user: id=${user.id} username=${DEV_USERNAME} telegramId=${DEV_TELEGRAM_ID}`);
console.log(
  `Session minted, valid for ${SESSION_TTL_SECONDS / 86400} days (replaces the previous one).`
);
console.log(`\n  Cookie header: Cookie: sid=${sid}`);
console.log(`  curl example:  curl -H "Cookie: sid=${sid}" http://localhost:3000/api/units`);
console.log(`\n  Browser login: http://localhost:5173/auth/dev-login`);
process.exit(0);
