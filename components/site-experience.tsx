'use client';

/* eslint-disable next/no-img-element -- Static COS export serves the existing clinic photos without an image optimization server. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  LocateFixed,
  MapPin,
  PhoneCall,
  Search,
  X,
  ZoomIn,
  Building2,
  Orbit,
  BookOpenText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  wellnessIndexHref,
  clinicsHref,
  clinicDetailHref,
  visitGuideHref,
  aboutHref,
  appointmentHref,
} from '@/lib/site-links';
import { HomeWellnessShelf } from '@/components/wellness-reading';
import { ClinicAppointments } from '@/components/clinic-appointments';
import { SiteHeader } from '@/app/site-header';
import { BodyExplorer } from '@/components/body-explorer';
import { transitionUi } from '@/lib/ui-transition';
import { VisitReadingGuide } from '@/components/visit-reading-guide';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import { serviceGuideHref, supportHref, privacyHref } from '@/lib/site-links';
import { clinics, type Clinic, platformPhone } from '@/lib/clinics';
import { PageIntro } from '@/components/page-intro';
import {
  HomePortals,
  BrandOverview,
  BrandServices,
  BrandSubnav,
  BrandValues,
  BrandContact,
  BrandFooterLinks,
  ClinicShowcase,
  HomeVisitPreview,
} from '@/components/brand-sections';

const areas = ['全部', ...Array.from(new Set(clinics.map((c) => c.area)))];
const customerServicePhone = platformPhone;
type Coordinates = { latitude: number; longitude: number };
type SiteView =
  | 'home'
  | 'body'
  | 'clinics'
  | 'clinic'
  | 'visit'
  | 'about'
  | 'appointment'
  | 'values'
  | 'contact';
type HomeOverlay = { kind: 'photo'; clinic: Clinic };
function straightLineDistanceInKm(from: Coordinates, to: Coordinates) {
  const earthRadiusInKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const latitudeStart = toRadians(from.latitude);
  const latitudeEnd = toRadians(to.latitude);
  const distanceFactor =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeStart) *
      Math.cos(latitudeEnd) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    earthRadiusInKm *
    2 *
    Math.atan2(Math.sqrt(distanceFactor), Math.sqrt(1 - distanceFactor))
  );
}

function formatDistance(distanceInKm: number) {
  if (distanceInKm < 1) {
    const metres = Math.max(50, Math.round((distanceInKm * 1000) / 50) * 50);
    return `约 ${metres} 米`;
  }

  return `约 ${distanceInKm.toFixed(distanceInKm < 10 ? 1 : 0)} 公里`;
}

export function SiteExperience({
  view,
  clinicId,
}: {
  view: SiteView;
  clinicId?: string;
}) {
  const selectedClinic = clinics.find((clinic) => clinic.id === clinicId);
  const [filtersReady, setFiltersReady] = useState(false);
  const [area, setArea] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [locationError, setLocationError] = useState('');
  const { overlay, openOverlay, closeOverlay } =
    useOverlayHistory<HomeOverlay>();
  const activeClinicImage = overlay?.kind === 'photo' ? overlay.clinic : null;
  const clinicReturnFocusRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  function setActiveClinicImage(clinic: Clinic | null) {
    if (clinic) {
      clinicReturnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      openOverlay({ kind: 'photo', clinic });
    } else closeOverlay();
  }

  const clinicResults = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return clinics
      .map((clinic) => ({
        ...clinic,
        distanceInKm:
          userLocation && !clinic.addressNeedsConfirmation
            ? straightLineDistanceInKm(userLocation, clinic.coordinates)
            : null,
      }))
      .filter((clinic) => {
        const matchesArea = area === '全部' || clinic.area === area;
        const searchable =
          `${clinic.name} ${clinic.city} ${clinic.area} ${clinic.type} ${clinic.address} ${clinic.shortAddress}`.toLowerCase();
        return matchesArea && (!search || searchable.includes(search));
      })
      .sort((first, second) => {
        if (first.distanceInKm === null)
          return second.distanceInKm === null ? 0 : 1;
        if (second.distanceInKm === null) return -1;
        return first.distanceInKm - second.distanceInKm;
      });
  }, [area, keyword, userLocation]);

  const nearestClinicId =
    userLocation && clinicResults[0]?.distanceInKm !== null
      ? clinicResults[0]?.id
      : null;

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }, []);

  const goToAppointment = useCallback(() => {
    window.location.assign(appointmentHref);
    return false;
  }, []);

  const requestLocation = useCallback(
    (shouldScroll = true) => {
      if (!navigator.geolocation) {
        setLocationStatus('error');
        setLocationError('当前浏览器不支持定位，可以按区域或地址查找诊所。');
        return;
      }

      setLocationStatus('loading');
      setLocationError('');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('idle');
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          if (shouldScroll) window.setTimeout(scrollToResults, 80);
        },
        (error) => {
          setLocationStatus('error');
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError(
              '没有获得定位权限。请在微信或浏览器设置中允许位置访问，也可以按区域查找。',
            );
          } else {
            setLocationError(
              '暂时无法获取位置，请稍后重试，或按区域查找诊所。',
            );
          }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 },
      );
    },
    [scrollToResults],
  );

  useEffect(() => {
    let restoreFrame = 0;
    const query = new URLSearchParams(window.location.search);
    if (view === 'home') {
      const legacy: Record<string, string> = {
        '#clinics': clinicsHref,
        '#appointment-guide': visitGuideHref,
        '#about': aboutHref,
        '#join': aboutHref,
        '#contact': aboutHref,
      };
      if (query.get('action') === 'appointment')
        window.location.replace(appointmentHref);
      else if (legacy[window.location.hash])
        window.location.replace(legacy[window.location.hash]);
      else if (query.get('locate') === '1')
        window.location.replace(clinicsHref + '?locate=1');
    }
    if (view === 'clinics') {
      const saved = window.history.state?.__hymClinicFilters;
      restoreFrame = window.requestAnimationFrame(() => {
        if (saved) {
          if (areas.includes(saved.area)) setArea(saved.area);
          if (typeof saved.keyword === 'string') setKeyword(saved.keyword);
        }
        setFiltersReady(true);
        if (query.get('locate') === '1') requestLocation(false);
      });
    }
    return () => window.cancelAnimationFrame(restoreFrame);
  }, [view, requestLocation]);

  useEffect(() => {
    if (view === 'clinics' && filtersReady) {
      window.history.replaceState(
        { ...window.history.state, __hymClinicFilters: { area, keyword } },
        '',
        window.location.href,
      );
    }
  }, [view, filtersReady, area, keyword]);

  const bodyStage = (
    <div className="ui-model-stage">
      <div className="ui-stage-header">
        <span>
          <Orbit size={16} aria-hidden="true" />
          人体导览
        </span>
        <small>点击部位查看</small>
      </div>
      <BodyExplorer
        appointmentUrl={appointmentHref}
        onAppointment={goToAppointment}
      />
      <div className="ui-stage-footer">
        <span className="ui-stage-live">
          <span />
          查看资料收录状态
        </span>
        <span>左右拖动旋转</span>
      </div>
    </div>
  );

  return (
    <main
      className={`hym-directory hym-compact hym-refined hym-experience hym-mobile-brand hym-pages page-${view}`}
      data-page={view}
      id="top"
    >
      <a
        className="site-skip-link"
        href={view === 'home' ? '#body-guide' : '#page-content'}
      >
        跳到主要内容
      </a>
      <SiteHeader
        active={
          view === 'clinic'
            ? 'clinics'
            : view === 'values' || view === 'contact'
              ? 'about'
              : view
        }
        backHref={
          view === 'home' ? undefined : view === 'clinic' ? clinicsHref : '/'
        }
      />
      {view !== 'home' && (
        <PageIntro view={view} clinicName={selectedClinic?.name} />
      )}
      {(view === 'about' || view === 'values' || view === 'contact') && (
        <BrandSubnav active={view} />
      )}
      {view === 'home' && (
        <>
          <section className="ui-hero" aria-labelledby="finder-title">
            <div className="ui-hero-grid section-wrap">
              <div className="ui-hero-copy">
                <span className="ui-hero-eyebrow">汇医盟 · 广州</span>
                <h1 id="finder-title">
                  <span className="brand-title-line">身边的医馆，</span>
                  <br />
                  <em className="brand-title-line">日常的养护。</em>
                </h1>
                <p className="ui-hero-description">
                  查医馆、看指南，安排一次从容的到访。
                </p>
                <HomePortals />
              </div>
              {bodyStage}
            </div>
            <div className="ui-hero-bottom section-wrap">
              <span>部位对应资料待专业审核。</span>
              <a href={clinicsHref}>
                医馆列表
                <ChevronDown size={14} aria-hidden="true" />
              </a>
            </div>
          </section>
          <BrandOverview />
          <ClinicShowcase clinics={clinics} />
        </>
      )}
      {view === 'body' && (
        <section
          className="body-page-content section-wrap"
          aria-label="人体部位导览"
        >
          {bodyStage}
          <div className="body-page-note">
            <p>轻点部位查看资料收录状态；左右拖动旋转，向上或向下滑动页面。</p>
            <p>部位与科目、服务对应关系待专业审核。</p>
            <a href={clinicsHref}>
              查看广州医馆
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>
      )}
      {view === 'clinics' && (
        <section
          id="clinics"
          ref={resultsRef}
          className="clinic-directory compact-directory section-wrap"
          aria-labelledby="clinic-results-title"
          data-ui-reveal
        >
          <div className="ui-section-meta">
            <span>
              <b className="brand-section-number">01</b> 医馆信息
            </span>
            <span>
              <MapPin size={13} aria-hidden="true" />
              广州 · 天河 / 荔湾
            </span>
          </div>
          <div className="clinic-route-directory">
            <div className="compact-disclosure-content">
              <h2 id="clinic-results-title" className="sr-only">
                查找广州医馆
              </h2>
              <p className="directory-note">出发前，请先确认坐诊与营业时间。</p>
              <search>
                <form
                  className="finder-search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    scrollToResults();
                  }}
                >
                  <Search size={20} aria-hidden="true" />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="搜索诊所、街道或区域"
                    aria-label="搜索诊所"
                    className="finder-search-input"
                  />
                  {keyword ? (
                    <button
                      className="finder-clear"
                      type="button"
                      onClick={() => transitionUi(() => setKeyword(''))}
                      aria-label="清除搜索"
                    >
                      <X size={17} aria-hidden="true" />
                    </button>
                  ) : null}
                  <Button type="submit" className="finder-search-submit">
                    查找
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </form>
              </search>

              <div className="directory-toolbar">
                <fieldset className="district-filters" aria-label="按区域筛选">
                  {areas.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={area === item}
                      onClick={() => transitionUi(() => setArea(item))}
                    >
                      {item}
                      <span aria-hidden="true">
                        {item === '全部'
                          ? clinics.length
                          : clinics.filter((clinic) => clinic.area === item)
                              .length}
                      </span>
                    </button>
                  ))}
                </fieldset>
                <button
                  type="button"
                  className="directory-locate"
                  onClick={() => requestLocation(false)}
                  disabled={locationStatus === 'loading'}
                  aria-label={
                    userLocation
                      ? '重新获取当前位置并按距离排序'
                      : '使用当前位置按距离排序诊所'
                  }
                >
                  <LocateFixed size={17} aria-hidden="true" />
                  {locationStatus === 'loading'
                    ? '正在定位…'
                    : userLocation
                      ? '重新定位'
                      : '按距离找诊所'}
                </button>
              </div>
              {locationError ? (
                <output className="directory-message" aria-live="polite">
                  {locationError}
                </output>
              ) : null}
              {userLocation ? (
                <p className="directory-distance-note">
                  已按直线距离排序，实际路程以地图导航为准。
                </p>
              ) : null}
              {clinicResults.length ? (
                <div className="clinic-grid">
                  {clinicResults.map((clinic) => {
                    const isNearest = clinic.id === nearestClinicId;
                    return (
                      <article
                        key={clinic.id}
                        className={`clinic-entry${isNearest ? ' clinic-entry-nearest' : ''}`}
                        style={{ viewTransitionName: `clinic-${clinic.id}` }}
                      >
                        <div className="clinic-entry-main">
                          <div className="clinic-entry-info">
                            <div className="clinic-meta">
                              <span>{clinic.area}</span>
                              <span>{clinic.type}</span>
                              {isNearest ? (
                                <span className="clinic-nearest">
                                  当前结果中最近
                                </span>
                              ) : null}
                            </div>
                            <h3>
                              <a href={clinicDetailHref(clinic.id)}>
                                {clinic.name}
                              </a>
                            </h3>
                            {clinic.distanceInKm !== null ? (
                              <p className="clinic-distance">
                                <LocateFixed size={14} aria-hidden="true" />
                                {formatDistance(clinic.distanceInKm)}
                              </p>
                            ) : null}
                          </div>
                          {clinic.image ? (
                            <button
                              type="button"
                              className={`clinic-photo${clinic.id === 'linghai-liwan' ? ' clinic-photo-linghai' : ''}`}
                              onClick={() => setActiveClinicImage(clinic)}
                              aria-label={`查看${clinic.name}门店实景大图`}
                            >
                              <img
                                src={clinic.image}
                                alt={
                                  clinic.imageAlt ?? `${clinic.name}门店实景`
                                }
                                width={128}
                                height={112}
                                loading="lazy"
                                decoding="async"
                              />
                              <span>
                                <ZoomIn size={13} aria-hidden="true" />
                                实景
                              </span>
                            </button>
                          ) : (
                            <span
                              className="clinic-photo-placeholder"
                              aria-label="暂无门店实景"
                            >
                              <Building2
                                size={26}
                                strokeWidth={1.25}
                                aria-hidden="true"
                              />
                              <small>医馆信息</small>
                            </span>
                          )}
                        </div>
                        <a
                          href={clinic.navigationUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`在地图中打开${clinic.name}地址`}
                          className="clinic-address"
                        >
                          <MapPin size={17} aria-hidden="true" />
                          <span>
                            {clinic.shortAddress}
                            {clinic.addressNeedsConfirmation ? (
                              <small className="clinic-address-pending">
                                接诊地址请电话确认 ·
                                原资料含两个地址，地图展示中山八路地址
                              </small>
                            ) : null}
                          </span>
                          <ChevronRight size={16} aria-hidden="true" />
                        </a>
                        <a
                          className="clinic-detail-link"
                          href={clinicDetailHref(clinic.id)}
                          aria-label={`查看${clinic.name}详情`}
                        >
                          医馆详情与到店信息
                          <ArrowUpRight size={17} aria-hidden="true" />
                        </a>
                        <div
                          className={`clinic-actions${clinic.appointmentAvailable ? ' clinic-actions-booking' : ''}`}
                        >
                          <a
                            className="clinic-call"
                            href={`tel:${clinic.phone}`}
                            aria-label={`电话咨询${clinic.name}`}
                          >
                            <PhoneCall size={16} aria-hidden="true" />
                            {clinic.phone}
                          </a>
                          {clinic.appointmentAvailable ? (
                            <a
                              className="clinic-book"
                              href={appointmentHref}
                              aria-label={`打开${clinic.name}预约小程序`}
                            >
                              <CalendarDays size={16} aria-hidden="true" />
                              微信预约
                            </a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="directory-empty">
                  <span>
                    <Search size={28} aria-hidden="true" />
                  </span>
                  <h3>没有找到相关诊所</h3>
                  <p>换一个名称、区域或地址关键词试试。</p>
                  <Button
                    type="button"
                    onClick={() => {
                      setArea('全部');
                      setKeyword('');
                    }}
                  >
                    查看全部诊所
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      {view === 'visit' && <VisitReadingGuide />}
      {view === 'home' && <HomeWellnessShelf />}
      {view === 'home' && <HomeVisitPreview />}
      {view === 'about' && (
        <>
          <BrandOverview full />
          <BrandServices />
        </>
      )}
      {view === 'about' && (
        <section className="wx-platform-note section-wrap">
          <h2>资料怎样核实与更新？</h2>
          <p>
            平台整理广州医馆公开联系方式与已有预约入口。机构资料、医生执业与排班、服务范围和价格分别由医馆及相应专业负责人确认；代码整理日期不等于医馆核实日期。当前四条原站目录记录仍待业务复核和展示授权确认。
          </p>
          <p>
            资料有误或需要更新时，请通过平台联系方式提供医馆名称和需更正的公开资料。就诊与预约变更请联系目标医馆；平台不代替医生诊疗，也没有在线人工接待系统。
          </p>
          <nav>
            <a href={serviceGuideHref}>平台使用指南</a>
            <a href={supportHref}>意见反馈与资料更正</a>
            <a href={privacyHref}>隐私与使用说明</a>
          </nav>
        </section>
      )}
      {view === 'values' && <BrandValues />}
      {view === 'contact' && <BrandContact phone={customerServicePhone} />}
      {view === 'clinic' &&
        selectedClinic &&
        (() => {
          const clinic = selectedClinic;
          return (
            <article className="clinic-full-page section-wrap">
              <div className="clinic-details-content">
                {clinic.image ? (
                  <img
                    className={`clinic-detail-image${clinic.id === 'linghai-liwan' ? ' clinic-detail-linghai' : ''}`}
                    src={clinic.image}
                    alt={clinic.imageAlt ?? `${clinic.name}门店实景`}
                    width={640}
                    height={360}
                    loading="lazy"
                  />
                ) : null}
                <dl>
                  <div>
                    <dt>完整地址</dt>
                    <dd>{clinic.address}</dd>
                  </div>
                  <div>
                    <dt>营业与坐诊</dt>
                    <dd>请拨打门店电话，确认当日营业与医生坐诊时间。</dd>
                  </div>
                  {clinic.appointmentAvailable ? (
                    <div>
                      <dt>预约医师</dt>
                      <dd>医生资料及出诊待核实，请在已有预约入口查询。</dd>
                    </div>
                  ) : (
                    <div>
                      <dt>到店安排</dt>
                      <dd>请通过门店电话确认接诊与预约方式。</dd>
                    </div>
                  )}
                </dl>
                {clinic.addressNeedsConfirmation ? (
                  <p className="clinic-detail-caution">
                    原资料含两个地址，请先电话确认实际接诊地点。
                  </p>
                ) : null}
                <a
                  className="clinic-detail-map"
                  href={clinic.navigationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={16} aria-hidden="true" />
                  打开地图导航
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
              <div className="clinic-full-actions">
                <a
                  className="route-button route-button-outline"
                  href={`tel:${clinic.phone}`}
                  aria-label={`电话咨询${clinic.name}`}
                >
                  <PhoneCall size={18} aria-hidden="true" />
                  {clinic.phone}
                </a>
                <a
                  className="route-button"
                  href={
                    clinic.appointmentAvailable
                      ? appointmentHref
                      : clinic.navigationUrl
                  }
                  target={clinic.appointmentAvailable ? undefined : '_blank'}
                  rel={clinic.appointmentAvailable ? undefined : 'noreferrer'}
                >
                  {clinic.appointmentAvailable
                    ? '汇医堂微信预约'
                    : '打开地图导航'}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
              <a className="route-next-link" href={visitGuideHref}>
                出发前，看看需要准备什么
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
          );
        })()}
      {view === 'appointment' && <ClinicAppointments clinics={clinics} />}
      <footer className="directory-footer">
        <div className="section-wrap">
          <BrandFooterLinks />
          <div className="footer-top">
            <span>
              汇医盟 <span>· 广州诊所信息整理</span>
            </span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
            >
              粤ICP备2026132665号
            </a>
          </div>
          <p>
            本页提供诊所信息查询，不能代替医生诊断。门店信息如有变化，请以诊所实际情况为准；遇到急症，请立即拨打
            120 或前往医院急诊。
          </p>
        </div>
      </footer>
      <nav className="directory-mobile-nav" aria-label="页面快捷入口">
        <a href={clinicsHref}>
          <MapPin size={20} aria-hidden="true" />
          找医馆
        </a>
        <a href={appointmentHref}>
          <CalendarDays size={20} aria-hidden="true" />
          预约
        </a>
        <a href={wellnessIndexHref}>
          <BookOpenText size={20} aria-hidden="true" />
          养生指南
        </a>
      </nav>
      <Dialog
        open={activeClinicImage !== null}
        onOpenChange={(open) => {
          if (!open) setActiveClinicImage(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="clinic-photo-dialog"
          data-clinic={activeClinicImage?.id}
          finalFocus={clinicReturnFocusRef}
        >
          <DialogTitle className="sr-only">
            {activeClinicImage
              ? `${activeClinicImage.name}门店实景`
              : '门店实景'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            点击关闭按钮、弹窗外区域、浏览器返回键或按 Esc 键可以退出大图查看。
          </DialogDescription>
          <DialogClose className="clinic-photo-close" aria-label="关闭大图">
            <X size={20} aria-hidden="true" />
          </DialogClose>
          {activeClinicImage?.image ? (
            <>
              <img
                src={activeClinicImage.image}
                alt={
                  activeClinicImage.imageAlt ??
                  `${activeClinicImage.name}门店实景`
                }
                decoding="async"
              />
              <div className="clinic-photo-caption">
                <strong>{activeClinicImage.name}</strong>
                <span>门店实景</span>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
