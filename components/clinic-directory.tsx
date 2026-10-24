'use client';
/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Original assets and COS static links. */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  PhoneCall,
  Navigation,
  Search,
  X,
  LocateFixed,
  CalendarDays,
} from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import {
  clinics,
  confirmedPartnerClinics,
  verifiedServices,
} from '@/lib/clinics';
import {
  bodyRegions,
  verifiedBodyServices,
  type BodyRegionId,
} from '@/lib/body-regions';
import {
  appointmentHref,
  aboutHref,
  doctorsHref,
  bodyGuideHref,
  contactHref,
  clinicDetailHref,
  clinicsHref,
  cooperationHref,
  wellnessIndexHref,
  visitGuideHref,
} from '@/lib/site-links';
import { BodyExplorer } from './body-explorer';
import { HomeWellnessShelf } from './wellness-reading';
import { recordClinicEvent } from '@/lib/analytics';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
const areas = Array.from(new Set(clinics.map((c) => c.area)));
const services = Array.from(
  new Map(clinics.flatMap(verifiedServices).map((s) => [s.id, s])).values(),
);
type Position = { latitude: number; longitude: number };
function distance(a: Position, b: Position) {
  const rad = Math.PI / 180;
  const d =
    Math.sin(((b.latitude - a.latitude) * rad) / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(((b.longitude - a.longitude) * rad) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1 - d));
}
export function ClinicDirectory({ home = false }: { home?: boolean }) {
  const [keyword, setKeyword] = useState(''),
    [area, setArea] = useState(''),
    [service, setService] = useState('');
  const [body, setBody] = useState<BodyRegionId | null>(null),
    [position, setPosition] = useState<Position | null>(null);
  const [locationMessage, setLocationMessage] = useState(''),
    [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState<(typeof clinics)[number] | null>(null),
    [ready, setReady] = useState(false);
  const section = useRef<HTMLElement>(null);
  const region = bodyRegions.find((r) => r.id === body);
  function locate() {
    if (!navigator.geolocation) {
      setLocationMessage('当前浏览器不支持定位，请按地区或地址查询。');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        });
        setLocating(false);
        setLocationMessage(
          '按估算直线距离排序，实际路线以地图为准。位置仅在当前页面计算。',
        );
      },
      () => {
        setLocating(false);
        setLocationMessage('未能获得位置，仍可按地区、名称或地址查询。');
      },
      { timeout: 12000, maximumAge: 120000 },
    );
  }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (home && params.get('action') === 'appointment') {
      window.location.replace(appointmentHref);
      return;
    }
    const legacy: Record<string, string> = {
      '#about': aboutHref,
      '#join': cooperationHref,
      '#contact': contactHref,
      '#appointment-guide': visitGuideHref,
    };
    if (home && legacy[window.location.hash]) {
      window.location.replace(legacy[window.location.hash]);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const saved = params.size ? null : window.history.state?.clinicFilters;
      setKeyword(params.get('q') ?? saved?.keyword ?? '');
      const requestedArea = params.get('area') ?? saved?.area ?? '';
      setArea(areas.includes(requestedArea) ? requestedArea : '');
      setService(params.get('service') ?? saved?.service ?? '');
      setBody(
        bodyRegions.find((r) => r.id === (params.get('body') ?? saved?.body))
          ?.id ?? null,
      );
      setReady(true);
      if (params.get('locate') === '1') locate();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [home]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({
      q: keyword,
      area,
      service,
      body: body ?? '',
    })) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(
      {
        ...window.history.state,
        clinicFilters: { keyword, area, service, body },
      },
      '',
      url,
    );
  }, [keyword, area, service, body, ready]);
  const results = useMemo(
    () =>
      clinics
        .filter((c) => {
          const text =
            `${c.name} ${c.area} ${c.address} ${c.type} ${verifiedServices(c)
              .map((s) => s.name)
              .join(' ')}`.toLowerCase();
          return (
            (!area || c.area === area) &&
            (!keyword.trim() || text.includes(keyword.trim().toLowerCase())) &&
            (!service || verifiedServices(c).some((s) => s.id === service)) &&
            (!body ||
              (verifiedBodyServices[body] ?? []).some(
                (s) => s.clinicId === c.id,
              ))
          );
        })
        .map((c) => ({
          ...c,
          distance:
            position && !c.addressNeedsConfirmation
              ? distance(position, c.coordinates)
              : null,
        }))
        .sort((a, b) =>
          position ? (a.distance ?? Infinity) - (b.distance ?? Infinity) : 0,
        ),
    [keyword, area, service, body, position],
  );
  function clear() {
    setKeyword('');
    setArea('');
    setService('');
    setBody(null);
  }
  function scrollToResults() {
    section.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  return (
    <main className="hym-directory rev-directory" id="top">
      <a className="site-skip-link" href="#clinics">
        跳到医馆查询
      </a>
      <SiteHeader
        active={home ? 'home' : 'clinics'}
        backHref={home ? undefined : '/'}
      />
      {home ? (
        <section className="rev-hero">
          <div className="section-wrap rev-hero-grid">
            <div className="rev-intro">
              <p className="rev-eyebrow">汇医盟 · 广州医馆信息平台</p>
              <h1>
                查医馆、找地址，
                <br />
                <em>了解预约方式。</em>
              </h1>
              <p className="rev-lead">
                先了解地址与联系入口，
                <br />
                再向医馆确认出诊与到访安排。
              </p>
              <div className="rev-actions">
                <a className="rev-button" href="#clinics">
                  查找医馆 <ArrowRight size={18} />
                </a>
                <a className="rev-button rev-outline" href={cooperationHref}>
                  医馆合作 <ArrowUpRight size={18} />
                </a>
              </div>
              <p className="rev-small">无需注册登录 · 直接按文字和地区查找</p>
              <dl className="rev-stats">
                <div>
                  <dt>原站目录</dt>
                  <dd>
                    {clinics.length}
                    <small>家医馆</small>
                  </dd>
                </div>
                <div>
                  <dt>覆盖地区</dt>
                  <dd>
                    {areas.length}
                    <small>个广州地区</small>
                  </dd>
                </div>
              </dl>
              <p className="rev-small">
                {areas.join(' · ')}。已确认展示授权的合作医馆{' '}
                {confirmedPartnerClinics.length} 家，原站目录资料正逐家复核。
              </p>
            </div>
            <div className="rev-body-panel">
              <div className="rev-panel-heading">
                <span>人体导览</span>
                <small>点选部位 · 文字入口同样可用</small>
              </div>
              <BodyExplorer
                appointmentUrl={appointmentHref}
                onAppointment={() => false}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="section-wrap rev-page-title">
          <p className="rev-eyebrow">广州医馆目录</p>
          <h1>找到医馆，先把信息看清。</h1>
          <p>按名称、地址或地区查询，无需登录。</p>
        </div>
      )}
      <section
        ref={section}
        id="clinics"
        className="section-wrap rev-results"
        aria-labelledby="results-title"
      >
        <div className="rev-heading">
          <div>
            <p className="rev-eyebrow">CLINIC DIRECTORY / 医馆查询</p>
            <h2 id="results-title">
              查找广州医馆{' '}
              <small aria-live="polite">{results.length} 家结果</small>
            </h2>
          </div>
          <a href={visitGuideHref}>
            到访前要确认什么 <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="rev-filters">
          <search>
            <form
              className="rev-search"
              onSubmit={(event) => {
                event.preventDefault();
                scrollToResults();
              }}
            >
              <Search size={21} />
              <label className="sr-only" htmlFor="clinic-keyword">
                搜索医馆名称或地址
              </label>
              <input
                id="clinic-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入医馆名称、街道或地址"
              />
              {keyword && (
                <button
                  type="button"
                  aria-label="清除搜索"
                  onClick={() => setKeyword('')}
                >
                  <X size={18} />
                </button>
              )}
              <button className="rev-search-submit" type="submit">
                查找
              </button>
            </form>
          </search>
          <div className="rev-filter-row">
            <fieldset className="rev-districts">
              <legend className="sr-only">按地区筛选</legend>
              {['', ...areas].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={area === item}
                  onClick={() => setArea(item)}
                >
                  {item || '全部地区'}
                  <span>
                    {item
                      ? clinics.filter((c) => c.area === item).length
                      : clinics.length}
                  </span>
                </button>
              ))}
            </fieldset>
            <button
              className="rev-locate"
              type="button"
              disabled={locating}
              onClick={locate}
            >
              <LocateFixed size={16} />
              {locating ? '正在定位…' : '按距离排序'}
            </button>
            {position && (
              <button
                className="rev-text-button"
                onClick={() => {
                  setPosition(null);
                  setLocationMessage('已恢复目录顺序。');
                }}
              >
                恢复目录顺序
              </button>
            )}
          </div>
          <div className="rev-service-filter">
            <strong>服务科目</strong>
            {services.length ? (
              <label>
                <span className="sr-only">按已核实服务科目筛选</span>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">全部已核实科目</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <span>
                暂无已核实科目资料，暂不提供筛选。医生出诊时间待医馆确认。
              </span>
            )}
          </div>
        </div>
        {region && (
          <output className="rev-query-notice">
            <strong>{region.label} · 信息查询</strong>
            <p>
              尚未收录经专业审核的部位与科目、服务对应资料，目前没有相关结果。
            </p>
            <button onClick={() => setBody(null)} type="button">
              取消部位条件，重新筛选
            </button>
          </output>
        )}
        <p className="rev-directory-note">
          原站目录资料待医馆复核，展示授权待确认。默认按目录收录顺序，不代表医疗水平排名。
          {position ? '目前已按估算直线距离排序。' : ''}
        </p>
        {locationMessage && (
          <output className="rev-query-notice">{locationMessage}</output>
        )}
        {results.length ? (
          <div className="rev-clinic-grid">
            {results.map((c) => (
              <article className="rev-clinic-card" key={c.id}>
                <div className="rev-card-top">
                  <div>
                    <p className="rev-card-meta">
                      {c.area} · {c.type}
                    </p>
                    <h3>
                      <a href={clinicDetailHref(c.id)}>{c.name}</a>
                    </h3>
                    <p className="rev-small">原站资料 · 待医馆复核</p>
                    {c.distance !== null && (
                      <p className="rev-distance">
                        距当前位置约 {c.distance.toFixed(1)} 公里 · 直线距离
                      </p>
                    )}
                  </div>
                  {c.image ? (
                    <button
                      type="button"
                      className="rev-photo"
                      onClick={() => setPhoto(c)}
                      aria-label={`查看${c.name}门店实景大图`}
                    >
                      <img
                        src={c.image}
                        alt={c.imageAlt ?? `${c.name}门店实景`}
                        width={128}
                        height={100}
                        loading="lazy"
                      />
                      <span>实景</span>
                    </button>
                  ) : (
                    <div className="rev-photo-pending">
                      门店实景
                      <br />
                      待补充
                    </div>
                  )}
                </div>
                <p className="rev-address">
                  <MapPin size={17} />
                  <span>
                    {c.address}
                    {c.addressNeedsConfirmation && (
                      <small>原资料有两个地址，实际接诊地点请电话确认。</small>
                    )}
                  </span>
                </p>
                <dl className="rev-card-info">
                  <div>
                    <dt>营业时间</dt>
                    <dd>{c.hours ?? '待医馆确认'}</dd>
                  </div>
                  <div>
                    <dt>医生出诊</dt>
                    <dd>未收录已确认排班，请电话查询</dd>
                  </div>
                </dl>
                {verifiedServices(c)
                  .slice(0, 3)
                  .map((s) => (
                    <span className="rev-service-tag" key={s.id}>
                      {s.name}
                    </span>
                  ))}
                <a className="rev-detail-link" href={clinicDetailHref(c.id)}>
                  查看详情与信息状态 <ArrowUpRight size={17} />
                </a>
                <div className="rev-card-actions">
                  <a
                    className="rev-call"
                    href={`tel:${c.phone}`}
                    aria-label={`电话咨询${c.name} ${c.phone}`}
                    onClick={() =>
                      recordClinicEvent('phone_click', c.id, 'unknown')
                    }
                  >
                    <PhoneCall size={16} />
                    电话咨询
                  </a>
                  {c.navigationUrl && !c.addressNeedsConfirmation && (
                    <a
                      href={c.navigationUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        recordClinicEvent('navigation_click', c.id, 'unknown')
                      }
                    >
                      <Navigation size={16} />
                      导航到店
                    </a>
                  )}
                  {c.appointmentAvailable && (
                    <a
                      href={`${appointmentHref}?clinic=${c.id}`}
                      onClick={() =>
                        recordClinicEvent('appointment_click', c.id, 'unknown')
                      }
                    >
                      <CalendarDays size={16} />
                      预约入口
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rev-empty">
            <Search size={30} />
            <h3>暂无符合条件的医馆资料</h3>
            <p>
              {body
                ? '该部位的科目与服务关系待专业审核，尚无可查询资料。'
                : '请换一个名称或地址关键词，或选择其他地区。'}
            </p>
            <button className="rev-button" onClick={clear}>
              重新筛选 · 查看全部地区
            </button>
          </div>
        )}
      </section>
      {home && (
        <>
          <section className="section-wrap rev-cooperation">
            <div>
              <p className="rev-eyebrow">面向独立医馆</p>
              <h2>每家医馆，都有自己的入口。</h2>
              <p>标准资料页、目录展示与联系入口，按约定维护信息。</p>
            </div>
            <div>
              <p className="rev-price">
                99<small>元/月</small>
                <span>或 1000 元/年</span>
              </p>
              <a className="rev-button rev-outline" href={cooperationHref}>
                了解医馆合作 <ArrowUpRight size={18} />
              </a>
            </div>
          </section>
          <HomeWellnessShelf />
        </>
      )}
      <footer className="rev-footer">
        <div className="section-wrap">
          <nav aria-label="其他栏目">
            <a href={doctorsHref}>医生资料状态</a>
            <a href={wellnessIndexHref}>养生阅读</a>
            <a href={visitGuideHref}>到访指南</a>
            <a href={cooperationHref}>医馆合作</a>
            <a href={aboutHref}>关于汇医盟</a>
          </nav>
          <p>
            基础信息、出诊与服务内容需经业务方及医馆专业核查，未核实的内容已在资料中标明。
          </p>
          <p>
            访问、电话点击、导航和预约入口点击：暂未统计。点击不等于真实咨询、确认预约或到店。
          </p>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
            粤ICP备2026132665号
          </a>
        </div>
      </footer>
      <nav className="rev-bottom-nav" aria-label="手机快捷入口">
        <a href={home ? '#clinics' : clinicsHref}>
          <Search size={20} />
          查找医馆
        </a>
        <a href={bodyGuideHref}>
          <MapPin size={20} />
          人体导览
        </a>
        <a href={cooperationHref}>
          <ArrowUpRight size={20} />
          医馆合作
        </a>
      </nav>
      <Dialog
        open={photo !== null}
        onOpenChange={(open) => {
          if (!open) setPhoto(null);
        }}
      >
        <DialogContent className="clinic-photo-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">{photo?.name}门店实景</DialogTitle>
          <DialogDescription className="sr-only">
            可按关闭按钮或 Escape 返回医馆查询。
          </DialogDescription>
          <DialogClose className="clinic-photo-close" aria-label="关闭大图">
            <X size={22} />
          </DialogClose>
          {photo?.image && (
            <img src={photo.image} alt={photo.imageAlt ?? photo.name} />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
