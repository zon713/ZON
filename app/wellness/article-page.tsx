import { BookOpenText, ShieldAlert } from 'lucide-react';
import { wellnessIndexHref } from '@/lib/site-links';

import type { WellnessArticle } from './content';
import { WellnessHeader } from './wellness-header';

export function WellnessArticlePage({ article }: { article: WellnessArticle }) {
  const Icon = article.icon;

  return (
    <main className="min-h-screen bg-[#f2eee5] text-[#173d35]">
      <WellnessHeader backHref={wellnessIndexHref} />

      <article>
        <header className="mx-auto max-w-4xl px-5 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-12">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: article.accent }}>
            <Icon className="size-5" aria-hidden="true" />
            <span>{article.eyebrow}</span>
            <span className="text-[#87928e]">· {article.readingTime}</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-[2rem] font-bold leading-[1.25] tracking-tight sm:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#667a72]">{article.summary}</p>
          <div className="mt-6 flex items-center gap-3 border-y border-[#173d35]/9 py-3 text-sm text-[#71827c]">
            <span>汇医盟整理</span>
            <span>读完后，挑一两件适合自己的慢慢做</span>
          </div>
        </header>

        <div className="mx-auto grid max-w-4xl gap-8 px-5 pb-14 sm:px-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
          <div>
            <p className="border-l-2 border-[#c7a762] pl-5 text-lg font-medium leading-9 text-[#31564b]">
              {article.opening}
            </p>

            <div className="mt-9 space-y-10">
              {article.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                  <p className="mt-3 text-base leading-8 text-[#536c63]">{section.body}</p>
                  {section.points ? (
                    <ul className="mt-4 grid gap-2.5 border-l border-[#173d35]/15 pl-4">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-3 text-[15px] leading-7 text-[#536c63]">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#b08a49]" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.25rem] border border-[#c5a15a]/45 bg-[#fffdf8] p-5 shadow-[0_12px_28px_rgba(39,55,49,0.06)] md:sticky md:top-5">
            <BookOpenText className="size-5 text-[#176b53]" aria-hidden="true" />
            <p className="mt-3 font-bold">整理时参考了</p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-sm leading-6 text-[#667a72] underline decoration-[#176b53]/25 underline-offset-4 hover:text-[#176b53]"
            >
              {article.sourceLabel}
            </a>
            <div className="mt-5 border-t border-[#173d35]/8 pt-5 text-sm leading-6 text-[#74857e]">
              每个人的身体情况不同，文章只能作日常参考，不能代替医生判断。
            </div>
          </aside>
        </div>
      </article>

      <section className="border-y border-[#173d35]/8 bg-[#143f35] text-white">
        <div className="mx-auto max-w-4xl px-5 py-9 sm:px-8 sm:py-11">
          <p className="flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-[#f0d99e]">
            <ShieldAlert className="size-4" aria-hidden="true" />
            什么时候该寻求专业帮助
          </p>
          <h2 className="mt-2 text-xl font-bold">{article.visitTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">{article.visitBody}</p>
        </div>
      </section>

      <footer className="bg-[#faf7ef] px-5 py-7 text-center text-sm leading-6 text-[#71827c]">
        如遇急症或症状迅速加重，请立即拨打 120 或前往医院急诊。
      </footer>
    </main>
  );
}
