import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only post-upload verification. Public HTTP GET only; no credentials,
// browser session, COS mutations, permission changes, or cache purges.
const root = fileURLToPath(new URL('../../', import.meta.url));
const origin = 'https://huiyimeng-site-1477830799.cos-website.ap-guangzhou.myqcloud.com';
const domain = 'https://www.huiyimeng.com';
const help = `Public release verifier (GET only)
Usage: node scripts/deployment/verify-public-release.mjs [options]
  --client dist/client
  --output outputs/deploy-20261024-wechat/verification
  --concurrency 6
  --prefix clinics/         Only files inside this release directory
  --keys-file path.json    JSON array of exact relative release keys
  --index-last             Only index.html, plus the formal domain homepage
  --help                   Show this message without any network requests

Default: verify every actual client file on both the COS website origin and
formal domain; also verify / against local index.html. Reports are immutable.
Prefix and keys-file can be combined as an intersection. Index-last cannot be
combined with either filter. This script never publishes or restores files.`;

function options() {
  const result = {
    client: 'dist/client',
    output: 'outputs/deploy-20261024-wechat/verification',
    concurrency: 6,
    prefix: null,
    keysFile: null,
    indexLast: false,
    help: false,
  };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === '--help') { result.help = true; continue; }
    if (key === '--index-last') { result.indexLast = true; continue; }
    assert.ok(['--client', '--output', '--concurrency', '--prefix', '--keys-file'].includes(key), help);
    const value = args[++index];
    assert.ok(typeof value === 'string' && value.length > 0 && !value.startsWith('--'), help);
    if (key === '--keys-file') result.keysFile = value;
    else result[key.slice(2)] = key === '--concurrency' ? Number(value) : value;
  }
  assert.ok(Number.isInteger(result.concurrency) && result.concurrency >= 1 && result.concurrency <= 10,
    'Concurrency must be an integer from 1 to 10');
  assert.ok(!result.indexLast || (!result.prefix && !result.keysFile), 'Index-last cannot be combined with a prefix or keys file');
  return result;
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function safeKey(key) {
  return typeof key === 'string' && key.length > 0 && !key.startsWith('/') && !key.includes('\\') &&
    key.split('/').every((part) => part !== '.' && part !== '..' && part.length > 0);
}

function localFile(directory, key) {
  assert.ok(safeKey(key), 'Unsafe release key');
  const resolved = path.resolve(directory, ...key.split('/'));
  assert.ok(resolved.startsWith(path.resolve(directory) + path.sep), 'Release key escaped its directory');
  return resolved;
}

async function listFiles(directory, prefix = '') {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    assert.ok(!item.isSymbolicLink(), 'Static release cannot contain symbolic links');
    const key = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isDirectory()) result.push(...await listFiles(path.join(directory, item.name), key));
    else if (item.isFile()) result.push(key);
  }
  return result.sort((first, second) => first.localeCompare(second));
}

function targetUrl(base, key) {
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

async function publicGet(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        redirect: 'manual',
        signal: AbortSignal.timeout(45000),
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const headers = {
        contentType: response.headers.get('content-type'),
        cacheControl: response.headers.get('cache-control'),
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
      };
      if (response.status === 200)
        return { status: 200, headers, bytes: Buffer.from(await response.arrayBuffer()) };
      await response.body?.cancel();
      if (response.status !== 429 && response.status < 500)
        return { status: response.status, headers, bytes: null };
      lastError = new Error(`Unexpected HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  throw lastError;
}

async function main() {
  const config = options();
  if (config.help) { console.log(help); return; }
  const client = path.resolve(root, config.client);
  const output = path.resolve(root, config.output);
  assert.ok(client.startsWith(root), 'Client directory must be inside this workspace');
  assert.ok(output.startsWith(path.join(root, 'outputs') + path.sep), 'Reports must be inside workspace outputs');
  assert.ok((await stat(client)).isDirectory(), 'Static client output is missing');
  const releaseKeys = await listFiles(client);
  assert.ok(releaseKeys.length > 0 && releaseKeys.includes('index.html'), 'Static release must contain index.html');
  assert.equal(new Set(releaseKeys.map((key) => key.toLowerCase())).size, releaseKeys.length, 'Release keys collide on Windows');
  const knownKeys = new Set(releaseKeys);
  let selectedKeys = releaseKeys;
  if (config.keysFile) {
    const keysPath = path.resolve(root, config.keysFile);
    assert.ok(keysPath.startsWith(root), 'Keys file must be inside this workspace');
    const requested = JSON.parse(await readFile(keysPath, 'utf8'));
    assert.ok(Array.isArray(requested) && requested.length > 0, 'Keys file must be a nonempty JSON array');
    assert.ok(requested.every((key) => safeKey(key) && knownKeys.has(key)), 'Keys file contains unknown or unsafe release keys');
    assert.equal(new Set(requested).size, requested.length, 'Keys file contains duplicates');
    selectedKeys = [...requested];
  }
  if (config.prefix) {
    const prefix = config.prefix.replace(/\/$/, '');
    assert.ok(safeKey(prefix), 'Prefix must be a relative release directory');
    selectedKeys = selectedKeys.filter((key) => key.startsWith(`${prefix}/`));
  }
  if (config.indexLast) selectedKeys = ['index.html'];
  assert.ok(selectedKeys.length > 0, 'No release keys match the selected batch');
  selectedKeys.sort((first, second) => first.localeCompare(second));

  const expected = [];
  for (const key of selectedKeys) {
    const bytes = await readFile(localFile(client, key));
    expected.push({ key, size: bytes.length, sha256: sha256(bytes) });
  }
  const targets = expected.flatMap((file) => [
    { ...file, scope: 'origin', url: targetUrl(origin, file.key) },
    { ...file, scope: 'domain', url: targetUrl(domain, file.key) },
  ]);
  if (selectedKeys.includes('index.html')) {
    const index = expected.find((file) => file.key === 'index.html');
    targets.push({ ...index, scope: 'domain-homepage', url: `${domain}/` });
  }
  const runId = `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID().slice(0, 8)}`;
  const report = {
    version: 1,
    runId,
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    clientDirectory: client,
    origin,
    domain,
    methodsUsed: ['GET'],
    remoteWrites: 0,
    batch: { prefix: config.prefix, keysFile: config.keysFile, indexLast: config.indexLast },
    releaseFileCount: releaseKeys.length,
    selectedFileCount: expected.length,
    expectedTargets: targets.length,
    expectedFiles: expected,
    checks: [],
    failures: [],
    passed: false,
  };
  let next = 0;
  let completed = 0;
  console.log(JSON.stringify({ stage: 'verification_started', releaseFiles: releaseKeys.length, selectedFiles: expected.length, targets: targets.length, batch: report.batch }));
  await Promise.all(Array.from({ length: config.concurrency }, async () => {
    while (next < targets.length) {
      const target = targets[next++];
      const check = {
        scope: target.scope, key: target.key, url: target.url,
        expectedSize: target.size, expectedSha256: target.sha256,
        httpStatus: null, actualSize: null, actualSha256: null,
        headers: null, passed: false, error: null,
      };
      try {
        const result = await publicGet(target.url);
        check.httpStatus = result.status;
        check.headers = result.headers;
        assert.equal(result.status, 200, `Expected HTTP 200, received ${result.status}`);
        check.actualSize = result.bytes.length;
        check.actualSha256 = sha256(result.bytes);
        assert.equal(check.actualSize, target.size, 'Published byte size differs from local release');
        assert.equal(check.actualSha256, target.sha256, 'Published SHA-256 differs from local release');
        check.passed = true;
      } catch (error) {
        check.error = error.message;
        report.failures.push({ scope: target.scope, key: target.key, error: error.message });
        console.log(JSON.stringify({ stage: 'verification_target_failed', scope: target.scope, key: target.key, error: error.message }));
      }
      report.checks.push(check);
      completed += 1;
      if (completed % 25 === 0 || completed === targets.length)
        console.log(JSON.stringify({ stage: 'verification_progress', completed, targets: targets.length, failures: report.failures.length }));
    }
  }));
  // Ensure a concurrent rebuild did not change the reference bytes mid-check.
  for (const file of expected) {
    const current = await readFile(localFile(client, file.key));
    if (current.length !== file.size || sha256(current) !== file.sha256)
      report.failures.push({ scope: 'local-release', key: file.key, error: 'Local reference changed during verification; rerun after the build completes' });
  }
  report.checks.sort((first, second) => `${first.scope}/${first.key}`.localeCompare(`${second.scope}/${second.key}`));
  report.completedAtUtc = new Date().toISOString();
  report.passed = report.failures.length === 0 && report.checks.length === targets.length;
  await mkdir(output, { recursive: true });
  const reportPath = path.join(output, `${runId}.json`);
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({
    stage: 'verification_finished', passed: report.passed,
    selectedFiles: expected.length, checkedTargets: report.checks.length,
    failures: report.failures, reportPath,
  }, null, 2));
  if (!report.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ stage: 'verification_aborted', error: error.message }));
  process.exitCode = 1;
});
