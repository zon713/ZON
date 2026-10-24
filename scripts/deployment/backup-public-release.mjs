import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Public GET requests only. This script never authenticates, writes to COS,
// changes permissions, or reads browser sessions and credentials.
const root = fileURLToPath(new URL('../../', import.meta.url));
const origin = 'https://huiyimeng-site-1477830799.cos-website.ap-guangzhou.myqcloud.com';
const domain = 'https://www.huiyimeng.com';
const defaults = {
  client: 'dist/client',
  output: 'outputs/deploy-20261024-wechat/backup',
  concurrency: 6,
};

function options() {
  const result = { ...defaults };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    assert.ok(value && ['--client', '--output', '--concurrency'].includes(key),
      'Usage: node scripts/deployment/backup-public-release.mjs [--client dist/client] [--output outputs/deploy-20261024-wechat/backup] [--concurrency 6]');
    result[key.slice(2)] = key === '--concurrency' ? Number(value) : value;
  }
  assert.ok(Number.isInteger(result.concurrency) && result.concurrency >= 1 && result.concurrency <= 10,
    'Concurrency must be an integer from 1 to 10');
  return result;
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const exists = async (file) => {
  try { await stat(file); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
};

function beneath(directory, key) {
  assert.ok(typeof key === 'string' && key.length > 0 && !key.includes('\\') && !key.startsWith('/') &&
    key.split('/').every((part) => part !== '.' && part !== '..' && part.length > 0), 'Unsafe object key');
  const resolved = path.resolve(directory, ...key.split('/'));
  assert.ok(resolved.startsWith(path.resolve(directory) + path.sep), 'Object path escaped backup directory');
  return resolved;
}

async function listFiles(directory, prefix = '') {
  const keys = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    assert.ok(!item.isSymbolicLink(), 'Static release cannot contain symbolic links');
    const key = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isDirectory()) keys.push(...await listFiles(path.join(directory, item.name), key));
    else if (item.isFile()) keys.push(key);
  }
  return keys.sort((first, second) => first.localeCompare(second));
}

async function saveExclusive(file, bytes) {
  await mkdir(path.dirname(file), { recursive: true });
  try { await writeFile(file, bytes, { flag: 'wx' }); return 'created'; }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const old = await readFile(file);
    assert.equal(sha256(old), sha256(bytes), 'Existing backup differs; never overwrite original backup');
    return 'verified_existing';
  }
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
        redirect: 'manual',
        credentials: 'omit',
        signal: AbortSignal.timeout(45000),
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const headers = {
        contentType: response.headers.get('content-type'),
        cacheControl: response.headers.get('cache-control'),
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
      };
      if (response.status === 200) {
        return { status: 200, headers, bytes: Buffer.from(await response.arrayBuffer()) };
      }
      await response.body?.cancel();
      if (response.status === 404) return { status: 404, headers };
      const error = new Error(`Unexpected HTTP ${response.status}`);
      error.httpStatus = response.status;
      if (attempt < 2 && (response.status === 429 || response.status >= 500)) {
        lastError = error;
      } else throw error;
    } catch (error) {
      lastError = error;
      if (error.httpStatus && error.httpStatus !== 429 && error.httpStatus < 500) throw error;
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  throw lastError;
}

async function backupTarget(target, backupDirectory) {
  const objects = path.join(backupDirectory, target.scope, 'objects');
  const metadata = path.join(backupDirectory, target.scope, 'metadata');
  const objectPath = beneath(objects, target.storageKey);
  const metadataPath = beneath(metadata, `${target.storageKey}.json`);
  let original = null;
  if (await exists(metadataPath)) {
    original = JSON.parse(await readFile(metadataPath, 'utf8'));
    assert.equal(original.version, 1, 'Unsupported backup record version');
    assert.equal(original.scope, target.scope, 'Backup scope mismatch');
    assert.equal(original.key, target.key, 'Backup key mismatch');
    assert.equal(original.url, target.url, 'Backup URL mismatch');
    assert.ok([200, 404].includes(original.httpStatus), 'Unexpected saved backup status');
    if (original.httpStatus === 200 && await exists(objectPath)) {
      const saved = await readFile(objectPath);
      assert.equal(saved.length, original.size, 'Original backup byte size changed');
      assert.equal(sha256(saved), original.sha256, 'Original backup SHA-256 changed');
    }
  }
  const current = await publicGet(target.url);
  const currentHash = current.status === 200 ? sha256(current.bytes) : null;
  if (original) {
    assert.equal(current.status, original.httpStatus, 'Remote status changed since original backup; original retained');
    if (current.status === 200) {
      assert.equal(current.bytes.length, original.size, 'Remote size changed since original backup; original retained');
      assert.equal(currentHash, original.sha256, 'Remote content changed since original backup; original retained');
      await saveExclusive(objectPath, current.bytes);
    } else assert.ok(!await exists(objectPath), '404 record has unexpected object bytes');
    return {
      scope: target.scope, key: target.key, url: target.url,
      httpStatus: current.status, size: original.size, sha256: original.sha256,
      state: current.status === 404 ? 'verified_original_404' : 'verified_original_bytes',
      headersChanged: Object.keys(current.headers).filter((key) => current.headers[key] !== original.headers[key]),
      originalRecord: path.relative(backupDirectory, metadataPath).replaceAll('\\', '/'),
    };
  }
  if (current.status === 200) await saveExclusive(objectPath, current.bytes);
  else assert.ok(!await exists(objectPath), 'Existing object conflicts with new 404 record; original retained');
  const record = {
    version: 1,
    capturedAtUtc: new Date().toISOString(),
    scope: target.scope,
    key: target.key,
    url: target.url,
    httpStatus: current.status,
    headers: current.headers,
    size: current.status === 200 ? current.bytes.length : 0,
    sha256: currentHash,
    objectFile: current.status === 200 ? path.relative(backupDirectory, objectPath).replaceAll('\\', '/') : null,
    note: current.status === 404 ? 'Absent before this release. A later upload would create this key.' : 'Original public bytes before this release. Never overwrite this backup.',
  };
  await saveExclusive(metadataPath, Buffer.from(JSON.stringify(record, null, 2) + '\n'));
  return {
    scope: target.scope, key: target.key, url: target.url,
    httpStatus: current.status, size: record.size, sha256: record.sha256,
    state: current.status === 404 ? 'recorded_new_key_404' : 'backed_up_original',
    originalRecord: path.relative(backupDirectory, metadataPath).replaceAll('\\', '/'),
  };
}

async function main() {
  const config = options();
  const client = path.resolve(root, config.client);
  const backupDirectory = path.resolve(root, config.output);
  assert.ok(client.startsWith(root), 'Client directory must be inside this workspace');
  assert.ok(backupDirectory.startsWith(path.join(root, 'outputs') + path.sep), 'Backup directory must be inside workspace outputs');
  assert.ok((await stat(client)).isDirectory(), 'Static client output is missing');
  const keys = await listFiles(client);
  assert.ok(keys.length > 0 && keys.includes('index.html'), 'Static release must include index.html');
  assert.equal(new Set(keys.map((key) => key.toLowerCase())).size, keys.length, 'Object keys collide on Windows filesystem');
  const htmlKeys = keys.filter((key) => key.endsWith('.html'));
  const targets = [
    ...keys.map((key) => ({ scope: 'origin', key, storageKey: key, url: targetUrl(origin, key) })),
    ...htmlKeys.map((key) => ({ scope: 'domain', key, storageKey: key, url: targetUrl(domain, key) })),
    { scope: 'domain-homepage', key: '', storageKey: 'index.html', url: `${domain}/` },
  ];
  const runId = `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID().slice(0, 8)}`;
  const report = {
    version: 1,
    runId,
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    sourceDirectory: client,
    backupDirectory,
    origin,
    domain,
    methodsUsed: ['GET'],
    remoteWrites: 0,
    overwriteOriginalBackups: false,
    currentReleaseKeys: keys,
    expectedTargets: targets.length,
    results: [],
    failures: [],
    complete: false,
  };
  let next = 0;
  let completed = 0;
  await mkdir(path.join(backupDirectory, 'runs'), { recursive: true });
  console.log(JSON.stringify({ stage: 'backup_started', releaseKeys: keys.length, domainHtml: htmlKeys.length, targets: targets.length, concurrency: config.concurrency }));
  await Promise.all(Array.from({ length: config.concurrency }, async () => {
    while (next < targets.length) {
      const target = targets[next++];
      try { report.results.push(await backupTarget(target, backupDirectory)); }
      catch (error) {
        const failure = { scope: target.scope, key: target.key, url: target.url, error: error.message };
        report.failures.push(failure);
        console.log(JSON.stringify({ stage: 'backup_target_failed', ...failure }));
      }
      completed += 1;
      if (completed % 25 === 0 || completed === targets.length)
        console.log(JSON.stringify({ stage: 'backup_progress', completed, targets: targets.length, failures: report.failures.length }));
    }
  }));
  report.results.sort((a, b) => `${a.scope}/${a.key}`.localeCompare(`${b.scope}/${b.key}`));
  report.completedAtUtc = new Date().toISOString();
  report.complete = report.failures.length === 0 && report.results.length === targets.length;
  const reportPath = path.join(backupDirectory, 'runs', `${runId}.json`);
  await saveExclusive(reportPath, Buffer.from(JSON.stringify(report, null, 2) + '\n'));
  const summary = {
    stage: 'backup_finished',
    complete: report.complete,
    releaseKeys: keys.length,
    checkedTargets: report.results.length,
    existing200: report.results.filter((item) => item.httpStatus === 200).length,
    absent404: report.results.filter((item) => item.httpStatus === 404).length,
    createdOriginals: report.results.filter((item) => item.state === 'backed_up_original').length,
    reusedOriginals: report.results.filter((item) => item.state === 'verified_original_bytes').length,
    failures: report.failures,
    reportPath,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!report.complete) process.exitCode = 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ stage: 'backup_aborted', error: error.message }));
  process.exitCode = 1;
});
