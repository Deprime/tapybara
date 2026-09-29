# Capyberries

Мини веб-приложение в одном монорепо, работает с одного домена: SvelteKit (SPA) + Hono (Bun) + Drizzle ORM (MySQL) + Telegram-бот (grammY, webhook).

## Структура

- `apps/web` — SvelteKit в режиме SPA (`adapter-static`, без SSR). В dev — Vite на :5173 с прокси `/api` и `/auth` на сервер.
- `apps/server` — Hono на Bun (:3000). Единственная точка входа: отдаёт REST API (`/api/*`), webhook бота (`/api/telegram/webhook`) и собранный фронт из `apps/web/build` (SPA-fallback на `index.html`) — статика отдаётся только авторизованным сессиям.
- `packages/bot` — grammY-бот: команды `/start` (запуск/регистрация), `/login` (ссылка для входа на сайт), `/balance` (баланс и юниты). Монтируется в Hono, работает в режиме webhook-only.
- `packages/db` — Drizzle ORM (MySQL): схема, клиент, миграции. Общая для API и бота.
- `packages/shared` — Zod-схемы API-контрактов, игровые вычисления и каталог скинов, общие для фронта и бэка.

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

Команды бота: `/start` (регистрация; реферальная ссылка `https://t.me/<bot>?start=<uuid>`), `/login` (одноразовая ссылка для входа на сайт, действует `AUTH_TOKEN_TTL_SECONDS` сек.), `/balance` (балансы пользователя и юнитов).

## Авторизация на сайте

Вход только через бота: команда `/login` выдаёт одноразовую ссылку `https://<домен>/auth?token=...`
(TTL `AUTH_TOKEN_TTL_SECONDS`). `GET /auth` атомарно потребляет токен, открывает серверную сессию
(таблица `sessions`, в БД хранится только sha256-хеш) и ставит HttpOnly-куку `sid` на 30 дней, затем
редиректит на сайт. Невалидный/протухший токен — HTML-страница «Не авторизован». REST: `GET /api/auth/me`,
`POST /api/auth/logout`; защищённые роуты закрываются middleware `requireAuth` (пример — `GET /api/units`).
Протухшие токены и сессии удаляются фоновым тикером раз в час.

Гейты доступа: без валидной сессии файлы собранного фронта не отдаются вовсе — catch-all
статик-роут прикрыт middleware `pageAuth` (401, та же страница «Не авторизован»). При
`MOBILE_ONLY=true` запросы с не-мобильных UA (по заголовку `sec-ch-ua-mobile` или парсингу
User-Agent) получают страницу «Нужно мобильное устройство» (403) — гейт стоит и на `/auth`,
и на раздаче статики.

### Локальный вход (dev)

В dev-режиме гейт работает и на Vite-сервере (:5173): запросы страниц без сессии получают ту же
страницу «Не авторизован» (плагин `devAuthGate` в `apps/web/vite.config.ts`; модули и HMR не
блокируются, а при недоступном API-сервере гейт отключается с предупреждением). Войти без бота
двумя способами:

- **Браузер:** открыть `http://localhost:5173/auth/dev-login` — сервер минтит сессию
  фикстурного пользователя и редиректит на `/`.
- **Консоль** (для curl/Postman): команда `bun run dev:session` печатает токен и готовый пример:

```bash
bun run dev:session
# Cookie header: Cookie: sid=...
curl -H "Cookie: sid=<sid>" http://localhost:3000/api/units
```

Оба способа работают с детерминированной фикстурой: пользователь `dev`
(`telegramId=1000000000000001`), строка создаётся автоматически при первом использовании.
У пользователя одна активная сессия — каждый новый вход замещает предыдущий токен. Роут
`/auth/dev-login` монтируется только при `DEV_LOGIN=true` (выставляется дев-скриптом сервера,
в прод-режиме `bun start` роута нет).

## API

- `GET /api/health` — статус сервера и БД
- `GET /api/items`, `POST /api/items`, `PATCH /api/items/:id`, `DELETE /api/items/:id`
- `GET /api/auth/me`, `POST /api/auth/visit`, `POST /api/auth/logout`
- `GET /api/units`, `POST /api/units/:id/collect`
- `GET /api/referrals`
- `GET /api/alerts`, `POST /api/alerts/:id/claim`
- `GET /api/manager/skins`, `GET /api/manager/users`, `POST /api/manager/users/:id/units` — только для админов
- `POST /api/telegram/webhook` — только для Telegram (защищён секретом)
