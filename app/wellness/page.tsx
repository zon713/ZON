import type { Metadata } from 'next';
import { BookOpenText, ShieldCheck } from 'lucide-react';
import { WellnessLibrary } from '@/components/wellness-reading';
import { WellnessHeader } from './wellness-header';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/wellness.html' }, title: '养生指南｜汇医盟', description: '12 篇图文养生阅读，围绕时令、饮食、作息和日常活动，附参考资料与注意事项。' };

export default function WellnessHome() {
  return <main className="wellness-page min-h-screen text-[#173d35]">
    <WellnessHeader />
    <section className="wellness-hero reading-library-hero"><div className="hero-paper-texture" aria-hidden="true" /><div className="reading-library-hero-inner"><div><p>汇医盟 · 养生指南</p><h1>在日常里，<br /><em>照顾好自己。</em></h1><span>从一餐、一夜好眠，到一段轻松的步行。<br />选一个话题，读一点生活里的健康常识。</span></div><div className="reading-library-hero-art" aria-hidden="true"><BookOpenText size={75} strokeWidth={.8} /><span>时令 · 饮食 · 作息 · 活动</span></div></div></section>
    <WellnessLibrary />
    <section className="reading-boundary"><ShieldCheck size={25} strokeWidth={1.3} aria-hidden="true" /><div><h2>日常参考，专业问题交给医生。</h2><p>每篇文章附有参考资料。身体不适持续、加重或影响生活时，请及时到正规医疗机构就诊。</p></div></section>
    <footer className="reading-library-footer">汇医盟 · 养生指南</footer>
  </main>;
}
