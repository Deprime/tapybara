import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Images embedded into served HTML as data URIs — no route, no static dir:
// template pages are shown to unauthorized visitors, so their assets must not
// live behind the auth-gated static serving of apps/web/build. Keep files
// small (icons/logos, not photos — base64 inflates size by ~33% and defeats
// browser caching). import.meta.url instead of Bun's import.meta.dir: this
// module is (via index.ts) imported by apps/web/vite.config.ts, which
// Node-based tools load without Bun types.
const ASSETS_DIR = fileURLToPath(new URL('./assets/', import.meta.url));

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

export const assetDataUri = (name: string): string => {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`Unsupported image type in templates/assets: ${name}`);
  const base64 = readFileSync(join(ASSETS_DIR, name)).toString('base64');
  return `data:${mime};base64,${base64}`;
};
