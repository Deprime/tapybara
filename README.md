# Capyberries

Мини веб-приложение в одном монорепо, работает с одного домена: SvelteKit (SPA) + Hono (Bun) + Drizzle ORM (MySQL) + Telegram-бот (grammY, webhook).

## Структура

- `apps/web` — SvelteKit в режиме SPA (`adapter-static`, без SSR). В dev — Vite на :5173 с прокси `/api` на сервер.
- `apps/server` — Hono на Bun (:3000). Единственная точка входа: отдаёт REST API (`/api/*`), webhook бота (`/api/telegram/webhook`) и собранный фронт из `apps/web/build` (SPA-fallback на `index.html`).
- `packages/bot` — grammY-бот: команды над таблицей `items`. Монтируется в Hono, работает в режиме webhook-only.
- `packages/db` — Drizzle ORM (MySQL): схема, клиент, миграции. Общая для API и бота.
- `packages/shared` — Zod-схемы API-контрактов, общие для фронта и бэка.

## Запуск

Требуется [Bun](https://bun.sh) и MySQL.

```bash
bun install

# конфиг сервера (БД + токен бота)
cp apps/server/.env.example apps/server/.env

# создать БД и применить миграции
mysql -e "CREATE DATABASE IF NOT EXISTS capyberries"
bun db:generate   # генерация миграций из packages/db/src/schema.ts (при изменении схемы)
bun db:migrate    # применение миграций

# разработка (сервер :3000 + фронт :5173; бот живёт внутри сервера)
bun dev

# прод-режим: собрать фронт и запустить один сервер на :3000
bun build
bun start
```

## Telegram-бот (webhook)

Всё работает с одного домена: Telegram присылает апдейты на `https://<домен>/api/telegram/webhook`, запрос проверяется по секретному заголовку.

1. Создайте бота у [@BotFather](https://t.me/BotFather), токен — в `BOT_TOKEN`.
2. Придумайте секрет (`openssl rand -hex 32`) — в `TELEGRAM_WEBHOOK_SECRET`.
3. Укажите публичный адрес сервера в `BOT_WEBHOOK_URL` и выполните один раз:
   ```bash
   bun bot:set-webhook
   ```

### Локальная разработка бота

Telegram требует публичный HTTPS. Проще всего временный туннель:

```bash
cloudflared tunnel --url http://localhost:3000
# полученный https://xxx.trycloudflare.com → BOT_WEBHOOK_URL в .env
bun bot:set-webhook
```

Если `api.telegram.org` недоступен с вашей машины напрямую, укажите http(s)-прокси в `TELEGRAM_PROXY_URL` — и сервер, и `bot:set-webhook` будут ходить в Telegram через него (Bun `fetch` поддерживает per-request proxy).

Команды бота: `/start`, `/items`, `/add <текст>`, `/done <id>`.

## API

- `GET /api/health` — статус сервера и БД
- `GET /api/items`, `POST /api/items`, `PATCH /api/items/:id`, `DELETE /api/items/:id`
- `POST /api/telegram/webhook` — только для Telegram (защищён секретом)
