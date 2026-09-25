import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { unauthorizedPageHtml } from '../server/src/templates/index';

// Origin of the Hono server: the dev-auth-gate and the /api + /auth proxies
// must talk to the same instance.
const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:3000';

// Proxied to the Hono server; the gate must never shadow these (in particular
// /auth/dev-login, the local login flow). Defined once, reused by the proxy.
const proxy: Record<string, string> = {
  '/api': apiOrigin,
  '/auth': apiOrigin
};

/**
 * Dev counterpart of the server's pageAuth middleware: page requests
 * (Accept: text/html) without a valid session get the same static
 * "not authorized" page instead of the app. Everything else (modules, HMR,
 * source files) passes through untouched. Fails open with a warning when the
 * API server is unreachable, so `web dev` alone stays usable for markup work.
 * Log in locally via GET /auth/dev-login (DEV_LOGIN=true on the server).
 */
function devAuthGate(): Plugin {
  return {
    name: 'dev-auth-gate',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || !(req.headers.accept ?? '').includes('text/html')) return next();
        const path = req.url ?? '/';
        if (Object.keys(proxy).some((prefix) => path.startsWith(prefix))) return next();
        let authorized: boolean;
        try {
          const r = await fetch(new URL('/api/auth/me', apiOrigin), {
            headers: { cookie: req.headers.cookie ?? '' },
          });
          authorized = r.status === 200;
        } catch {
          server.config.logger.warn(
            'dev-auth-gate: API server is not reachable, letting the request through'
          );
          return next();
        }
        if (authorized) return next();
        res.statusCode = 401;
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(unauthorizedPageHtml);
      });
    },
  };
}

export default defineConfig({
  plugins: [devAuthGate(), tailwindcss(), sveltekit()],
  server: {
    proxy
  }
});
