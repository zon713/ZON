'use client';

/* eslint-disable next/no-html-link-for-pages -- Plain anchors work directly with the existing COS static export and .html article paths. */
import { MapPin } from 'lucide-react';
import {
  wellnessIndexHref,
  clinicsHref,
  bodyGuideHref,
  visitGuideHref,
  aboutHref,
  cooperationHref,
} from '@/lib/site-links';
import { SiteBack } from '@/components/site-back';
import { BrandMark } from './brand-mark';

export function SiteHeader({
  active = 'home',
  backHref,
}: {
  active?:
    | 'home'
    | 'body'
    | 'clinics'
    | 'visit'
    | 'about'
    | 'appointment'
    | 'wellness'
    | 'cooperation';
  backHref?: string;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-brand-group">
          {backHref ? <SiteBack href={backHref} /> : null}
          <a href="/" className="site-brand" aria-label="汇医盟首页">
            <BrandMark />
            <span className="site-brand-caption">医馆查询 · 日常养护</span>
          </a>
        </div>
        <nav className="site-desktop-nav" aria-label="网站导航">
          <a
            href={cooperationHref}
            aria-current={active === 'cooperation' ? 'page' : undefined}
          >
            医馆合作
          </a>
          <a
            href={aboutHref}
            aria-current={active === 'about' ? 'page' : undefined}
          >
            关于汇医盟
          </a>
          <a
            href={bodyGuideHref}
            aria-current={active === 'body' ? 'page' : undefined}
          >
            人体导览
          </a>
          <a
            href={clinicsHref}
            aria-current={active === 'clinics' ? 'page' : undefined}
          >
            找医馆
          </a>
          <a
            href={wellnessIndexHref}
            aria-current={active === 'wellness' ? 'page' : undefined}
          >
            养生指南
          </a>
          <a
            href={visitGuideHref}
            aria-current={active === 'visit' ? 'page' : undefined}
          >
            到访指南
          </a>
        </nav>
        <div className="site-header-contact">
          <span className="site-city">
            <MapPin size={15} aria-hidden="true" />
            广州
          </span>
        </div>
      </div>
      <nav className="site-mobile-tabs" aria-label="手机网站导航">
        <a
          href={cooperationHref}
          aria-current={active === 'cooperation' ? 'page' : undefined}
        >
          医馆合作
        </a>
        <a
          href={aboutHref}
          aria-current={active === 'about' ? 'page' : undefined}
        >
          关于我们
        </a>
        <a
          href={clinicsHref}
          aria-current={active === 'clinics' ? 'page' : undefined}
        >
          找医馆
        </a>
        <a
          href={wellnessIndexHref}
          aria-current={active === 'wellness' ? 'page' : undefined}
        >
          养生指南
        </a>
        <a
          href={visitGuideHref}
          aria-current={active === 'visit' ? 'page' : undefined}
        >
          到访指南
        </a>
        <a
          href={bodyGuideHref}
          aria-current={active === 'body' ? 'page' : undefined}
        >
          人体导览
        </a>
      </nav>
    </header>
  );
}
