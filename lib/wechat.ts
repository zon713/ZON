import platform from '@/content/platform-links.json';
import copy from '@/content/wechat-content.json';
import { clinics } from './clinics';

export type WechatRoute = keyof typeof platform.routes;
export type EntryChannel =
  | 'wechat_menu'
  | 'wechat_welcome'
  | 'wechat_keyword'
  | 'wechat_message'
  | 'wechat_article'
  | 'clinic_share'
  | 'platform_share'
  | 'unknown';
export const entryChannels: EntryChannel[] = [
  'wechat_menu',
  'wechat_welcome',
  'wechat_keyword',
  'wechat_message',
  'wechat_article',
  'clinic_share',
  'platform_share',
  'unknown',
];
export const wechatDraftStatus = platform.wechat;
export const wechatMenuGroups = platform.wechat.menuGroups;

export function getEntryChannel(search: string): EntryChannel {
  const params = new URLSearchParams(search);
  if (params.getAll('entry').length !== 1) return 'unknown';
  const entry = params.get('entry');
  return entryChannels.includes(entry as EntryChannel)
    ? (entry as EntryChannel)
    : 'unknown';
}
export function wechatTarget(key: string, entry: EntryChannel): string {
  if (key === 'firstUse') key = 'serviceGuide';
  if (key.startsWith('clinic:')) {
    const id = key.slice(7);
    if (!clinics.some((c) => c.id === id))
      throw new Error('Unknown clinic target');
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
    throw new Error('Unknown page target');
  const route = platform.routes[key as WechatRoute];
  const url = new URL(
    route === '/' ? '/' : `${route}.html`,
    platform.siteOrigin,
  );
  url.searchParams.set('entry', entry);
  return url.toString();
}
export function renderWechatText(
  template: string,
  entry: EntryChannel,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match: string, key: string) =>
    key === 'platformPhone' ? platform.platformPhone : wechatTarget(key, entry),
  );
}
export const wechatWelcome = renderWechatText(
  copy.welcome.text,
  'wechat_welcome',
);
export const wechatUnmatched = renderWechatText(
  copy.unmatched.text,
  'wechat_message',
);
export const wechatKeywordRules = copy.rules.map((rule) => ({
  ...rule,
  text: renderWechatText(rule.text, 'wechat_keyword'),
  fallback: renderWechatText(rule.fallback, 'wechat_keyword'),
}));
/** Local review only. No message is sent to WeChat and nothing is stored. */
export function previewKeywordReply(keyword: string) {
  const matches = wechatKeywordRules.filter((rule) =>
    rule.keywords.includes(keyword.trim()),
  );
  if (matches.length !== 1)
    return {
      matched: false,
      ruleId: null,
      text:
        matches.length > 1
          ? '名称存在歧义，请通过医馆列表选择目标医馆。'
          : wechatUnmatched,
    };
  return { matched: true, ruleId: matches[0].id, text: matches[0].text };
}
