import { Bot } from 'grammy';
import { eq } from 'drizzle-orm';
import { db, items } from '@capyberries/db';

export const createBot = (token: string) => {
  // Bun's fetch accepts a per-request proxy — lets local dev reach api.telegram.org
  // when it is blocked on the machine (TELEGRAM_PROXY_URL in the server's .env).
  const proxy = process.env.TELEGRAM_PROXY_URL;
  const bot = new Bot(token, proxy ? { client: { baseFetchConfig: { proxy } } } : {});

  bot.catch((err) => {
    console.error('Bot error:', err.error);
  });

  bot.command('start', (ctx) =>
    ctx.reply(
      'Привет! Я бот Capyberries 🦫\n\n' +
        '/items — список пунктов\n' +
        '/add <текст> — добавить пункт\n' +
        '/done <id> — отметить выполненным'
    )
  );

  bot.command('items', async (ctx) => {
    const rows = await db.select().from(items).orderBy(items.id).limit(20);
    if (rows.length === 0) {
      await ctx.reply('Список пуст. Добавьте что-нибудь через /add <текст>.');
      return;
    }
    const list = rows
      .map((r) => `${r.done ? '✅' : '⬜'} ${r.id}. ${r.title}`)
      .join('\n');
    await ctx.reply(list);
  });

  bot.command('add', async (ctx) => {
    const title = ctx.match.trim();
    if (!title) {
      await ctx.reply('Использование: /add <текст>');
      return;
    }
    const [row] = await db.insert(items).values({ title });
    await ctx.reply(`Добавил: ${title} (id=${row.insertId})`);
  });

  bot.command('done', async (ctx) => {
    const id = Number(ctx.match.trim());
    if (!Number.isInteger(id) || id <= 0) {
      await ctx.reply('Использование: /done <id>');
      return;
    }
    const [row] = await db.update(items).set({ done: true }).where(eq(items.id, id));
    await ctx.reply(row.affectedRows > 0 ? `Отметил выполненным: ${id}` : `Не нашёл пункт ${id}`);
  });

  return bot;
};
