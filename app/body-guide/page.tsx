import type { Metadata } from 'next';
import { SiteExperience } from '@/components/site-experience';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/body-guide.html' },
  title: '人体导览｜汇医盟',
  description:
    '通过人体或文字选择部位，查看经专业审核资料的收录状态，并按名称或地区查找医馆。',
};
export default function Page() {
  return <SiteExperience view="body" />;
}
