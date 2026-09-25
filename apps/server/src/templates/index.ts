import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { assetDataUri } from './assets';

// HTML templates as real files, read once at module load. layout.html carries
// the shared wrapper with two placeholders: {{title}} for <head> and {{slot}}
// for the page body (the fragment files keep their inner lines flush with the
// slot position so the composed output stays stable). Image references use
// {{asset:<file>}} — substituted with a data URI from ./assets, so template
// pages need no static route (they are served to unauthorized visitors).
// import.meta.url (not Bun's import.meta.dir): this module is also imported by
// apps/web/vite.config.ts, which Node-based tools load without Bun types.
const TEMPLATES_DIR = fileURLToPath(new URL('.', import.meta.url));

const read = (name: string) => readFileSync(join(TEMPLATES_DIR, name), 'utf8');

export const render = (title: string, pageFile: string) =>
  read('layout.html')
    .replaceAll('{{title}}', title)
    .replaceAll('{{slot}}', read(pageFile).trimEnd())
    .replace(/\{\{asset:([^}]+)\}\}/g, (_, name: string) => assetDataUri(name.trim()))
    .trimEnd();

export const unauthorizedPageHtml = render('Не авторизован', 'unauthorized.html');
export const mobileOnlyPageHtml = render('Нужно мобильное устройство', 'mobile-only.html');
