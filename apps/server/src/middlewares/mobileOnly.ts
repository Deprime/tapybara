import type { MiddlewareHandler } from 'hono';
import { UAParser } from 'ua-parser-js';

const mobileOnlyPage = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Нужно мобильное устройство</title>
</head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f5f5f4;margin:0">
  <div style="text-align:center;padding:2rem">
    <h1 style="font-size:2rem;margin:0 0 .5rem">📱🦫</h1>
    <p style="color:#57534e;margin:0">Откройте сайт с мобильного устройства.<br>Ссылку для входа можно получить в Telegram-боте.</p>
  </div>
</body>
</html>`;

/**
 * Production mobile-only gate (enabled via MOBILE_ONLY=true).
 * Chromium sends sec-ch-ua-mobile automatically and it survives the
 * "request desktop site" toggle; other browsers fall back to UA parsing.
 * Tablets count as mobile; empty UA (curl, bots) does not.
 */
export const mobileOnly: MiddlewareHandler = async (c, next) => {
  if (process.env.MOBILE_ONLY !== 'true') return next();
  if (c.req.header('sec-ch-ua-mobile') === '?1') return next();

  const { device } = UAParser(c.req.header('user-agent') ?? '');
  if (device.type === 'mobile' || device.type === 'tablet') return next();

  return c.html(mobileOnlyPage, 403);
};
