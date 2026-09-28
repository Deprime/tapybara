// Run via `bun bot:set-webhook`. Tells Telegram where to send updates:
//   BOT_WEBHOOK_URL=https://appdomain.com  (no trailing slash)
// The secret must match TELEGRAM_WEBHOOK_SECRET used by the server.
export {};

const token = process.env.BOT_TOKEN;
const baseUrl = process.env.BOT_WEBHOOK_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !baseUrl || !secret) {
  console.error('BOT_TOKEN, BOT_WEBHOOK_URL and TELEGRAM_WEBHOOK_SECRET must be set.');
  process.exit(1);
}

const url = `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook`;
const proxy = process.env.TELEGRAM_PROXY_URL;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ url, secret_token: secret, drop_pending_updates: true }),
  ...(proxy && { proxy })
});

console.log(await res.json());
console.log(`Webhook set to ${url}`);
