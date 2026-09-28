# Web: карта для разработчика и LLM

SvelteKit 5 SPA: SSR и prerender отключены в `src/routes/+layout.ts`, production
собирается adapter-static в `build/`. Hono раздаёт сборку и API с одного домена.
Backend-карта: [../server/README.md](../server/README.md).

| Путь                                 | Назначение                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                     | Vite, Tailwind, проверка сессии перед HTML; прокси `/api` и `/auth` на API_ORIGIN, по умолчанию `http://localhost:3000` |
| `src/routes/+layout.ts`              | Загрузка `/api/auth/me` и `/api/units`, заполнение stores и редирект на `/home`                                         |
| `src/routes/+layout.svelte`          | Глобальные стили, loading screen, регистрация посещения при mount/visibilitychange                                      |
| `src/routes/+page.svelte`            | Корневая страница                                                                                                       |
| `src/routes/(app)/`                  | Общий layout приложения и страницы home, friends, profile                                                               |
| `src/routes/(app)/home/+page.svelte` | Список капибар: имя, редкость, уровень, статус, SOL-баланс                                                              |
| `src/lib/api/`                       | Клиенты auth, units, referrals, items, health; ручные API-типы находятся рядом                                          |
| `src/lib/config/http.ts`             | Общий ky-клиент с cookie credentials                                                                                    |
| `src/lib/config/app.ts`              | Конфигурация приложения                                                                                                 |
| `src/lib/stores/`                    | Состояние пользователя, капибар и рефералов; persisted stores не заменяют серверную авторизацию                         |
| `src/lib/types/`                     | Тип ответа сессии                                                                                                       |
| `src/lib/components/structure/`      | Header, navigation, loading screen                                                                                      |
| `src/lib/components/ui/`             | Базовые кнопки и loader                                                                                                 |
| `src/styles/`, `src/app.css`         | Тема, типографика и стили интерфейса                                                                                    |
| `static/`                            | Статические файлы                                                                                                       |
| `../../packages/shared/src/`         | Общие игровые вычисления и типы rarity/status                                                                           |

## Вход и посещения

Production-вход начинается командой `/login` в личном чате бота. Ссылка
`/auth?token=...` обрабатывается **сервером**, который ставит HttpOnly cookie;
браузер не хранит токен входа в localStorage. Локально открыть
`http://localhost:5173/auth/dev-login` после запуска `bun dev` и миграций MySQL.

При загрузке layout получает пользователя и капибар. После mount и при
`visibilitychange` в состояние visible клиент вызывает `POST /api/auth/visit`.
Обработчик снимается при размонтировании. Восстановление сети, скрытая вкладка
и периодическая проверка `/api/auth/me` посещением
не считаются. Решение о 24 часах и доставке принадлежит серверу, таймера рассылки
на клиенте нет.

Поле `name` обязательно в `UnitListItem`; сервер генерирует `Капибара #<id>`,
максимум 20 символов. Текущий интерфейс показывает имя, но не редактирует его.

Vite dev gate при недоступном API пропускает HTML для работы над вёрсткой — это
существующий режим разработки. Он не предоставляет действующую серверную сессию.
Production SPA и игровые API защищены на сервере.

## Команды из корня

```sh
bun install
bun dev
bun run --filter @capyberries/web check
bun run build
```

Фронтенд: `http://localhost:5173`, сервер: `http://localhost:3000`.
Для этого локального запуска `.env` клиента не требуется: `/api` и `/auth`
проксируются на `http://localhost:3000`. Настройки БД и Telegram находятся
в `apps/server/.env`, тот же `DATABASE_URL` для миграций — в `packages/db/.env`.
Ответ `/api/health` через Vite должен содержать `database: connected`,
иначе вход и загрузка игровых данных работать не будут.
Исходники `packages/*` общие: меняя форму Unit, обновлять DB schema, миграцию,
серверный serializer и `src/lib/api/units.ts`. Секреты бота и DATABASE_URL
должны находиться только на сервере.
