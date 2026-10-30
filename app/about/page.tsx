import type { Metadata } from 'next';
import { SiteExperience } from '@/components/site-experience';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/about.html' }, title: '关于汇医盟｜品牌介绍', description: '汇医盟以中医为纽带，连接医馆、专业人员与健康产业资源，开展机构协作、品牌内容和数字服务。' };
export default function Page() { return <SiteExperience view="about" />; }
