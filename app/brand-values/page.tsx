import type { Metadata } from 'next';
import { SiteExperience } from '@/components/site-experience';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/brand-values.html' }, title: '我们的理念｜汇医盟', description: '专业为本、尊重选择、协作同行。了解汇医盟对医馆协作与服务连接的理念。' };
export default function Page() { return <SiteExperience view="values" />; }
