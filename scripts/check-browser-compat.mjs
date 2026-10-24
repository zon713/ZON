import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile('lib/browser-compat.ts', 'utf8');
const code = source.match(/String\.raw`([\s\S]*)`;/)[1];
const context = vm.createContext({ setTimeout, clearTimeout });
vm.runInContext(`window=this; document={}; delete Object.hasOwn;`, context);
vm.runInContext(code, context);
vm.runInContext(
  `
  var symbol=Symbol('key');
  var object=Object.create({inherited:1});object.own=1;object[symbol]=1;
  if(!Object.hasOwn(object,'own')||Object.hasOwn(object,'inherited')||!Object.hasOwn(object,symbol))throw Error('own property semantics');
  if(!Object.hasOwn(Object.create(null,{x:{value:1}}),'x'))throw Error('null prototype');
  if(!Object.hasOwn('abc',1))throw Error('primitive key coercion');
  var threw=false;try{Object.hasOwn(null,'x')}catch(e){threw=e instanceof TypeError}if(!threw)throw Error('null must throw');
  if(Object.getOwnPropertyDescriptor(Object,'hasOwn').enumerable)throw Error('enumerable polyfill');
  var sync=true,queued=false;queueMicrotask(function(){if(sync)throw Error('not asynchronous');queued=true});sync=false;
`,
  context,
);
await Promise.resolve();
assert.equal(vm.runInContext('queued', context), true);
const native = vm.createContext({ setTimeout, clearTimeout });
vm.runInContext(
  'window=this;document={}; originalHasOwn=Object.hasOwn;',
  native,
);
vm.runInContext(code, native);
assert.equal(vm.runInContext('Object.hasOwn===originalHasOwn', native), true);

const forbidden = new Set([
  ts.SyntaxKind.QuestionQuestionToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
]);
const failures = [];
let htmlCount = 0,
  javascriptCount = 0,
  inlineCount = 0;
function audit(script, name) {
  const parsed = ts.createSourceFile(
    name,
    script,
    ts.ScriptTarget.ES2018,
    true,
    ts.ScriptKind.JS,
  );
  for (const diagnostic of parsed.parseDiagnostics)
    failures.push({
      name,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    });
  function walk(node) {
    if (
      node.questionDotToken ||
      ts.isPrivateIdentifier(node) ||
      (ts.isBinaryExpression(node) && forbidden.has(node.operatorToken.kind)) ||
      (ts.isCatchClause(node) && !node.variableDeclaration)
    )
      failures.push({
        name,
        kind: ts.SyntaxKind[node.kind],
        position: node.pos,
      });
    ts.forEachChild(node, walk);
  }
  walk(parsed);
}
async function visit(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) {
      await visit(file);
      continue;
    }
    if (item.name.endsWith('.js')) {
      audit(await readFile(file, 'utf8'), file);
      javascriptCount++;
    }
    if (!item.name.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    if (!html.includes('huiyimeng-browser-compat')) continue;
    htmlCount++;
    assert.match(
      html,
      /<head><meta\b[^>]*charset=[^>]*><script id="huiyimeng-browser-compat">/i,
    );
    assert.ok(
      Buffer.byteLength(html.slice(0, html.search(/charset=/i))) < 1024,
    );
    assert.ok(
      html.indexOf('huiyimeng-static-capture') < html.indexOf('id="_R_"'),
    );
    assert.doesNotMatch(html, /<script\b[^>]*type="module"[^>]*\basync/);
    for (const script of html.matchAll(
      /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    )) {
      if (!script[2].trim() || /type="application\//.test(script[1])) continue;
      audit(script[2], file + ':inline');
      inlineCount++;
    }
  }
}
const artifactRoot = path.resolve(process.argv[2] || 'dist/client');
await visit(artifactRoot);
const exported = JSON.parse(
  await readFile('dist/server/vinext-prerender.json', 'utf8'),
);
assert.equal(
  htmlCount,
  exported.routes.filter((route) => route.status === 'rendered').length,
);
assert.deepEqual(failures, []);
const report = {
  passed: true,
  artifactRoot,
  htmlCount,
  javascriptCount,
  inlineCount,
  failures,
  polyfillSemantics: true,
  note: 'AST scan for parse errors, optional chains, nullish/logical assignments, private identifiers and optional catch bindings. Dynamic import is retained (Chromium 63+); this is not an actual old-engine parser or Android hardware test.',
};
await mkdir('.next', { recursive: true });
await writeFile(
  '.next/browser-compat-check.json',
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
