import fs from 'node:fs';
import path from 'node:path';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const platform = read('content/platform-links.json'),
  copy = read('content/wechat-content.json'),
  clinics = read('content/clinics-source.json').clinics;
const out = 'docs/wechat/generated';
fs.mkdirSync(out, { recursive: true });
function target(key, entry) {
  if (key === 'firstUse') key = 'serviceGuide';
  if (key.startsWith('clinic:')) {
    const id = key.slice(7);
    if (!clinics.some((c) => c.id === id))
      throw new Error(`Unknown clinic ${id}`);
    const url = new URL(
      `${platform.routes.clinics}/${encodeURIComponent(id)}.html`,
      platform.siteOrigin,
    );
    url.searchParams.set('clinic', id);
    url.searchParams.set('source', 'platform');
    url.searchParams.set('entry', entry);
    return url.toString();
  }
  if (!Object.hasOwn(platform.routes, key))
    throw new Error(`Unknown route ${key}`);
  const route = platform.routes[key],
    url = new URL(route === '/' ? '/' : `${route}.html`, platform.siteOrigin);
  url.searchParams.set('entry', entry);
  return url.toString();
}
function render(text, entry) {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key) =>
    key === 'platformPhone' ? platform.platformPhone : target(key, entry),
  );
}
const menu = {
  button: platform.wechat.menuGroups.map((group) => ({
    name: group.name,
    sub_button: group.items.map((item) => ({
      type: 'view',
      name: item.name,
      url: target(item.route, 'wechat_menu'),
    })),
  })),
};
const rules = copy.rules.map((rule) => ({
  ...rule,
  text: render(rule.text, 'wechat_keyword'),
  fallback: render(rule.fallback, 'wechat_keyword'),
  target: rule.linkKey ? target(rule.linkKey, 'wechat_keyword') : null,
}));
const welcome = render(copy.welcome.text, 'wechat_welcome'),
  unmatched = render(copy.unmatched.text, 'wechat_message');
const json = (file, value) =>
  fs.writeFileSync(path.join(out, file), JSON.stringify(value, null, 2) + '\n');
json('menu.json', menu);
json('keyword-rules.json', {
  status: 'draft_not_applied',
  matchNote:
    '全部完整词匹配；实际后台提供全匹配时使用，否则先人工复核，不能假设功能已开放。',
  rules,
});
json('links.json', {
  status: 'draft_not_applied',
  websiteReleaseStatus: platform.wechat.websiteReleaseStatus,
  origin: platform.siteOrigin,
  links: Object.fromEntries(
    Object.keys(platform.routes).map((key) => [
      key,
      target(key, 'wechat_menu'),
    ]),
  ),
});
fs.writeFileSync(
  path.join(out, 'menu-table.md'),
  `# 公众号菜单配置草稿\n\n状态：未应用到公众号。需先发布并验收目标网页，再在有权限的原生后台逐项配置；menu.json 不会自行生效。所有动作拟使用“跳转网页 / view”，权限待后台核查。\n\n| 主菜单 | 子菜单 | 动作 | 正式目标地址 | 状态 |\n|---|---|---|---|---|\n${menu.button.flatMap((group) => group.sub_button.map((item) => `| ${group.name} | ${item.name} | view（待权限核查） | ${item.url} | 待网页发布、待后台配置 |`)).join('\n')}\n\n“最新活动”当前无核实有效活动；“中医科普”当前无完成审核的文章记录，因此两项暂不加入菜单，旧文章网址仍保留。\n`,
);
fs.writeFileSync(
  path.join(out, 'replies.txt'),
  `汇医盟公众号回复配置稿（未在后台生效）\n先检查网页部署、后台权限与现有规则；下列正文分区可复制，分隔标题不粘贴。\n\n=== 关注后回复正文 ===\n${welcome}\n\n=== 收到消息/未匹配回复正文 ===\n${unmatched}\n\n${rules.map((rule) => `=== ${rule.id} ===\n关键词：${rule.keywords.join('、')}\n拟匹配：全匹配（后台能力待确认）\n回复正文：\n${rule.text}\n\n运营处理（不粘贴到自动回复正文）：${rule.fallback}\n`).join('\n')}`,
);
fs.writeFileSync(
  path.join(out, 'first-use-article.md'),
  render(
    fs.readFileSync('docs/wechat/first-use-article.md', 'utf8'),
    'wechat_article',
  ).replaceAll('](../previews/', '](../../previews/'),
);
console.log(
  JSON.stringify({
    status: 'draft_not_applied',
    menuGroups: menu.button.length,
    menuTargets: menu.button.flatMap((g) => g.sub_button).length,
    rules: rules.length,
    replyLengths: rules.map((r) => ({
      id: r.id,
      characters: Array.from(r.text).length,
    })),
    output: out,
  }),
);
