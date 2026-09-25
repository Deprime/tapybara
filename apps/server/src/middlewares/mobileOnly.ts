import type { MiddlewareHandler } from 'hono';
import { UAParser } from 'ua-parser-js';
import { mobileOnlyPageHtml } from '../templates/index';

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

  return c.html(mobileOnlyPageHtml, 403);
};
