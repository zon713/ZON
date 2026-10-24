import type { Metadata } from 'next';
import { SiteExperience } from '@/components/site-experience';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/appointment.html' }, title: '医馆预约｜汇医盟', description: '选择医馆，查看微信小程序预约或电话联系入口及到访准备。' };
export default function Page() { return <SiteExperience view="appointment" />; }
