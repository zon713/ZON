import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertStaticExportReady } from './static-export-status.mjs';

const temporaryRoot = path.resolve(tmpdir());
const fixture = await mkdtemp(path.join(temporaryRoot, 'hym-export-check-'));
assert.equal(path.dirname(fixture), temporaryRoot);
const manifestFile = path.join(fixture, 'dist/server/vinext-prerender.json');
const htmlFile = path.join(fixture, 'dist/client/index.html');
const rscFile = path.join(fixture, 'dist/client/index.rsc');
const cases = [];
// Match the real persisted manifest, which has no outputFiles property.
const goodRoute = { route: '/', status: 'rendered', router: 'app', revalidate: false };
const save = (routes, trailingSlash = false) => writeFile(manifestFile, JSON.stringify({ routes, trailingSlash }));
async function reject(name, routes, expected) {
  await save(routes);
  await assert.rejects(() => assertStaticExportReady(fixture), expected);
  cases.push(name);
}
try {
  await mkdir(path.dirname(manifestFile), { recursive: true });
  await mkdir(path.dirname(htmlFile), { recursive: true });
  await writeFile(htmlFile, '<html><body>Unmodified fixture</body></html>');
  await writeFile(rscFile, 'fixture');
  await save([goodRoute]);
  assert.deepEqual(await assertStaticExportReady(fixture), { rendered: 1, skipped: 0, errors: 0 });
  cases.push('complete export');

  await reject('all 25 skipped', Array.from({ length: 25 }, (_, i) => ({ route: '/' + i, status: 'skipped', reason: 'dynamic' })), /0 rendered, 25 skipped, 0 errors/);
  await reject('recorded route error', [{ route: '/', status: 'error', error: 'Controlled render failure' }], /Controlled render failure/);
  await rm(htmlFile);
  await reject('missing rendered HTML', [goodRoute], /1 missing outputs/);
  await writeFile(htmlFile, '<html><body>Unmodified fixture</body></html>');
  await rm(rscFile);
  await reject('missing rendered RSC', [goodRoute], /1 missing outputs/);
  await writeFile(rscFile, 'fixture');
  await reject('output outside artifact root', [{ ...goodRoute, route: '/../outside' }], /outside dist\/client/);
  await reject('empty manifest', [], /manifest has no routes/);
  await writeFile(manifestFile, '{');
  await assert.rejects(() => assertStaticExportReady(fixture), /Cannot verify static export manifest/);
  cases.push('invalid manifest');

  const nestedRoot = path.join(fixture, 'dist/client/clinics');
  await mkdir(nestedRoot, { recursive: true });
  await writeFile(path.join(nestedRoot, 'test.html'), 'fixture');
  await writeFile(path.join(nestedRoot, 'test.rsc'), 'fixture');
  const concrete = { ...goodRoute, route: '/clinics/[id]', path: '/clinics/test' };
  await save([concrete]);
  assert.equal((await assertStaticExportReady(fixture)).rendered, 1);
  cases.push('concrete nested route in persisted manifest');
  await mkdir(path.join(nestedRoot, 'test'), { recursive: true });
  await writeFile(path.join(nestedRoot, 'test/index.html'), 'fixture');
  await save([concrete], true);
  assert.equal((await assertStaticExportReady(fixture)).rendered, 1);
  cases.push('trailing slash HTML and flat RSC paths');
  await writeFile(path.join(fixture, 'dist/client/404.html'), 'fixture');
  await save([goodRoute, { ...goodRoute, route: '/404' }]);
  assert.equal((await assertStaticExportReady(fixture)).rendered, 2);
  cases.push('generated 404 requires HTML only');

  await save([{ route: '/', status: 'skipped', reason: 'dynamic' }]);
  const before = await readFile(htmlFile, 'utf8');
  const prepare = fileURLToPath(new URL('./prepare-browser-compat.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [prepare], { cwd: fixture, encoding: 'utf8', timeout: 20000, windowsHide: true });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Static export incomplete: 0 rendered, 1 skipped/);
  assert.equal(await readFile(htmlFile, 'utf8'), before);
  cases.push('postprocessor fails before mutating incomplete HTML');

  console.log(JSON.stringify({ passed: true, cases, networkingAttempted: false }));
} finally {
  const resolved = path.resolve(fixture);
  assert.equal(path.dirname(resolved), temporaryRoot);
  assert.ok(path.basename(resolved).startsWith('hym-export-check-'));
  await rm(resolved, { recursive: true, force: true });
}
