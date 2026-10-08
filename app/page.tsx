'use client';

/* eslint-disable next/no-img-element -- Static COS export serves the existing clinic photos without an image optimization server. */

import { useEffect, useMemo, useRef, useState } from 'react';
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
  CircleHelp,
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
import { wellnessIndexHref, wellnessArticleHref } from '@/lib/site-links';
import { wellnessArticles } from './wellness/content';
import { SiteHeader } from './site-header';
import { BodyExplorer } from '@/components/body-explorer';

const areas = ['全部', '天河区', '荔湾区'];
const locationConsentStorageKey = 'huiyimeng-location-consent';
const customerServicePhone = '17819751419';
// Use the scheme carried by the official WeChat URL Link so that tapping
// “预约” inside WeChat launches the mini program without the extra landing page.
const huiyitangAppointmentUrl = 'weixin://dl/business/?t=EbKvzZhqcEa';

function canLaunchAppointmentInWeChat() {
  // Desktop WeChat and ordinary browsers may not handle this mobile scheme.
  // Detection is only a hint: the QR stays available even if launching fails.
  const userAgent = navigator.userAgent;
  return (
    /MicroMessenger/i.test(userAgent) &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) &&
    !/WindowsWechat|MacWechat|Windows NT/i.test(userAgent)
  );
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Clinic = {
  id: string;
  name: string;
  city: string;
  area: string;
  type: string;
  image?: string;
  imageAlt?: string;
  shortAddress: string;
  address: string;
  phone: string;
  navigationUrl: string;
  appointmentAvailable: boolean;
  coordinates: Coordinates;
  addressNeedsConfirmation?: boolean;
};

const amapSearchUrl = (keyword: string) =>
  `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent('广州')}&callnative=1`;

const clinics: Clinic[] = [
  {
    id: 'huiyitang-guangzhou',
    name: '汇医堂中医诊所',
    city: '广州',
    area: '天河区',
    type: '中医诊所',
    image: '/huiyitang-clinic.jpg',
    imageAlt: '汇医堂中医诊所门店实景',
    shortAddress: '中山大道中1098号（京东养车隔壁）',
    address:
      '广东省广州市天河区前进街道盈彩美居中兴花园（盈汇路北）1098号2012–2017铺',
    phone: '13178828419',
    navigationUrl: 'https://surl.amap.com/k9HZEoS1r2du',
    appointmentAvailable: true,
    coordinates: { latitude: 23.114446, longitude: 113.418233 },
  },
  {
    id: 'linghai-liwan',
    addressNeedsConfirmation: true,
    name: '岭海医疗诊所',
    city: '广州',
    area: '荔湾区',
    type: '医疗诊所',
    shortAddress: '中山八路75号之一首层',
    address:
      '广州市荔湾区中山八路75号之一首层；广州市荔湾区荷景路27–31号（单）2栋305',
    phone: '13929559688',
    navigationUrl: amapSearchUrl('岭海医疗诊所 广州市荔湾区中山八路75号之一'),
    appointmentAvailable: false,
    coordinates: { latitude: 23.1257, longitude: 113.2384 },
  },
  {
    id: 'peiyuantang-tianhe',
    name: '培元堂中医诊所',
    city: '广州',
    area: '天河区',
    type: '中医诊所',
    shortAddress: '枫叶路8号之一101房自编04房',
    address: '广州市天河区枫叶路8号之一101房自编04房',
    phone: '13922111258',
    navigationUrl: amapSearchUrl(
      '培元堂中医诊所 广州市天河区枫叶路8号之一101房自编04房',
    ),
    appointmentAvailable: false,
    coordinates: { latitude: 23.136248, longitude: 113.367645 },
  },
  {
    id: 'yian-tianhe',
    name: '易安中医诊所',
    city: '广州',
    area: '天河区',
    type: '中医诊所',
    image: '/yian-clinic.jpg',
    imageAlt: '易安中医诊所中药房门店实景',
    shortAddress: '车陂路471号101–108单元自编南区05铺',
    address: '广州市天河区车陂路471号101–108单元自编南区05铺',
    phone: '18924138921',
    navigationUrl: amapSearchUrl(
      '易安中医诊所 广州市天河区车陂路471号101-108单元南区05铺',
    ),
    appointmentAvailable: false,
    coordinates: { latitude: 23.129724, longitude: 113.392411 },
  },
];

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

export default function Home() {
  const [clinicDirectoryOpen, setClinicDirectoryOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [area, setArea] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [locationError, setLocationError] = useState('');
  const [activeClinicImage, setActiveClinicImage] = useState<Clinic | null>(
    null,
  );
  const [appointmentMode, setAppointmentMode] = useState<
    'qr' | 'wechat' | null
  >(null);
  const appointmentLinkRef = useRef<HTMLAnchorElement>(null);
  const appointmentReturnFocusRef = useRef<HTMLElement | null>(null);
  const [appointmentDoctor, setAppointmentDoctor] = useState<string | null>(
    null,
  );
  const resultsRef = useRef<HTMLElement>(null);

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

  function scrollToResults() {
    setClinicDirectoryOpen(true);
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }

  function showAppointment(trigger?: HTMLElement, doctorName?: string) {
    const canLaunch = canLaunchAppointmentInWeChat();
    appointmentReturnFocusRef.current = trigger ?? appointmentLinkRef.current;
    setAppointmentDoctor(doctorName ?? null);
    setAppointmentMode(canLaunch ? 'wechat' : 'qr');
    return canLaunch;
  }

  function requestLocation(shouldScroll = true) {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('当前浏览器不支持定位，可以按区域或地址查找诊所。');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.localStorage.setItem(locationConsentStorageKey, 'granted');
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
          window.localStorage.removeItem(locationConsentStorageKey);
          setLocationError(
            '没有获得定位权限。请在微信或浏览器设置中允许位置访问，也可以按区域查找。',
          );
        } else {
          setLocationError('暂时无法获取位置，请稍后重试，或按区域查找诊所。');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 },
    );
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const wantsNearby = query.get('locate') === '1';
    const wantsAppointment = query.get('action') === 'appointment';
    const hasLocationConsent =
      window.localStorage.getItem(locationConsentStorageKey) === 'granted';

    const appointmentTimer = wantsAppointment
      ? window.setTimeout(() => {
          if (showAppointment()) {
            try {
              window.location.assign(huiyitangAppointmentUrl);
            } catch {
              // Some WebViews reject scheme navigation without a user gesture.
              // Leave the QR and the explicit retry link available.
            }
          }
        }, 0)
      : undefined;
    if (wantsNearby || hasLocationConsent) {
      window.setTimeout(() => requestLocation(false), 0);
    }
    return () => window.clearTimeout(appointmentTimer);
  }, []);

  useEffect(() => {
    function revealDirectory() {
      if (window.location.hash === '#clinics') setClinicDirectoryOpen(true);
      if (['#join', '#contact'].includes(window.location.hash))
        setAboutOpen(true);
    }
    revealDirectory();
    window.addEventListener('hashchange', revealDirectory);
    return () => window.removeEventListener('hashchange', revealDirectory);
  }, []);

  return (
    <main className="hym-directory hym-compact hym-refined" id="top">
      <a className="site-skip-link" href="#body-guide">
        跳到人体导览
      </a>
      <SiteHeader onClinicsClick={() => setClinicDirectoryOpen(true)} />
      <section
        className="compact-intro section-wrap"
        aria-labelledby="finder-title"
      >
        <div className="intro-copy">
          <span className="intro-eyebrow">汇聚医馆信息 · 方便每一次到访</span>
          <h1 id="finder-title">找到医馆，安心安排就诊</h1>
          <p>地址、联系与预约，一处查看。</p>
        </div>
        <div className="intro-actions">
          <a className="intro-secondary" href="#clinics" onClick={() => setClinicDirectoryOpen(true)}>
            <MapPin size={17} aria-hidden="true" />查看医馆
          </a>
          <a className="intro-primary" href={huiyitangAppointmentUrl} aria-haspopup="dialog"
            onClick={(event) => { if (!showAppointment(event.currentTarget, '刘敬东')) event.preventDefault(); }}>
            <CalendarDays size={17} aria-hidden="true" />预约医师
          </a>
        </div>
      </section>
      <div className="guide-caption section-wrap">
        <span><span className="guide-dot" />人体导览</span>
        <small>轻点部位查看入口 · 左右拖动旋转</small>
      </div>
      <BodyExplorer
        appointmentUrl={huiyitangAppointmentUrl}
        onAppointment={(trigger) => showAppointment(trigger, '刘敬东')}
      />
      <p className="guide-disclaimer section-wrap">人体导览用于查看医馆与预约入口，不作诊断或专科匹配。</p>
      <section
        id="clinics"
        ref={resultsRef}
        className="clinic-directory compact-directory section-wrap"
        aria-labelledby="clinic-results-title"
      >
        <details
          className="compact-disclosure clinic-disclosure"
          open={clinicDirectoryOpen}
          onToggle={(event) => setClinicDirectoryOpen(event.currentTarget.open)}
        >
          <summary>
            <span>
              <strong id="clinic-results-title">身边的医馆</strong>
              <small>已收录 {clinics.length} 家 · 广州天河、荔湾</small>
            </span>
            <ChevronDown size={20} aria-hidden="true" />
          </summary>
          <div className="compact-disclosure-content">
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
                    onClick={() => setKeyword('')}
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
                    onClick={() => setArea(item)}
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
                          <h3>{clinic.name}</h3>
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
                            className="clinic-photo"
                            onClick={() => setActiveClinicImage(clinic)}
                            aria-label={`查看${clinic.name}门店实景大图`}
                          >
                            <img
                              src={clinic.image}
                              alt={clinic.imageAlt ?? `${clinic.name}门店实景`}
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
                          <span className="clinic-photo-placeholder" aria-label="暂无门店实景">
                            <Building2 size={26} strokeWidth={1.25} aria-hidden="true" />
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
                      <details className="clinic-details">
                        <summary>医馆详情与到店信息<ChevronDown size={16} aria-hidden="true" /></summary>
                        <div className="clinic-details-content">
                          {clinic.image ? <img className="clinic-detail-image" src={clinic.image} alt={clinic.imageAlt ?? `${clinic.name}门店实景`} width={640} height={360} loading="lazy" /> : null}
                          <dl>
                            <div><dt>完整地址</dt><dd>{clinic.address}</dd></div>
                            <div><dt>营业与坐诊</dt><dd>请拨打门店电话，确认当日营业与医生坐诊时间。</dd></div>
                            {clinic.appointmentAvailable ? <div><dt>预约医师</dt><dd>刘敬东 · 进入汇医堂小程序后选择医师预约。</dd></div> : <div><dt>到店安排</dt><dd>请通过门店电话确认接诊与预约方式。</dd></div>}
                          </dl>
                          {clinic.addressNeedsConfirmation ? <p className="clinic-detail-caution">原资料含两个地址，请先电话确认实际接诊地点。</p> : null}
                          <a className="clinic-detail-map" href={clinic.navigationUrl} target="_blank" rel="noreferrer"><MapPin size={16} aria-hidden="true" />打开地图导航<ArrowUpRight size={15} aria-hidden="true" /></a>
                        </div>
                      </details>
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
                            ref={appointmentLinkRef}
                            className="clinic-book"
                            href={huiyitangAppointmentUrl}
                            onClick={(event) => {
                              if (!showAppointment(event.currentTarget))
                                event.preventDefault();
                            }}
                            aria-label={`打开${clinic.name}预约小程序`}
                            aria-haspopup="dialog"
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
        </details>
      </section>
      <section
        id="appointment-guide"
        className="compact-information section-wrap"
        aria-labelledby="appointment-guide-title"
      >
        <h2 id="appointment-guide-title">就诊前了解</h2>
        <details className="compact-disclosure">
          <summary>
            <span>预约与到店安排</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="compact-disclosure-content">
            <ol className="compact-steps">
              <li>
                <strong>查看信息</strong>：了解医馆名称、地址与联系电话。
              </li>
              <li>
                <strong>确认接诊</strong>
                ：通过医馆的预约入口或电话，确认医生、时间与费用。
              </li>
              <li>
                <strong>收到确认后到店</strong>
                ：以预约系统或医馆确认结果为准，出发前查看地图导航。
              </li>
            </ol>
            <p>
              打开预约页面不代表预约成功。目前汇医堂提供微信预约入口；其他医馆请先拨打门店电话确认。
            </p>
          </div>
        </details>
        <details className="compact-disclosure">
          <summary>
            <span>出发前，问清这四件事</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <ul className="compact-disclosure-content compact-checklist">
            <li>是否接诊所需科目</li>
            <li>到店时段是否有医生</li>
            <li>是否需要预约或携带资料</li>
            <li>收费项目及结算方式</li>
          </ul>
        </details>
        <details className="compact-disclosure">
          <summary>
            <span>常见问题与定位说明</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="compact-disclosure-content compact-questions">
            <h3>距离是怎样计算的？</h3>
            <p>
              获得定位权限后，页面会按直线距离估算并排序；实际驾车或步行路程以地图导航为准。也可以直接按区域或地址查找。
            </p>
            <h3>汇医盟与汇医堂是什么关系？</h3>
            <p>
              汇医盟提供诊所信息查询，汇医堂是已收录的机构之一。诊疗由相应医疗机构开展。资料有变动时，请联系平台核对。
            </p>
          </div>
        </details>
      </section>
      <section className="wellness-preview section-wrap" aria-labelledby="wellness-preview-title">
        <div className="section-heading">
          <div><span className="section-eyebrow">把日常照顾好</span><h2 id="wellness-preview-title">日常养护</h2></div>
          <a href={wellnessIndexHref}>全部阅读<ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="wellness-preview-grid">
          {wellnessArticles.map((article) => {
            const Icon = article.icon;
            return <a key={article.slug} href={wellnessArticleHref(article.slug)} className="wellness-preview-link">
              <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
              <span><strong>{article.shortTitle}</strong><small>{article.eyebrow}</small></span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>;
          })}
        </div>
        <p className="wellness-preview-note">日常常识阅读，不能代替个体化诊疗建议。</p>
      </section>
      <section
        id="about"
        className="compact-about section-wrap"
        aria-label="关于汇医盟"
      >
        <details
          className="compact-disclosure"
          open={aboutOpen}
          onToggle={(event) => setAboutOpen(event.currentTarget.open)}
        >
          <summary>
            <span>关于汇医盟与机构收录</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="compact-disclosure-content">
            <p>
              汇医盟整理广州诊所的地址、电话和导航，方便了解身边的就诊信息。
            </p>
            <div id="join">
              <p>
                欢迎广州诊所了解信息收录、资料维护和预约入口展示。机构信息、服务信息与到店入口，以核实资料和实际接入为准。
              </p>
              <a
                id="contact"
                className="compact-contact"
                href={`tel:${customerServicePhone}`}
              >
                咨询机构收录：{customerServicePhone}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </details>
      </section>
      <footer className="directory-footer">
        <div className="section-wrap">
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
        <a href="#clinics" onClick={() => setClinicDirectoryOpen(true)}>
          <MapPin size={20} aria-hidden="true" />找医馆
        </a>
        <a href={huiyitangAppointmentUrl} aria-haspopup="dialog" onClick={(event) => {
          if (!showAppointment(event.currentTarget, '刘敬东')) event.preventDefault();
        }}><CalendarDays size={20} aria-hidden="true" />预约</a>
        <a href="#appointment-guide"><CircleHelp size={20} aria-hidden="true" />就诊帮助</a>
      </nav>
      <Dialog
        open={appointmentMode !== null}
        onOpenChange={(open) => {
          if (!open) setAppointmentMode(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="appointment-dialog"
          finalFocus={appointmentReturnFocusRef}
        >
          <DialogClose className="appointment-close" aria-label="关闭微信预约">
            <X size={20} aria-hidden="true" />
          </DialogClose>
          <DialogTitle className="appointment-title">
            汇医堂微信预约
          </DialogTitle>
          <DialogDescription className="appointment-description">
            {appointmentDoctor && (
              <span className="block">
                进入小程序后，选择{appointmentDoctor}预约。
              </span>
            )}
            {appointmentMode === 'wechat'
              ? '若未能打开小程序，可长按下方小程序码，选择「识别图中小程序码」。'
              : '请用手机微信扫描下方小程序码，进入预约页面。'}
          </DialogDescription>
          <img
            className="appointment-qr"
            src="/appointment-mini-program.jpg"
            alt="汇医堂预约小程序码，请使用微信扫描或识别"
            width={528}
            height={489}
          />
          <p className="appointment-help">
            同一部手机操作：长按保存图片，或截取包含完整小程序码的屏幕；打开微信「扫一扫」，从相册选择图片识别。
          </p>
          {appointmentMode === 'wechat' ? (
            <a className="appointment-retry" href={huiyitangAppointmentUrl}>
              再次打开预约小程序
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={activeClinicImage !== null}
        onOpenChange={(open) => {
          if (!open) setActiveClinicImage(null);
        }}
      >
        <DialogContent showCloseButton={false} className="clinic-photo-dialog">
          <DialogTitle className="sr-only">
            {activeClinicImage
              ? `${activeClinicImage.name}门店实景`
              : '门店实景'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            点击关闭按钮、弹窗外区域或按 Esc 键可以退出大图查看。
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
