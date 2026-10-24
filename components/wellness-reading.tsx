'use client';

/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Lightweight original SVGs and COS static routes. */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { wellnessArticles } from '@/app/wellness/content';
import { wellnessArticleHref, wellnessIndexHref } from '@/lib/site-links';
import { articleVisual, wellnessCategories, type WellnessCategory } from '@/lib/wellness-presentation';

function ArticleCard({ article, compact = false }: { article: typeof wellnessArticles[number]; compact?: boolean }) {
  const visual = articleVisual(article.slug);
  return <a href={wellnessArticleHref(article.slug)} className={`reading-card${compact ? ' reading-card-compact' : ''}`} aria-label={`阅读文章：${article.title}`}>
    <div className="reading-card-image"><img src={visual.image} alt={visual.alt} width={800} height={460} loading="lazy" decoding="async" /><span>{article.eyebrow}</span></div>
    <div className="reading-card-copy"><span className="reading-card-meta">{article.readingTime} · 日常参考</span><h3>{compact ? article.shortTitle : article.title}</h3><p>{article.summary}</p><span className="reading-card-action">开始阅读<ArrowUpRight size={17} aria-hidden="true" /></span></div>
  </a>;
}

export function HomeWellnessShelf() {
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState(0);
  const [lastPosition, setLastPosition] = useState(wellnessArticles.length - 1);
  useEffect(() => {
    const element = track.current; if (!element) return;
    const update = () => { const step = (element.children[0] as HTMLElement).getBoundingClientRect().width + 16; setLastPosition(Math.round((element.scrollWidth - element.clientWidth) / step)); };
    const observer = new ResizeObserver(update); observer.observe(element); update();
    return () => observer.disconnect();
  }, []);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const step = (element.children[0] as HTMLElement).getBoundingClientRect().width + 16;
    element.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  return <section className="wellness-preview section-wrap reading-home" aria-labelledby="wellness-preview-title" data-ui-reveal>
    <div className="ui-section-meta"><span>养生指南</span><span>日常健康知识</span></div>
    <div className="section-heading"><div><h2 id="wellness-preview-title">读一点，照顾好日常。</h2><p className="ui-section-description">饮食、作息与活动，向左滑动继续阅读。</p></div><a href={wellnessIndexHref}>全部 {wellnessArticles.length} 篇<ArrowUpRight size={16} aria-hidden="true" /></a></div>
    <ul ref={track} className="reading-shelf" aria-label="横向滑动浏览养生文章" tabIndex={0} onScroll={() => { const element = track.current; if (element) { const step = (element.children[0] as HTMLElement).getBoundingClientRect().width + 16; setPosition(Math.round(element.scrollLeft / step)); } }}>
      {wellnessArticles.map((article) => <li key={article.slug}><ArticleCard article={article} compact /></li>)}
    </ul>
    <div className="reading-shelf-controls"><span><b>{String(position + 1).padStart(2, '0')}</b> / {wellnessArticles.length} <small>滑动阅读</small></span><div><button type="button" aria-label="上一篇养生文章" disabled={position === 0} onClick={() => move(-1)}><ChevronLeft size={19} /></button><button type="button" aria-label="下一篇养生文章" disabled={position >= lastPosition} onClick={() => move(1)}><ChevronRight size={19} /></button></div></div>
    <p className="wellness-preview-note">健康科普供日常参考，不能代替医生诊疗。</p>
  </section>;
}

export function WellnessLibrary() {
  const [category, setCategory] = useState<WellnessCategory>('全部');
  const [page, setPage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const articles = wellnessArticles.filter((article) => category === '全部' || articleVisual(article.slug).category === category);
  const pageCount = Math.ceil(articles.length / 3);
  function changePage(next: number) {
    setPage(next);
    heading.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  return <section className="reading-library" aria-labelledby="guide-title">
    <div className="reading-library-heading"><div><p className="editorial-label">日常养护 · {wellnessArticles.length} 篇阅读</p><h2 id="guide-title" ref={heading}>选一篇，慢慢读。</h2></div><span>每组 3 篇 · 图文阅读</span></div>
    <div className="reading-filters" aria-label="文章主题筛选">{wellnessCategories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setPage(0); }}>{item}</button>)}</div>
    <div className="reading-library-grid" key={`${category}-${page}`}>{articles.slice(page * 3, page * 3 + 3).map((article) => <ArticleCard article={article} key={article.slug} />)}</div>
    <nav className="reading-pagination" aria-label="文章分页"><button type="button" disabled={page === 0} onClick={() => changePage(page - 1)}><ArrowLeft size={17} aria-hidden="true" />上一组</button><span aria-live="polite">第 {page + 1} / {pageCount} 组 · 共 {articles.length} 篇</span><button type="button" disabled={page + 1 === pageCount} onClick={() => changePage(page + 1)}>下一组<ArrowRight size={17} aria-hidden="true" /></button></nav>
  </section>;
}
