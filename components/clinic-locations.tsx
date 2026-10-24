'use client';

/* eslint-disable next/no-html-link-for-pages -- Static COS pages use shared .html links. */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Navigation,
  PhoneCall,
  Search,
  X,
} from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import { clinics } from '@/lib/clinics';
import {
  appointmentHref,
  clinicDetailHref,
  clinicsHref,
  serviceGuideHref,
} from '@/lib/site-links';
import { ClinicEventLink } from '@/components/clinic-events';
import './clinic-locations.css';

const areas = [...new Set(clinics.map((clinic) => clinic.area))];

export function ClinicLocations() {
  const [keyword, setKeyword] = useState('');
  const [area, setArea] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      setKeyword(params.get('q') ?? '');
      const requestedArea = params.get('area') ?? '';
      setArea(areas.includes(requestedArea) ? requestedArea : '');
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    if (keyword) url.searchParams.set('q', keyword);
    else url.searchParams.delete('q');
    if (area) url.searchParams.set('area', area);
    else url.searchParams.delete('area');
    window.history.replaceState(window.history.state, '', url);
  }, [keyword, area, ready]);

  const results = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return clinics.filter(
      (clinic) =>
        (!area || clinic.area === area) &&
        (!search ||
          `${clinic.name} ${clinic.area} ${clinic.address}`
            .toLowerCase()
            .includes(search)),
    );
  }, [keyword, area]);

  function resetFilters() {
    setKeyword('');
    setArea('');
  }

  return (
    <>
      <a className="site-skip-link" href="#locations-main">
        跳到医馆位置
      </a>
      <SiteHeader active="clinics" backHref="/" />
      <main className="locations-page" id="locations-main">
        <header className="locations-intro">
          <p className="locations-eyebrow">就医服务 · 到店导航</p>
          <h1>
            先选医馆，
            <br />
            再确认怎么到店。
          </h1>
          <p>
            查找本馆地址，电话确认接诊地点，再打开地图。
            这里的地址沿用原网站资料，正待医馆逐家复核。
          </p>
          <div className="locations-intro-links">
            <a href={appointmentHref}>
              先联系预约 <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href={serviceGuideHref}>
              查看就诊指南 <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </header>

        <section aria-labelledby="locations-results-title">
          <div className="locations-filter-panel">
            <div className="locations-search">
              <Search size={20} aria-hidden="true" />
              <label className="sr-only" htmlFor="locations-keyword">
                搜索医馆名称或地址
              </label>
              <input
                id="locations-keyword"
                type="search"
                placeholder="输入医馆名称或街道"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                autoComplete="off"
              />
              {keyword ? (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="清除搜索"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <fieldset className="locations-areas">
              <legend className="sr-only">按地区筛选</legend>
              {['', ...areas].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={area === item}
                  onClick={() => setArea(item)}
                >
                  {item || '全部地区'}
                </button>
              ))}
            </fieldset>
          </div>
          <div className="locations-results-heading">
            <h2 id="locations-results-title">
              医馆位置 <span aria-live="polite">{results.length} 家</span>
            </h2>
            {keyword || area ? (
              <button type="button" onClick={resetFilters}>
                清除筛选
              </button>
            ) : null}
          </div>
          <p className="locations-directory-note">
            按原目录收录顺序展示。地图为外部服务，路线、交通与营业信息请再向医馆确认。
          </p>

          {results.length ? (
            <div className="locations-grid">
              {results.map((clinic) => (
                <article className="locations-card" key={clinic.id}>
                  <div className="locations-card-heading">
                    <span className="locations-area">
                      <MapPin size={14} aria-hidden="true" />
                      {clinic.area}
                    </span>
                    <span className="locations-status">原站资料 · 待复核</span>
                  </div>
                  <h3>
                    <a href={clinicDetailHref(clinic.id)}>{clinic.name}</a>
                  </h3>
                  <p className="locations-address">{clinic.address}</p>
                  {clinic.addressNeedsConfirmation ? (
                    <p className="locations-address-alert">
                      原站留有两处地址，实际接诊地点待医馆确认。请先电话核对，暂不提供导航。
                    </p>
                  ) : (
                    <p className="locations-address-tip">
                      到访前请向本馆确认楼层、入口和接诊安排。
                    </p>
                  )}
                  <dl className="locations-facts">
                    <div>
                      <dt>营业时间</dt>
                      <dd>{clinic.hours ?? '待医馆确认'}</dd>
                    </div>
                    <div>
                      <dt>交通信息</dt>
                      <dd>暂未收录经确认的交通说明</dd>
                    </div>
                  </dl>
                  <div className="locations-card-actions">
                    {clinic.navigationUrl &&
                    !clinic.addressNeedsConfirmation ? (
                      <ClinicEventLink
                        clinicId={clinic.id}
                        event="navigation_click"
                        href={clinic.navigationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="locations-button locations-button-primary"
                      >
                        <Navigation size={17} aria-hidden="true" />
                        导航到店
                      </ClinicEventLink>
                    ) : null}
                    <ClinicEventLink
                      clinicId={clinic.id}
                      event="phone_click"
                      href={`tel:${clinic.phone}`}
                      className="locations-button"
                    >
                      <PhoneCall size={17} aria-hidden="true" />
                      {clinic.addressNeedsConfirmation
                        ? '电话核对地址'
                        : '电话咨询'}
                    </ClinicEventLink>
                    <a
                      className="locations-detail-link"
                      href={clinicDetailHref(clinic.id)}
                    >
                      查看本馆详情 <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                  <p className="locations-phone-number">
                    本馆电话：{clinic.phone}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <output className="locations-empty" aria-live="polite">
              <MapPin size={30} strokeWidth={1.5} aria-hidden="true" />
              <h3>没有符合条件的医馆位置</h3>
              <p>可检查名称和地址，或取消地区条件查看其他医馆。</p>
              <button
                className="locations-button locations-button-primary"
                type="button"
                onClick={resetFilters}
              >
                清除筛选，查看全部地区
              </button>
              <a href={clinicsHref}>
                进入公共医馆目录 <ArrowRight size={16} aria-hidden="true" />
              </a>
            </output>
          )}
        </section>
        <footer className="locations-footer">
          地址或联系方式有变化？
          <a href={`${serviceGuideHref}#guide-help`}>查看资料更正方式</a>
        </footer>
      </main>
    </>
  );
}
