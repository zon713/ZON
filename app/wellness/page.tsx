import type { Metadata } from 'next';
import { ArrowRight, BookOpenText, ChevronRight, ShieldCheck } from 'lucide-react';
import { wellnessArticleHref } from '@/lib/site-links';

import { WellnessHeader } from './wellness-header';
import { wellnessArticles } from './content';

export const metadata: Metadata = {
  title: '养生指南｜汇医盟',
  description: '从吃饭、睡觉和日常活动这些小事开始，读几篇简单、实用的健康科普文章。',
};

export default function WellnessHome() {
  const [featured, ...moreArticles] = wellnessArticles;
  const FeaturedIcon = featured.icon;

  return (
    <main className="min-h-screen bg-[#f2eee5] text-[#173d35]">
      <WellnessHeader />

      <section className="wellness-hero relative overflow-hidden text-[#f8f1df]">
        <div className="hero-paper-texture absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-7 px-5 py-9 sm:px-8 sm:py-14 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#ead59c]">
              <span className="h-px w-8 bg-[#d9b968]" aria-hidden="true" />
              汇医盟 · 养生指南
            </p>
            <h1 className="mt-4 text-[2.4rem] font-bold leading-[1.15] tracking-[-0.04em] text-white sm:text-[3.5rem]">
              把日子<span className="text-[#ead59c]">过顺一点</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#cedcd6]">
              吃饭、睡觉、活动身体。挑一个眼下关心的话题读一读，不急着给自己下结论。
            </p>
          </div>
          <div className="wellness-hero-note relative hidden rounded-[1.25rem] border border-[#ddc782]/45 px-6 py-5 text-[#173d35] md:block md:px-7 md:py-6">
            <span className="absolute -right-1 -top-6 select-none font-serif text-[7rem] leading-none text-[#a87a32]/[0.07]" aria-hidden="true">读</span>
            <p className="relative text-xs font-bold tracking-[0.2em] text-[#9a6d2b]">给自己一点时间</p>
            <p className="relative mt-3 max-w-sm text-lg font-bold leading-8">一篇文章，一件可以从日常做起的小事。</p>
            <p className="relative mt-3 text-sm leading-6 text-[#6b766e]">内容仅作健康常识参考；持续不适，请向专业医务人员咨询。</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14" aria-labelledby="guide-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#9a6d2b]">日常养护 · 四个话题</p>
            <h2 id="guide-title" className="mt-2 text-3xl font-bold tracking-[-0.03em]">先从关心的那一篇读起</h2>
          </div>
          <p className="text-sm text-[#6f817b]">慢慢看，不用一次读完</p>
        </div>

        <a
          href={wellnessArticleHref(featured.slug)}
          aria-label={`阅读文章：${featured.title}`}
          className="group mt-7 grid overflow-hidden rounded-[1.5rem] border border-[#d4c9af] bg-[#fffdf8] shadow-[0_16px_42px_rgba(39,55,49,0.09)] transition-transform hover:-translate-y-0.5 md:grid-cols-[1.1fr_0.9fr]"
        >
          <span className="flex flex-col justify-between px-6 py-7 sm:px-9 sm:py-9">
            <span>
              <span className="flex items-center gap-3 text-sm font-semibold text-[#8b6429]">
                <span className="grid size-10 place-items-center rounded-full bg-[#efe5cf]"><FeaturedIcon className="size-5" aria-hidden="true" /></span>
                本期先读 <span className="font-normal text-[#87928e]">· {featured.readingTime}</span>
              </span>
              <span className="mt-7 block text-[1.8rem] font-bold tracking-[-0.03em] text-[#173d35] sm:text-[2.2rem]">{featured.title}</span>
              <span className="mt-4 block max-w-lg text-base leading-8 text-[#667a72]">{featured.summary}</span>
            </span>
            <span className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#176b53]/30 pb-1 text-sm font-bold text-[#176b53]">
              开始阅读 <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </span>
          <span className="wellness-feature-art relative hidden min-h-64 overflow-hidden md:grid" aria-hidden="true">
            <span className="absolute left-8 top-8 text-xs font-semibold tracking-[0.28em] text-[#5b7969]">THE FOUR SEASONS</span>
            <span className="relative z-10 place-self-center font-serif text-[5.5rem] tracking-[0.18em] text-[#1f6653]">四时</span>
            <span className="absolute bottom-8 right-8 text-xs tracking-[0.22em] text-[#7b916f]">顺时而养 · 不必勉强</span>
          </span>
        </a>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {moreArticles.map((article, index) => {
            const Icon = article.icon;
            return (
              <a
                key={article.slug}
                href={wellnessArticleHref(article.slug)}
                className="group relative flex min-h-64 flex-col overflow-hidden rounded-[1.35rem] border border-[#173d35]/10 bg-[#fffdf8] p-6 shadow-[0_10px_28px_rgba(39,55,49,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#b98a3d]/45"
              >
                <span className="absolute right-5 top-2 font-serif text-[4rem] leading-none text-[#173d35]/[0.06]" aria-hidden="true">{String(index + 2).padStart(2, '0')}</span>
                <span className="flex items-center gap-3 text-sm font-semibold" style={{ color: article.accent }}>
                  <span className="grid size-10 place-items-center rounded-full bg-[#efe5cf] text-[#8b6429]"><Icon className="size-5" aria-hidden="true" /></span>
                  {article.eyebrow} <span className="font-normal text-[#87928e]">· {article.readingTime}</span>
                </span>
                <span className="mt-8 block text-2xl font-bold tracking-[-0.025em] text-[#173d35]">{article.shortTitle}</span>
                <span className="mt-3 block flex-1 text-sm leading-7 text-[#667a72]">{article.summary}</span>
                <span className="mt-6 inline-flex w-fit items-center gap-1.5 border-b border-[#176b53]/25 pb-0.5 text-sm font-semibold text-[#176b53]">
                  阅读文章 <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#173d35]/10 bg-[#e9e2d4]">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-9 sm:px-8 md:grid-cols-[auto_1fr] md:items-center md:gap-7">
          <span className="grid size-11 place-items-center rounded-full bg-[#173d35] text-[#f4e8c8]"><ShieldCheck className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 className="text-lg font-bold">读完文章，也记得照顾实际感受</h2>
            <p className="mt-1 text-sm leading-7 text-[#667a72]">每篇文章附有参考资料，供了解常识。身体不适持续、加重或影响日常生活时，请及时到正规医疗机构就诊。</p>
          </div>
        </div>
      </section>

      <footer className="bg-[#faf7ef] px-5 py-7 text-center text-sm text-[#6f817b]">
        <BookOpenText className="mx-auto mb-2 size-4 text-[#8b6429]" aria-hidden="true" />
        汇医盟 · 把健康常识讲得简单一点
      </footer>
    </main>
  );
}
