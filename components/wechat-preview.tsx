'use client';
/* eslint-disable next/no-html-link-for-pages -- Local review uses actual exported COS paths. */
import { useState } from 'react';
import { SiteHeader } from '@/app/site-header';
import {
  wechatMenuGroups,
  wechatTarget,
  wechatWelcome,
  wechatUnmatched,
  wechatKeywordRules,
  previewKeywordReply,
} from '@/lib/wechat';
import type { EntryChannel } from '@/lib/wechat';
import { wechatDraftStatus } from '@/lib/wechat';
import './wechat-preview.css';

const websiteStatusLabels: Record<string, string> = {
  local_not_deployed: '本地开发，待上线验收',
  release_candidate: '本轮网页发布验收中',
  deployed_verified: '网页已上线并完成网页验证，公众号仍待单独核验',
};

function localTarget(key: string, entry: EntryChannel) {
  const u = new URL(wechatTarget(key, entry));
  const route =
    process.env.NODE_ENV === 'production'
      ? u.pathname
      : u.pathname.replace(/\.html$/, '');
  return route + u.search;
}
function CopyText({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState('');
  return (
    <div className="wp-copy">
      <label>
        {label}
        <textarea
          readOnly
          value={text}
          rows={Math.min(14, text.split('\n').length + 1)}
        />
      </label>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setStatus('已复制文本。');
          } catch {
            setStatus('无法自动复制，请选中文本手动复制。');
          }
        }}
      >
        复制正文
      </button>
      <output>{status}</output>
    </div>
  );
}
export function WechatPreview() {
  const [group, setGroup] = useState(0),
    [query, setQuery] = useState(''),
    [reply, setReply] = useState('');
  return (
    <>
      <SiteHeader backHref="/" />
      <main className="wp-page">
        <p className="wp-status">审阅草稿 · 未在公众号生效</p>
        <h1>公众号入口，一处核对。</h1>
        <p>
          本页用于审阅菜单和回复。没有连接公众号消息接口，也不会发送消息或替换后台配置。网页状态：
          {websiteStatusLabels[wechatDraftStatus.websiteReleaseStatus] ??
            '网页发布状态待核对'}
          。
        </p>
        <section className="wp-panel">
          <h2>底部菜单预览</h2>
          <p>
            动作拟为“跳转网页（view）”，账号权限待确认；先部署目标网页，再配置公众号。
          </p>
          <div className="wp-menu-buttons">
            {wechatMenuGroups.map((g, i) => (
              <button
                key={g.name}
                aria-pressed={group === i}
                onClick={() => setGroup(i)}
              >
                {g.name}
              </button>
            ))}
          </div>
          <ul className="wp-targets">
            {wechatMenuGroups[group].items.map((item) => (
              <li key={item.route}>
                <strong>{item.name}</strong>
                <a href={localTarget(item.route, 'wechat_menu')}>
                  打开对应页面
                </a>
                <code>{wechatTarget(item.route, 'wechat_menu')}</code>
              </li>
            ))}
          </ul>
          <p>
            “最新活动”和“中医科普”当前不加入菜单：暂无核实有效活动或已审核文章，不使用空入口占位。
          </p>
        </section>
        <section className="wp-panel">
          <h2>关注回复与未匹配回复</h2>
          <p>
            普通【括号关键词】不是按钮。正文只包含真实完整网址，链接能力须在原生后台预览与微信真机确认。
          </p>
          <CopyText label="关注后回复" text={wechatWelcome} />
          <CopyText label="未匹配消息指引" text={wechatUnmatched} />
        </section>
        <section className="wp-panel">
          <h2>关键词规则审阅</h2>
          <p>
            拟使用原生完整词匹配。这里仅对照草稿，不模拟人工接待，也不证明后台规则已生效。输入仅在本页处理。
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setReply(previewKeywordReply(query).text);
            }}
          >
            <label htmlFor="wp-keyword">完整关键词</label>
            <div className="wp-test">
              <input
                id="wp-keyword"
                value={query}
                maxLength={80}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="如：医馆、费用、汇医堂中医诊所"
              />
              <button>查看草稿回复</button>
            </div>
          </form>
          {reply && <output className="wp-result">{reply}</output>}
          {wechatKeywordRules.map((rule) => (
            <details key={rule.id}>
              <summary>
                {rule.keywords.join(' / ')} <small>完整词匹配</small>
              </summary>
              <CopyText label="回复正文" text={rule.text} />
              <p className="wp-fallback">未配置时的处理：{rule.fallback}</p>
            </details>
          ))}
        </section>
        <section className="wp-panel">
          <h2>上线前需要核对</h2>
          <p>
            公众号类型、当前认证、网页跳转权限、既有关联小程序、服务器或第三方消息接管、真实客服接待时间；保存现有菜单和回复备份。未得到发布授权前，不替换线上设置。
          </p>
          <p>
            统一配置和可复制文件由 <code>pnpm prepare:wechat</code> 生成至{' '}
            <code>docs/wechat/generated</code>，不是公众号接口上传结果。
          </p>
        </section>
      </main>
    </>
  );
}
