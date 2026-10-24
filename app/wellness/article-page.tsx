/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Original SVG art and static COS routes. */
import { BookOpenText, ShieldAlert } from 'lucide-react';
import { wellnessIndexHref, wellnessArticleHref } from '@/lib/site-links';
import { articleVisual } from '@/lib/wellness-presentation';
import { wellnessArticles } from './content';

import type { WellnessArticle } from './content';
import { WellnessHeader } from './wellness-header';

export function WellnessArticlePage({ article }: { article: WellnessArticle }) {
  const Icon = article.icon;
  const visual = articleVisual(article.slug);

  return (
    <main className="wellness-page min-h-screen text-[#173d35]">
      <WellnessHeader backHref={wellnessIndexHref} />

      <article data-article-slug={article.slug}>
        <header className="mx-auto max-w-4xl px-5 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-12">
          <div
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: article.accent }}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{article.eyebrow}</span>
            <span className="text-[#87928e]">· {article.readingTime}</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-[2rem] font-bold leading-[1.25] tracking-tight sm:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#667a72]">
            {article.summary}
          </p>
          <div className="mt-6 flex items-center gap-3 border-y border-[#173d35]/9 py-3 text-sm text-[#71827c]">
            <span className="shrink-0">汇医盟整理</span>
            <span>健康科普 · 日常参考</span>
          </div>
          <figure className="article-theme-figure">
            <img
              src={visual.image}
              alt={visual.alt}
              width={800}
              height={460}
              decoding="async"
              fetchPriority="high"
            />
            <figcaption>{visual.caption}</figcaption>
          </figure>
          <details className="mt-5 rounded-lg border border-[#d8dfd2] bg-[#f8f8ef] p-4 text-sm leading-7 text-[#526b5c]">
            <summary>本文专业核查状态：待业务方医疗负责人复核</summary>
            <p>
              本轮保留原站文章。需核查以下内容的医学依据、适用人群、禁忌与就医提示：
              {article.sections.map((section) => section.title).join('；')}；“
              {article.visitTitle}”。参考来源不代表医馆已完成审核。
            </p>
          </details>
        </header>

        <div className="mx-auto grid max-w-4xl gap-8 px-5 pb-14 sm:px-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
          <div>
            <p className="border-l-2 border-[#c7a762] pl-5 text-lg font-medium leading-9 text-[#31564b]">
              {article.opening}
            </p>

            <div className="mt-9 space-y-10">
              {article.sections.map((section) => (
                <section key={section.title} data-ui-reveal>
                  <h2 className="text-xl font-bold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-8 text-[#536c63]">
                    {section.body}
                  </p>
                  {section.points ? (
                    <ul className="mt-4 grid gap-2.5 border-l border-[#173d35]/15 pl-4">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 text-[15px] leading-7 text-[#536c63]"
                        >
                          <span
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-[#b08a49]"
                            aria-hidden="true"
                          />
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
            <BookOpenText
              className="size-5 text-[#176b53]"
              aria-hidden="true"
            />
            <p className="mt-3 font-bold">参考资料</p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-sm leading-6 text-[#667a72] underline decoration-[#176b53]/25 underline-offset-4 hover:text-[#176b53]"
            >
              {article.sourceLabel}
            </a>
            <div className="mt-5 border-t border-[#173d35]/8 pt-5 text-sm leading-6 text-[#74857e]">
              本文仅供健康常识参考，不能代替医生诊断。
            </div>
          </aside>
        </div>
      </article>

      <section className="border-y border-[#173d35]/8 bg-[#143f35] text-white">
        <div className="mx-auto max-w-4xl px-5 py-9 sm:px-8 sm:py-11">
          <p className="flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-[#f0d99e]">
            <ShieldAlert className="size-4" aria-hidden="true" />
            何时需要就医
          </p>
          <h2 className="mt-2 text-xl font-bold">{article.visitTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">
            {article.visitBody}
          </p>
        </div>
      </section>

      <nav className="article-more-reading" aria-label="继续阅读">
        <span>继续读一点</span>
        {wellnessArticles
          .filter(
            (item) =>
              item.slug !== article.slug &&
              articleVisual(item.slug).category === visual.category,
          )
          .slice(0, 2)
          .map((item) => (
            <a key={item.slug} href={wellnessArticleHref(item.slug)}>
              {item.shortTitle}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        <a href={wellnessIndexHref}>
          返回全部文章<span aria-hidden="true">↗</span>
        </a>
      </nav>
      <footer className="bg-[#faf7ef] px-5 py-7 text-center text-sm leading-6 text-[#71827c]">
        如遇急症或症状迅速加重，请立即拨打 120 或前往医院急诊。
      </footer>
    </main>
  );
}
