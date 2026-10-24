import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { getOutputPath, getRscOutputPath } from '../node_modules/vinext/dist/utils/prerender-output-paths.js';

// vinext can classify a failed speculative render as skipped/dynamic and still
// exit successfully. Check its export manifest before changing any HTML.
export async function assertStaticExportReady(projectRoot = process.cwd()) {
  const manifestFile = path.resolve(projectRoot, 'dist/server/vinext-prerender.json');
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot verify static export manifest: ${manifestFile}`, { cause: error });
  }
  if (!Array.isArray(manifest.routes) || !manifest.routes.length) {
    throw new Error(`Static export manifest has no routes: ${manifestFile}`);
  }
  const routes = manifest.routes;
  const rendered = routes.filter(route => route.status === 'rendered');
  const incomplete = routes.filter(route => route.status !== 'rendered');
  const skipped = routes.filter(route => route.status === 'skipped').length;
  const errors = routes.filter(route => route.status === 'error').length;
  const clientRoot = path.resolve(projectRoot, 'dist/client');
  const missing = [];
  for (const route of rendered) {
    // The persisted vinext manifest omits the internal outputFiles field. Use
    // the same path helpers as its exporter, including concrete dynamic paths.
    if (route.router !== 'app') throw new Error('Unsupported export router: expected this project app routes');
    const pathname = route.path ?? route.route;
    if (typeof pathname !== 'string' || !pathname.startsWith('/')) throw new Error('Invalid export route path');
    const outputs = route.route === '/404'
      ? ['404.html']
      : [getOutputPath(pathname, manifest.trailingSlash === true), getRscOutputPath(pathname)];
    for (const relative of outputs) {
      const file = path.resolve(clientRoot, relative);
      if (!file.startsWith(clientRoot + path.sep)) throw new Error('Static export output is outside dist/client');
      try {
        if (!(await stat(file)).isFile()) missing.push(relative);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        missing.push(relative);
      }
    }
  }
  if (incomplete.length || missing.length || !rendered.length) {
    const details = incomplete.slice(0, 5).map(route => `${route.route} (${route.error || route.reason || route.status})`);
    throw new Error([
      `Static export incomplete: ${rendered.length} rendered, ${skipped} skipped, ${errors} errors, ${missing.length} missing outputs.`,
      details.length ? `Incomplete routes: ${details.join(', ')}${incomplete.length > details.length ? ', ...' : ''}` : '',
      missing.length ? `Missing outputs: ${missing.slice(0, 5).join(', ')}` : '',
      'vinext may label speculative HTTP failures, no-store responses or exceptions as skipped/dynamic; this does not establish dynamic API usage.',
      `Manifest: ${manifestFile}`,
      'Compatibility postprocessing has not started. The manifest does not retain the original speculative HTTP/exception details.',
    ].filter(Boolean).join('\n'));
  }
  return { rendered: rendered.length, skipped, errors };
}
