import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import {
  legacyClinicsEntryScript,
  legacyClinicsEntryId,
  addLegacyClinicsEntryBridge,
} from './legacy-clinics-entry.mjs';

const cases = [];
function run(url, expected, options = {}) {
  const parsed = new URL(url, 'https://www.huiyimeng.com');
  const navigations = [];
  let locationRequests = 0;
  const window = {
    location: {
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      replace(target) {
        navigations.push(target);
        if (options.blockNavigation)
          throw new Error('Controlled blocked navigation');
      },
    },
    navigator: {
      geolocation: {
        getCurrentPosition() {
          locationRequests++;
        },
      },
    },
  };
  if (!options.noCompatibility)
    window.__HYM_BROWSER_COMPAT__ = { supported: options.supported !== false };
  const context = vm.createContext({ window });
  vm.runInContext(
    'Promise=undefined; Symbol=undefined; URL=undefined; URLSearchParams=undefined; Object.hasOwn=undefined;',
    context,
  );
  vm.runInContext(legacyClinicsEntryScript, context);
  assert.deepEqual(navigations, expected ? [expected] : []);
  assert.equal(locationRequests, 0);
  if (expected && window.__HYM_BROWSER_COMPAT__)
    assert.equal(window.__HYM_BROWSER_COMPAT__.supported, false);
  if (!expected && window.__HYM_BROWSER_COMPAT__)
    assert.equal(
      window.__HYM_BROWSER_COMPAT__.supported,
      options.supported !== false,
    );
  cases.push({ url, expected, options, navigations, locationRequests });
}
for (const url of [
  '/?locate=1#clinics',
  '/#clinics',
  '/index.html?locate=1#clinics',
  '/?hym_diag=legacy&locate=1#clinics',
  '/?action=other&locate=1#clinics',
  '/?action=other&action=appointment#clinics',
])
  run(url, '/clinics.html');
for (const url of [
  '/',
  '/?locate=1',
  '/?anything=1',
  '/#appointment-guide',
  '/?action=appointment',
  '/?action=appointment&locate=1#clinics',
  '/?%61ction=%61ppointment#clinics',
  '/?action=appointment&action=other#clinics',
  '/clinics.html?locate=1#clinics',
  '/appointment.html#clinics',
  '/other/#clinics',
])
  run(url, null);
run('/?locate=1#clinics', '/clinics.html', { supported: false });
run('/?locate=1#clinics', '/clinics.html', { noCompatibility: true });
run('/?locate=1#clinics', '/clinics.html', { blockNavigation: true });
run('/clinics.html', null); // Destination cannot redirect itself.

for (const [hash, target] of [
  ['#about', '/about.html'],
  ['#join', '/cooperation.html'],
  ['#faq-title', '/service-guide.html'],
]) {
  run('/' + hash, target);
  run('/index.html' + hash, target);
  run('/?q=private-search&body=head&locate=1&entry=wechat_menu' + hash, target);
  run('/index.html?source=clinic&clinic=other&anything=1' + hash, target);
  run('/?action=appointment' + hash, null);
  run('/?%61ction=%61ppointment' + hash, null);
  run('/clinics.html' + hash, null);
  run('/other/' + hash, null);
}

const source = ts.createSourceFile(
  'legacy-entry.js',
  legacyClinicsEntryScript,
  ts.ScriptTarget.ES5,
  true,
  ts.ScriptKind.JS,
);
assert.equal(source.parseDiagnostics.length, 0);
function audit(node) {
  assert.ok(
    !ts.isArrowFunction(node) &&
      !ts.isClassDeclaration(node) &&
      !node.questionDotToken,
  );
  if (ts.isVariableDeclarationList(node))
    assert.equal(node.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const), 0);
  assert.ok(
    !ts.isTemplateExpression(node) && !ts.isNoSubstitutionTemplateLiteral(node),
  );
  ts.forEachChild(node, audit);
}
audit(source);

const frozen = path.resolve(process.argv[2] || 'dist/client/index.html');
const existing = await readFile(frozen, 'utf8');
const original = existing.replace(
  new RegExp('<script id="' + legacyClinicsEntryId + '">[\\s\\S]*?<\\/script>'),
  '',
);
const patched = addLegacyClinicsEntryBridge(original);
const bridge = patched.match(
  new RegExp('<script id="' + legacyClinicsEntryId + '">[\\s\\S]*?<\\/script>'),
)[0];
assert.equal(patched.replace(bridge, ''), original);
assert.equal(addLegacyClinicsEntryBridge(patched), patched);
const compatibility = original.match(
  /<script\b[^>]*\bid="huiyimeng-browser-compat"[^>]*>[\s\S]*?<\/script>/i,
)[0];
const staleBridge =
  '<script id="' +
  legacyClinicsEntryId +
  '">window.__legacyOnlyClinics=true;</script>';
const staleHTML = original.replace(compatibility, compatibility + staleBridge);
const upgraded = addLegacyClinicsEntryBridge(staleHTML);
assert.equal(upgraded, patched);
assert.equal(upgraded.indexOf(bridge), staleHTML.indexOf(staleBridge));
assert.equal(upgraded.replace(bridge, ''), staleHTML.replace(staleBridge, ''));
assert.equal(addLegacyClinicsEntryBridge(upgraded), upgraded);
assert.throws(
  () =>
    addLegacyClinicsEntryBridge(
      staleHTML.replace(staleBridge, staleBridge + staleBridge),
    ),
  /Multiple legacy/,
);
assert.throws(
  () => addLegacyClinicsEntryBridge(staleHTML.replace(compatibility, '')),
  /Missing or ambiguous/,
);
assert.throws(
  () => addLegacyClinicsEntryBridge(staleBridge + original),
  /must appear after/,
);
assert.ok(
  patched.indexOf(legacyClinicsEntryId) >
    patched.indexOf('huiyimeng-browser-compat'),
);
assert.ok(patched.indexOf(legacyClinicsEntryId) < patched.indexOf('id="_R_"'));
assert.match(
  patched,
  /<head><meta\b[^>]*charset=[^>]*><script id="huiyimeng-browser-compat">/i,
);
const destination = path.resolve('.next/legacy-entry-check');
const noWrite = process.argv.includes('--no-write');
const report = {
  passed: true,
  cases,
  scriptSyntax:
    'ES5 AST subset and runtime without Promise/Symbol/URL/URLSearchParams/Object.hasOwn',
  normalHTMLUnchangedApartFromBridge: true,
  idempotent: true,
  replacesSingleExistingBridgeInPlace: true,
  rejectsDuplicateBridgeMarkers: true,
  rejectsMissingOrLateCompatibility: true,
  automaticLocationRequestsAdded: 0,
  note: 'Defensive local candidate only; not proof of OPPO WeChat root cause and not deployed.',
};
if (!noWrite) {
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, 'index.html'), patched);
  await writeFile(
    path.join(destination, 'unit-report.json'),
    JSON.stringify(report, null, 2),
  );
}
console.log(
  JSON.stringify({
    passed: true,
    cases: cases.length,
    automaticLocationRequestsAdded: 0,
    candidate: noWrite ? null : path.join(destination, 'index.html'),
    filesWritten: !noWrite,
  }),
);
