import { Bot } from 'grammy';
import {
  findUserByTelegramId,
  registerUser,
  applyReferral,
  issueAuthToken,
  getUserUnits,
  type User
} from './store';

export const AUTH_TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 600);

const siteUrl = () => (process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/$/, '');

export const botCommands = [
  { command: 'start', description: 'Запуск / регистрация' },
  { command: 'login', description: 'Ссылка для входа на сайт' },
  { command: 'balance', description: 'Баланс и юниты' }
];

export const createBot = (token: string) => {
  // Bun's fetch accepts a per-request proxy — lets local dev reach api.telegram.org
  // when it is blocked on the machine (TELEGRAM_PROXY_URL in the server's .env).
  const proxy = process.env.TELEGRAM_PROXY_URL;
  const bot = new Bot(token, proxy ? { client: { baseFetchConfig: { proxy } } } : {});

  bot.catch((err) => {
    console.error('Bot error:', err.error);
  });

  const requireUser = async (fromId: number | undefined): Promise<User | null> => {
    if (!fromId) return null;
    const user = await findUserByTelegramId(fromId);
    if (!user || user.blockedAt) return null;
    return user;
  };

  bot.command('start', async (ctx) => {
    if (!ctx.from) return;
    const { user, created } = await registerUser(ctx.from.id, ctx.from.username ?? null);

    // /start <referrer_uuid> — the deep link from https://t.me/<bot>?start=<uuid>
    let referred = false;
    const payload = ctx.match.trim();
    if (created && payload) {
      referred = await applyReferral(user.id, payload);
    }

    await ctx.reply(
      `Привет, ${user.username}! 🦫` +
        (referred ? '\nВы вошли по реферальной ссылке — приглашённый пользователь.' : '') +
        '\n\n/login — ссылка для входа на сайт\n/balance — баланс и юниты'
    );
  });

  bot.command('login', async (ctx) => {
    const user = await requireUser(ctx.from?.id);
    if (!user) {
      await ctx.reply('Сначала запустите бота командой /start.');
      return;
    }
    const token = await issueAuthToken(user.id, AUTH_TOKEN_TTL_SECONDS);
    const minutes = Math.round(AUTH_TOKEN_TTL_SECONDS / 60);
    await ctx.reply(
      `Ваша ссылка для входа (одноразовая, действует ${minutes} мин.):\n${siteUrl()}/?token=${token}`
    );
  });

  bot.command('balance', async (ctx) => {
    const user = await requireUser(ctx.from?.id);
    if (!user) {
      await ctx.reply('Сначала запустите бота командой /start.');
      return;
    }
    const unitRows = await getUserUnits(user.id);
    const unitLines = unitRows
      .map((u) => `#${u.id} — ${Number(u.balanceSol).toFixed(2)} SOL`)
      .join('\n');
    await ctx.reply(
      `💰 Баланс: ${Number(user.balance).toFixed(2)}\n` +
        `🪙 SOL: ${Number(user.balanceSol).toFixed(2)}\n\n` +
        `Юниты:\n${unitLines || 'Юнитов нет'}`
    );
  });

  return bot;
};
