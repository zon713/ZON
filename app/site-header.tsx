/* eslint-disable next/no-html-link-for-pages -- Plain anchors work directly with the existing COS static export and .html article paths. */
import { ArrowLeft, ArrowUpRight, MapPin, PhoneCall } from 'lucide-react';
import { wellnessIndexHref } from '@/lib/site-links';
import { BrandMark } from './brand-mark';

export function SiteHeader({
  active = 'clinics',
  backHref,
}: {
  active?: 'clinics' | 'wellness';
  backHref?: string;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-brand-group">
          {backHref ? (
            <a className="site-back" href={backHref} aria-label="返回">
              <ArrowLeft size={18} aria-hidden="true" />
            </a>
          ) : null}
          <a
            href={active === 'clinics' ? '#top' : '/'}
            className="site-brand"
            aria-label="汇医盟首页"
          >
            <BrandMark />
            <span>
              <strong>汇医盟</strong>
              <small>诊所信息 · 日常养护</small>
            </span>
          </a>
        </div>
        <nav className="site-desktop-nav" aria-label="网站导航">
          <a
            href="/#clinics"
            aria-current={active === 'clinics' ? 'page' : undefined}
          >
            找诊所
          </a>
          <a
            href={wellnessIndexHref}
            aria-current={active === 'wellness' ? 'page' : undefined}
          >
            养生指南
          </a>
          <a href="/#about">关于我们</a>
        </nav>
        <div className="site-header-contact">
          <span className="site-city">
            <MapPin size={15} aria-hidden="true" />
            广州
          </span>
          <a href="tel:17819751419" aria-label="电话联系汇医盟平台">
            <PhoneCall size={16} aria-hidden="true" />
            <span>联系平台</span>
            <ArrowUpRight
              className="site-contact-arrow"
              size={15}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
