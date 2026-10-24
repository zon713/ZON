import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceOnly = process.argv.includes('--source-only');
assert.ok(
  process.argv.slice(2).every((argument) => argument === '--source-only'),
  'Usage: node scripts/check-wechat.mjs [--source-only]',
);
const read = (file) => readFile(path.join(root, file), 'utf8');
const json = async (file) => JSON.parse(await read(file));
const generatedRoot = 'docs/wechat/generated';
const [
  platform,
  copy,
  clinicSource,
  menu,
  rulesFile,
  linksFile,
  replies,
  article,
  menuTable,
] = await Promise.all([
  json('content/platform-links.json'),
  json('content/wechat-content.json'),
  json('content/clinics-source.json'),
  json(`${generatedRoot}/menu.json`),
  json(`${generatedRoot}/keyword-rules.json`),
  json(`${generatedRoot}/links.json`),
  read(`${generatedRoot}/replies.txt`),
  read(`${generatedRoot}/first-use-article.md`),
  read(`${generatedRoot}/menu-table.md`),
]);
const clinics = clinicSource.clinics;
const origin = new URL(platform.siteOrigin);
assert.equal(origin.protocol, 'https:', 'Public destinations must use HTTPS');
assert.equal(
  origin.href,
  `${origin.origin}/`,
  'Site origin cannot contain a path or query',
);
assert.match(
  platform.platformPhone,
  /^1\d{10}$/,
  'Platform phone must be present in shared configuration',
);

// This is a configuration/contract check, not a claim about an authenticated account.
assert.equal(platform.wechat.configurationStatus, 'draft_not_applied');
assert.equal(rulesFile.status, 'draft_not_applied');
assert.equal(linksFile.status, 'draft_not_applied');
assert.equal(
  linksFile.websiteReleaseStatus,
  platform.wechat.websiteReleaseStatus,
);
assert.equal(linksFile.origin, platform.siteOrigin);
assert.match(
  replies,
  /未在后台生效/,
  'Copy export must identify itself as a draft',
);
assert.match(
  article,
  /草稿，尚未发布/,
  'Article must identify itself as an unpublished draft',
);
assert.match(
  menuTable,
  /未应用到公众号/,
  'Menu table must not claim publication',
);

const secretKeys =
  /^(?:app[_-]?secret|token|access[_-]?token|refresh[_-]?token|encoding[_-]?aes[_-]?key|client[_-]?secret|private[_-]?key)$/i;
function checkConfigKeys(value, location) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(
      !secretKeys.test(key),
      `Secret field is forbidden in public configuration: ${location}.${key}`,
    );
    checkConfigKeys(child, `${location}.${key}`);
  }
}
checkConfigKeys(platform, 'platform-links');
checkConfigKeys(copy, 'wechat-content');

const channels = new Set([
  'wechat_menu',
  'wechat_welcome',
  'wechat_keyword',
  'wechat_message',
  'wechat_article',
]);
const destinations = new Map();
for (const [key, route] of Object.entries(platform.routes)) {
  assert.match(
    route,
    /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/,
    `${key}: unsafe or nonstatic route`,
  );
  destinations.set(key, route === '/' ? '/' : `${route}.html`);
}
for (const clinic of clinics) {
  assert.match(
    clinic.id,
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Clinic ID must be a stable path segment',
  );
  destinations.set(`clinic:${clinic.id}`, `/clinics/${clinic.id}.html`);
}
assert.equal(
  new Set(clinics.map((clinic) => clinic.id)).size,
  clinics.length,
  'Duplicate clinic ID',
);

const observedPaths = new Set();
function checkUrl(value, entry, label, key) {
  assert.equal(typeof value, 'string', `${label}: missing URL`);
  const url = new URL(value);
  assert.equal(
    url.origin,
    origin.origin,
    `${label}: target must stay on the configured website`,
  );
  assert.equal(url.protocol, 'https:', `${label}: invalid protocol`);
  assert.equal(
    url.username + url.password + url.hash,
    '',
    `${label}: unexpected credentials or fragment`,
  );
  assert.ok(
    [...destinations.values()].includes(url.pathname),
    `${label}: unknown page target`,
  );
  if (key !== undefined) {
    assert.ok(
      destinations.has(key),
      `${label}: unknown configuration key ${key}`,
    );
    assert.equal(
      url.pathname,
      destinations.get(key),
      `${label}: incorrect page binding`,
    );
  }
  assert.equal(
    url.searchParams.getAll('entry').length,
    1,
    `${label}: duplicate/missing entry`,
  );
  assert.ok(
    channels.has(url.searchParams.get('entry')),
    `${label}: unsupported source tag`,
  );
  assert.equal(
    url.searchParams.get('entry'),
    entry,
    `${label}: wrong source channel`,
  );
  const clinic = clinics.find(
    (record) => url.pathname === `/clinics/${record.id}.html`,
  );
  const allowedKeys = clinic ? ['clinic', 'source', 'entry'] : ['entry'];
  assert.deepEqual(
    [...url.searchParams.keys()].sort(),
    [...allowedKeys].sort(),
    `${label}: only anonymous source parameters are permitted`,
  );
  if (clinic) {
    assert.equal(
      url.searchParams.get('clinic'),
      clinic.id,
      `${label}: cross-clinic referral ID`,
    );
    assert.equal(
      url.searchParams.get('source'),
      'platform',
      `${label}: official-account referrals are platform promotion`,
    );
  }
  observedPaths.add(url.pathname);
  return url;
}
function urls(text) {
  return text.match(/https?:\/\/[a-z0-9./?=&_%:+#~-]+/gi) ?? [];
}
function checkTextUrls(text, entry, label) {
  for (const value of urls(text)) checkUrl(value, entry, label);
}
function expectedUrl(key, entry) {
  if (key === 'firstUse') key = 'serviceGuide';
  assert.ok(destinations.has(key), `Unknown template target ${key}`);
  const url = new URL(destinations.get(key), origin);
  if (key.startsWith('clinic:')) {
    url.searchParams.set('clinic', key.slice('clinic:'.length));
    url.searchParams.set('source', 'platform');
  }
  url.searchParams.set('entry', entry);
  return url.href;
}
function expand(text, entry) {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, key) =>
    key === 'platformPhone' ? platform.platformPhone : expectedUrl(key, entry),
  );
}

// The business menu is intentionally fixed until real activities or approved
// knowledge content exist. A generated valid JSON object alone is insufficient.
const requiredMenu = [
  [
    '找中医',
    [
      ['平台首页', 'home'],
      ['人体导览', 'bodyGuide'],
      ['查找医馆', 'clinics'],
      ['医生出诊', 'doctors'],
    ],
  ],
  [
    '就医服务',
    [
      ['联系预约', 'appointment'],
      ['到店导航', 'locations'],
      ['就诊指南', 'serviceGuide'],
      ['联系客服', 'support'],
    ],
  ],
  [
    '汇医盟',
    [
      ['关于平台', 'about'],
      ['医馆合作', 'cooperation'],
    ],
  ],
];
assert.equal(
  platform.wechat.activeActivities.length,
  0,
  'Review activity validity before enabling an activity menu',
);
assert.equal(
  platform.wechat.approvedKnowledgeArticles.length,
  0,
  'Review publication evidence before enabling the knowledge menu',
);
assert.equal(
  menu.button.length,
  3,
  'Exactly three top-level menu groups are required',
);
assert.equal(
  menu.button.flatMap((group) => group.sub_button).length,
  10,
  'Only ten supported menu targets may be exposed',
);
assert.equal(platform.wechat.menuGroups.length, 3);
for (const [index, [name, items]] of requiredMenu.entries()) {
  const group = menu.button[index];
  const configured = platform.wechat.menuGroups[index];
  assert.equal(group.name, name);
  assert.equal(configured.name, name);
  assert.equal(group.sub_button.length, items.length);
  assert.equal(configured.items.length, items.length);
  for (const [itemIndex, [itemName, route]] of items.entries()) {
    const item = group.sub_button[itemIndex];
    assert.deepEqual(
      Object.keys(item).sort(),
      ['name', 'type', 'url'],
      `${itemName}: no fake mini-program or server action`,
    );
    assert.equal(
      item.type,
      'view',
      `${itemName}: only confirmed webpage actions are drafted`,
    );
    assert.equal(item.name, itemName);
    assert.deepEqual(configured.items[itemIndex], { name: itemName, route });
    checkUrl(item.url, 'wechat_menu', itemName, route);
    assert.ok(
      menuTable.includes(item.url),
      `${itemName}: missing full target in menu table`,
    );
  }
}
assert.deepEqual(
  Object.keys(linksFile.links).sort(),
  Object.keys(platform.routes).sort(),
  'Link export must include every shared route exactly once',
);
for (const [key, value] of Object.entries(linksFile.links)) {
  checkUrl(value, 'wechat_menu', `links.${key}`, key);
}

const requiredKeywords = new Map([
  ['body-guide', ['导览', '人体']],
  ['clinic-directory', ['医馆', '找医馆']],
  ['appointment', ['预约', '挂号']],
  ['locations', ['地址', '位置', '导航']],
  ['doctors', ['医生', '出诊', '时间']],
  ['clinical-prices', ['价格', '收费', '费用']],
  ['cooperation', ['合作', '入驻', '加盟']],
  ['support', ['客服', '人工', '帮助']],
  ['activities', ['活动', '福利']],
  ...clinics.map((clinic) => [`clinic-${clinic.id}`, [clinic.name]]),
]);
assert.equal(
  clinics.length,
  4,
  'Review real source/authorization evidence before expanding the four original clinic rules',
);
assert.equal(copy.rules.length, 13);
assert.equal(rulesFile.rules.length, 13);
const keywordOwners = new Map();
const ruleIds = new Set();
for (const rule of rulesFile.rules) {
  assert.ok(!ruleIds.has(rule.id), `Duplicate rule ID ${rule.id}`);
  ruleIds.add(rule.id);
  assert.equal(
    rule.match,
    'exact',
    `${rule.id}: contains matching may misroute medical or price queries`,
  );
  assert.deepEqual(
    rule.keywords,
    requiredKeywords.get(rule.id),
    `${rule.id}: unreviewed aliases or missing keyword`,
  );
  const source = copy.rules.find((candidate) => candidate.id === rule.id);
  assert.ok(source, `${rule.id}: generated rule has no source`);
  assert.deepEqual(
    Object.keys(source).sort(),
    [
      'id',
      'keywords',
      'match',
      'text',
      'fallback',
      ...(source.linkKey ? ['linkKey'] : []),
    ].sort(),
    `${rule.id}: unsupported backend semantics in draft source`,
  );
  assert.equal(source.match, 'exact');
  assert.deepEqual(source.keywords, rule.keywords);
  assert.equal(
    rule.text,
    expand(source.text, 'wechat_keyword'),
    `${rule.id}: stale or independently edited reply`,
  );
  assert.equal(
    rule.fallback,
    expand(source.fallback, 'wechat_keyword'),
    `${rule.id}: missing operational fallback`,
  );
  assert.ok(
    rule.fallback.trim(),
    `${rule.id}: absent unconfigured-state guidance`,
  );
  for (const keyword of rule.keywords) {
    assert.equal(keyword, keyword.trim(), `${rule.id}: keyword whitespace`);
    assert.ok(!keywordOwners.has(keyword), `Keyword conflict: ${keyword}`);
    keywordOwners.set(keyword, rule.id);
  }
  checkTextUrls(rule.text, 'wechat_keyword', rule.id);
  if (source.linkKey) {
    assert.equal(rule.linkKey, source.linkKey);
    checkUrl(
      rule.target,
      'wechat_keyword',
      `${rule.id}.target`,
      source.linkKey,
    );
    assert.ok(
      rule.text.includes(rule.target),
      `${rule.id}: target missing from actual reply`,
    );
  } else {
    assert.equal(rule.target, null, `${rule.id}: unexpected configured target`);
  }
  if (rule.id.startsWith('clinic-') && rule.id !== 'clinic-directory') {
    const clinicId = rule.id.slice('clinic-'.length);
    assert.equal(
      rule.linkKey,
      `clinic:${clinicId}`,
      `${rule.id}: clinic reply bound to another clinic`,
    );
  }
  assert.ok(
    replies.includes(rule.text),
    `${rule.id}: complete reply absent from copy export`,
  );
}
assert.equal(
  keywordOwners.size,
  27,
  'Expected 27 distinct full-match keywords',
);
const priceRule = rulesFile.rules.find((rule) => rule.id === 'clinical-prices');
assert.ok(
  !/99|1000/.test(priceRule.text),
  'Patient pricing must not return platform cooperation fees',
);
assert.equal(
  priceRule.linkKey,
  'clinics',
  'Patient pricing must first select the clinic',
);
assert.ok(
  !priceRule.target.includes('/cooperation'),
  'Patient pricing cannot route to sales',
);
const activities = rulesFile.rules.find((rule) => rule.id === 'activities');
assert.equal(activities.target, null);
assert.equal(activities.linkKey, undefined);
assert.equal(
  urls(activities.text).length,
  0,
  'No expired or empty activity link may be offered',
);
assert.ok(!/<a\b|href\s*=/i.test(activities.text));
assert.match(
  activities.text,
  /暂无.*活动/,
  'No valid activities must be stated explicitly',
);
const cooperation = rulesFile.rules.find((rule) => rule.id === 'cooperation');
assert.match(cooperation.text, /99元\/月或1000元\/年/);
assert.ok(
  cooperation.text.includes(platform.platformPhone),
  'Cooperation needs the shared platform contact',
);

function section(start, end) {
  const startIndex = replies.indexOf(start);
  const endIndex = replies.indexOf(end, startIndex + start.length);
  assert.ok(
    startIndex >= 0 && endIndex > startIndex,
    'Reply copy section missing',
  );
  return replies.slice(startIndex + start.length, endIndex).trim();
}
const welcome = section(
  '=== 关注后回复正文 ===',
  '=== 收到消息/未匹配回复正文 ===',
);
const unmatched = section(
  '=== 收到消息/未匹配回复正文 ===',
  `=== ${rulesFile.rules[0].id} ===`,
);
assert.equal(welcome, expand(copy.welcome.text, 'wechat_welcome').trim());
assert.equal(unmatched, expand(copy.unmatched.text, 'wechat_message').trim());
checkTextUrls(welcome, 'wechat_welcome', 'welcome');
checkTextUrls(unmatched, 'wechat_message', 'unmatched');
assert.equal(
  article,
  expand(
    await read('docs/wechat/first-use-article.md'),
    'wechat_article',
  ).replaceAll('](../previews/', '](../../previews/'),
  'Generated article is stale',
);
const articleImages = [...article.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
assert.ok(
  articleImages.length >= 3,
  'First-use article must include real screenshots',
);
for (const [, imagePath] of articleImages) {
  const imageFile = path.resolve(root, generatedRoot, imagePath);
  assert.ok(
    imageFile.startsWith(path.join(root, 'docs', 'previews') + path.sep),
  );
  assert.ok(
    (await stat(imageFile)).isFile(),
    `Article image missing: ${imagePath}`,
  );
}
checkTextUrls(article, 'wechat_article', 'first-use article');
for (const [name, text] of [
  ['menu', JSON.stringify(menu)],
  ['keyword-rules', JSON.stringify(rulesFile)],
  ['links', JSON.stringify(linksFile)],
  ['replies', replies],
  ['article', article],
  ['menu-table', menuTable],
]) {
  assert.ok(!/\{\{[^{}]+\}\}/.test(text), `${name}: unexpanded template`);
}

// Check real source routes even in source-only mode. Static mode additionally
// rejects missing exports, fallback 404 HTML, and indexed source-query variants.
let staticPages = 0;
for (const pathname of observedPaths) {
  const route = pathname === '/' ? '' : pathname.slice(1, -'.html'.length);
  const sourcePath = path.join(root, 'app', route, 'page.tsx');
  assert.ok(
    (await stat(sourcePath)).isFile(),
    `${pathname}: source route does not exist`,
  );
  if (sourceOnly) continue;
  const outputPath = path.join(
    root,
    'dist/client',
    pathname === '/' ? 'index.html' : pathname.slice(1),
  );
  assert.ok(
    (await stat(outputPath)).isFile(),
    `${pathname}: actual static HTML missing`,
  );
  const html = await readFile(outputPath, 'utf8');
  assert.match(html, /<html\b/i, `${pathname}: exported content is not HTML`);
  assert.ok(
    !/<title[^>]*>[^<]*(?:404|not found|页面未找到)/i.test(html),
    `${pathname}: fallback 404 is not a working target`,
  );
  if (pathname.startsWith('/clinics/')) {
    const canonical = [...html.matchAll(/<link\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .find((tag) => /\brel=["']canonical["']/i.test(tag));
    assert.ok(canonical, `${pathname}: share page requires a canonical`);
    const href = canonical.match(/\bhref=["']([^"']+)["']/i)?.[1];
    assert.equal(
      href,
      new URL(pathname, origin).href,
      `${pathname}: canonical must exclude source parameters`,
    );
  }
  if (pathname === '/wechat-preview.html') {
    assert.match(
      html,
      /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i,
      'Configuration preview must not be indexed',
    );
  }
  staticPages += 1;
}

console.log(
  JSON.stringify(
    {
      result: 'PASS',
      mode: sourceOnly
        ? 'source-only (static exports intentionally skipped)'
        : 'source-and-static',
      menuGroups: menu.button.length,
      menuTargets: 10,
      rules: rulesFile.rules.length,
      uniqueKeywords: keywordOwners.size,
      boundClinics: clinics.length,
      checkedTargetPaths: observedPaths.size,
      staticPages,
      limitations:
        'Does not authenticate WeChat, apply menus, deliver messages, dial phones, verify mini-program booking, or prove clinic authorization.',
    },
    null,
    2,
  ),
);
