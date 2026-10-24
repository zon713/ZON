import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { transformWithOxc } from 'vite';
import { addLegacyClinicsEntryBridge } from './legacy-clinics-entry.mjs';
import { assertStaticExportReady } from './static-export-status.mjs';

// vinext's HTML bootstrap is generated after Vite's JS transforms. Lower its
// syntax separately, while leaving RSC strings and the rendered content intact.
const root = path.resolve('dist/client');
await assertStaticExportReady();
let pages = 0;
let scripts = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await visit(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    const compatibility = html.match(/<script\b[^>]*\bid="huiyimeng-browser-compat"[^>]*>[\s\S]*?<\/script>/i)?.[0];
    if (!compatibility) {
      // The framework's generated 404 has no application layout or hydration.
      if (!html.includes('id="_R_"')) continue;
      throw new Error(`Missing early compatibility script: ${file}`);
    }
    html = html.replace(compatibility, '');
    // Keep the UTF-8 declaration in the first 1024 bytes: COS currently serves
    // text/html without a charset in its HTTP Content-Type.
    if (!/<meta\b[^>]*\bcharset=/i.test(html)) throw new Error(`Missing charset: ${file}`);
    html = html.replace(/<meta\b[^>]*\bcharset=[^>]*>/i, (meta) => meta + compatibility);
    const matches = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    for (const match of matches.reverse()) {
      let [, attributes, code] = match;
      const source = attributes.match(/\bsrc="([^"]+)"/)?.[1];
      const isModule = /\btype="module"/.test(attributes);
      // Async modules may hydrate before the body checkpoint can save the SSR
      // content. Defer them until parsing is complete instead.
      if (isModule) attributes = attributes.replace(/\s+async(?:="[^"]*")?/g, '');
      if (source && /\bid="_R_"/.test(attributes)) {
        attributes = attributes.replace(/\s+src="[^"]+"/, '');
        code = `if(window.__HYM_BROWSER_COMPAT__.supported){import(${JSON.stringify(source)}).catch(function(error){window.__HYM_BROWSER_COMPAT__.fail();console.error(error);});}`;
      } else if (!source && code.trim() && !/\btype="(?:application\/ld\+json|application\/json)"/.test(attributes)) {
        if (!/\bid="huiyimeng-(?:browser-compat|static-capture|legacy-clinics-entry)"/.test(attributes)) {
          code = `if(window.__HYM_BROWSER_COMPAT__.supported){${code}}`;
        }
        code = (await transformWithOxc(code, 'bootstrap.js', { target: 'es2018' })).code;
        scripts++;
      }
      code = code.replace(/<\/script/gi, '<\\/script');
      html = html.slice(0, match.index) + `<script${attributes}>${code}</script>` + html.slice(match.index + match[0].length);
    }
    if (file === path.join(root, 'index.html')) html = addLegacyClinicsEntryBridge(html);
    await writeFile(file, html);
    pages++;
  }
}
await visit(root);
if (!pages) throw new Error('No exported pages received the browser compatibility pass');
console.log(`Browser compatibility: ${pages} pages, ${scripts} inline scripts lowered to ES2018.`);
