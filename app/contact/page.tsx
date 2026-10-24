import type { Metadata } from 'next';
import { SiteExperience } from '@/components/site-experience';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/contact.html' }, title: '联系与资料更新｜汇医盟', description: '医馆收录、门店信息与预约入口更新的联系方式。' };
export default function Page() { return <SiteExperience view="contact" />; }
