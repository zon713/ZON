import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  );

// Only this renderer may introduce markup into the WeChat reply text.
export function buildWelcome(config, platform) {
  assert.equal(config.status, 'client_display_pending');
  assert.equal(typeof config.text, 'string');
  assert.equal(config.text.split('{{links}}').length, 2);
  assert.equal(config.text.split('{{platformPhone}}').length, 2);
  assert.equal(typeof platform.siteOrigin, 'string');
  const origin = new URL(platform.siteOrigin);
  assert.equal(origin.protocol, 'https:', 'Welcome links require HTTPS');
  assert.ok(
    !origin.username && !origin.password,
    'Credentials are not allowed',
  );
  assert.equal(origin.pathname, '/');
  assert.ok(
    !origin.search && !origin.hash,
    'Origin cannot include query or hash',
  );
  assert.equal(typeof platform.platformPhone, 'string');
  assert.match(platform.platformPhone, /^\+?[0-9][0-9 ()-]{4,24}[0-9]$/);
  assert.ok(Array.isArray(config.links));
  assert.equal(config.links.length, 4);
  assert.deepEqual(
    config.links.map((link) => link.route),
    ['clinics', 'appointment', 'bodyGuide', 'cooperation'],
    'Keep the four agreed entry points in order',
  );

  const links = config.links.map((link) => {
    assert.equal(typeof link.route, 'string');
    assert.match(link.route, /^[A-Za-z][A-Za-z0-9]*$/);
    assert.ok(Object.hasOwn(platform.routes, link.route), 'Unknown route key');
    const route = platform.routes[link.route];
    assert.equal(typeof route, 'string');
    assert.match(
      route,
      /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/,
      'Routes must be absolute local paths without extensions, query or hash',
    );
    assert.equal(typeof link.label, 'string');
    assert.ok(link.label.trim() && !/[\r\n]/.test(link.label));
    assert.equal(typeof link.icon, 'string');
    assert.ok(link.icon.trim() && !/[\r\n]/.test(link.icon));
    const target = new URL(route === '/' ? '/' : `${route}.html`, origin);
    target.searchParams.set('entry', 'wechat_welcome');
    assert.equal(target.origin, origin.origin);
    assert.equal(target.protocol, 'https:');
    return {
      icon: link.icon,
      label: link.label,
      href: target.href,
      markup: `${escapeHtml(link.icon)} <a href="${escapeHtml(target.href)}">${escapeHtml(link.label)}</a>`,
    };
  });

  const text = config.text
    .split(/(\{\{links\}\}|\{\{platformPhone\}\})/)
    .map((part) => {
      if (part === '{{links}}')
        return links.map((link) => link.markup).join('\n');
      if (part === '{{platformPhone}}')
        return escapeHtml(platform.platformPhone);
      return escapeHtml(part);
    })
    .join('');
  assert.ok(!/\{\{[^{}]+\}\}/.test(text), 'Unresolved welcome placeholder');
  assert.equal((text.match(/<a href="https:\/\//g) || []).length, 4);
  assert.equal((text.match(/<\/a>/g) || []).length, 4);
  assert.ok(
    !/<[^>]*>/.test(text.replace(/<a href="[^"]+">|<\/a>/g, '')),
    'The reply may contain anchor tags only',
  );
  const characters = Array.from(text).length;
  assert.ok(
    characters <= 600 && text.length <= 600,
    'Welcome exceeds 600 characters',
  );
  return { text, links, characters, utf16Units: text.length };
}

function generate() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const read = (file) =>
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const config = read('content/wechat-welcome-links.json');
  const platform = read('content/platform-links.json');
  const welcome = buildWelcome(config, platform);
  const preview = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>汇医盟欢迎回复 · 本地排版预览</title>
<style>
body{margin:0;background:#f4f6f5;color:#192b24;font-family:system-ui,"Microsoft YaHei",sans-serif;line-height:1.75}
main{max-width:560px;margin:32px auto;padding:0 20px 32px}
h1{font-size:20px;margin:0 0 8px}.status{font-size:14px;color:#53665d}
.reply{white-space:pre-line;overflow-wrap:anywhere;border:1px solid #dbe5df;border-radius:16px;background:#fff;padding:24px;margin-top:20px}
a{color:#1767a2;text-decoration:underline;text-underline-offset:3px}
@media(max-width:600px){main{margin-top:20px}.reply{padding:20px}}
</style>
</head>
<body>
<main>
<h1>欢迎回复本地排版预览</h1>
<p class="status">微信客户端显示待验；本地蓝字样式不能证明公众号消息已生效。此文件不会保存或发布回复，实际状态由现场测试结果另行更新。</p>
<div class="reply">${welcome.text}</div>
<p class="status">配置字符数：${welcome.characters}；含链接标签。只复制 welcome-linked-text.txt 的正文到后台。</p>
</main>
</body>
</html>
`;
  const output = path.join(root, 'docs/wechat/generated');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'welcome-linked-text.txt'), welcome.text);
  fs.writeFileSync(path.join(output, 'welcome-linked-preview.html'), preview);
  console.log(
    JSON.stringify({
      status: config.status,
      characters: welcome.characters,
      utf16Units: welcome.utf16Units,
      targets: welcome.links.length,
      output: 'docs/wechat/generated/welcome-linked-{text.txt,preview.html}',
      limitation:
        'Local preview only; WeChat client rendering and applied status require on-site verification.',
    }),
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generate();
}
