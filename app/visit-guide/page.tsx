import type { Metadata } from 'next';
import { SiteExperience } from '@/components/site-experience';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/visit-guide.html' }, title: '到访指南｜汇医盟', description: '预约前、到馆时和离馆后的准备事项及常见问答。' };
export default function Page() { return <SiteExperience view="visit" />; }
