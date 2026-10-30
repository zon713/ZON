import type { Metadata } from 'next';
import { WechatPreview } from '@/components/wechat-preview';
export const metadata: Metadata = {
  title: '公众号菜单与回复审阅稿｜汇医盟',
  description:
    '仅供审阅的公众号菜单、关注回复与关键词规则，不代表公众号已配置。',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.huiyimeng.com/wechat-preview.html' },
};
export default function Page() {
  return <WechatPreview />;
}
