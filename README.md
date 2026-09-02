# Capyberries

Мини веб-приложение: SvelteKit (SPA) + Hono (Bun) + Drizzle ORM (MySQL) в одном монорепо.

## Структура

- `apps/web` — SvelteKit в режиме SPA (`adapter-static`, без SSR). В dev — Vite на :5173 с прокси `/api` на сервер.
- `apps/server` — Hono на Bun (:3000). Отдаёт REST API (`/api/*`) и собранный фронт из `apps/web/build` (SPA-fallback на `index.html`).
- `packages/shared` — Zod-схемы API-контрактов, общие для фронта и бэка.

## Запуск

Требуется [Bun](https://bun.sh) и MySQL.

```bash
bun install

# конфиг сервера
cp apps/server/.env.example apps/server/.env

# создать БД и применить миграции
mysql -e "CREATE DATABASE IF NOT EXISTS capyberries"
bun db:generate   # генерация миграций из схемы (при изменении src/schema.ts)
bun db:migrate    # применение миграций

# разработка (сервер :3000 + фронт :5173)
bun dev

# прод-режим: собрать фронт и запустить один сервер на :3000
bun build
bun start
```

## API

- `GET /api/health` — статус сервера и БД
- `GET /api/items`, `POST /api/items`, `PATCH /api/items/:id`, `DELETE /api/items/:id`
