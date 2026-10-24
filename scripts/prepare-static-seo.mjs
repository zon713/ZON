import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import platform from '../content/platform-links.json' with { type: 'json' };

const root = path.resolve('dist/client');
const origin = platform.siteOrigin;
const pages = [];
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!file.endsWith('.html')) continue;
    const relative = path.relative(root, file).replaceAll('\\', '/');
    let html = await readFile(file, 'utf8');
    const url = origin + (relative === 'index.html' ? '/' : '/' + relative);
    html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/g, '');
    html = html.replace(
      '</head>',
      `<link rel="canonical" href="${url}"/></head>`,
    );
    if (relative === '404.html' || relative === 'wechat-preview.html') {
      html = html.replace(
        '</head>',
        '<meta name="robots" content="noindex"/></head>',
      );
    } else pages.push(url);
    await writeFile(file, html);
  }
}
await visit(root);
await writeFile(
  path.join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
    .sort((a, b) => a.localeCompare(b))
    .map((url) => `<url><loc>${url}</loc></url>`)
    .join('')}</urlset>`,
);
await writeFile(
  path.join(root, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(`Static SEO: ${pages.length} canonical pages; query-free sitemap.`);
