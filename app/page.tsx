'use client';

/* eslint-disable next/no-img-element -- Static COS export serves the existing clinic photos without an image optimization server. */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  MessageCircle,
  LocateFixed,
  MapPin,
  Navigation,
  PhoneCall,
  Search,
  X,
  ZoomIn,
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
import { wellnessIndexHref } from '@/lib/site-links';
import { SiteHeader } from './site-header';

const areas = ['全部', '天河区', '荔湾区'];
const locationConsentStorageKey = 'huiyimeng-location-consent';
const customerServicePhone = '17819751419';
// Use the scheme carried by the official WeChat URL Link so that tapping
// “预约” inside WeChat launches the mini program without the extra landing page.
const huiyitangAppointmentUrl = 'weixin://dl/business/?t=EbKvzZhqcEa';

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
  const resultsRef = useRef<HTMLElement>(null);

  const clinicResults = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return clinics
      .map((clinic) => ({
        ...clinic,
        distanceInKm: userLocation
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
        if (first.distanceInKm === null || second.distanceInKm === null)
          return 0;
        return first.distanceInKm - second.distanceInKm;
      });
  }, [area, keyword, userLocation]);

  const nearestClinicId =
    userLocation && clinicResults.length ? clinicResults[0].id : null;

  function scrollToResults() {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    if (wantsAppointment) window.location.assign(huiyitangAppointmentUrl);
    if (wantsNearby || hasLocationConsent) {
      window.setTimeout(() => requestLocation(false), 0);
    }
  }, []);

  return (
    <main className="hym-directory" id="top">
      <a className="site-skip-link" href="#clinics">
        跳到诊所列表
      </a>
      <SiteHeader />
      <section className="finder-hero" aria-labelledby="finder-title">
        <div className="finder-hero-inner">
          <div className="finder-intro">
            <p className="finder-eyebrow">
              <span />
              广州 · 诊所信息服务
            </p>
            <h1 id="finder-title">
              找诊所这件事，
              <br />
              <em>简单一点。</em>
            </h1>
            <p className="finder-intro-text">
              地址、电话、导航，一处看清。
              <br className="mobile-break" />
              先了解，再从容安排到店。
            </p>
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
            <p className="finder-search-hint">
              按名称或地址搜索，也可以在下方选择地区
            </p>
          </div>
          <div className="finder-illustration" aria-hidden="true">
            <span>
              一城烟火，一份从容<span>品牌插画</span>
            </span>
          </div>
        </div>
      </section>
      <section
        id="clinics"
        ref={resultsRef}
        className="clinic-directory section-wrap"
        aria-labelledby="clinic-results-title"
      >
        <div className="directory-heading">
          <div>
            <p className="section-eyebrow">CLINIC DIRECTORY / 诊所一览</p>
            <h2 id="clinic-results-title">
              在广州，找到你的下一站
              <span aria-live="polite">{clinicResults.length} 家诊所</span>
            </h2>
          </div>
          <p className="directory-note">
            出发前，建议先电话确认坐诊与营业时间。
          </p>
        </div>
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
                    : clinics.filter((clinic) => clinic.area === item).length}
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
                          <span className="clinic-nearest">离您最近</span>
                        ) : null}
                      </div>
                      <h3>{clinic.name}</h3>
                      <p className="clinic-phone">
                        <PhoneCall size={14} aria-hidden="true" />
                        <a
                          href={`tel:${clinic.phone}`}
                          aria-label={`拨打${clinic.name}电话 ${clinic.phone}`}
                        >
                          {clinic.phone}
                        </a>
                      </p>
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
                    ) : null}
                  </div>
                  <a
                    href={clinic.navigationUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`在地图中打开${clinic.name}地址`}
                    className="clinic-address"
                  >
                    <MapPin size={17} aria-hidden="true" />
                    <span>{clinic.shortAddress}</span>
                    <ChevronRight size={16} aria-hidden="true" />
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
                      电话咨询
                    </a>
                    <a
                      href={clinic.navigationUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`导航到${clinic.name}`}
                    >
                      <Navigation size={16} aria-hidden="true" />
                      导航到店
                    </a>
                    {clinic.appointmentAvailable ? (
                      <a
                        className="clinic-book"
                        href={huiyitangAppointmentUrl}
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
      </section>
      <section id="about" className="directory-about section-wrap">
        <div className="about-story">
          <p className="section-eyebrow">ABOUT HUIYIMENG / 关于汇医盟</p>
          <h2>
            少一点来回查找，
            <br />
            多一份到店前的了解。
          </h2>
          <p>
            离我多远、怎么去、能不能联系上。
            <br />
            我们把诊所地址、电话和导航整理在一起，
            <br className="desktop-break" />
            让每一次查找更简单。
          </p>
          <a href={wellnessIndexHref}>
            日常养护，也可以从阅读开始
            <BookOpenText size={17} aria-hidden="true" />
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div id="join" className="about-contact">
          <span className="contact-symbol">
            <MessageCircle size={24} aria-hidden="true" />
          </span>
          <p className="section-eyebrow">一起让信息更准确</p>
          <h3>诊所资料有变动？</h3>
          <p>
            新增诊所，或修改地址、电话和营业时间，
            <br className="desktop-break" />
            都可以联系平台。我们核对后更新。
          </p>
          <a id="contact" href={`tel:${customerServicePhone}`}>
            <span>
              <small>联系汇医盟平台</small>
              <strong>{customerServicePhone}</strong>
            </span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        className="directory-faq section-wrap"
        aria-labelledby="faq-title"
      >
        <div>
          <p className="section-eyebrow">BEFORE YOU GO / 到店之前</p>
          <h2 id="faq-title">你可能还想了解</h2>
          <p>关于查找诊所的几个常见问题。</p>
        </div>
        <div className="faq-items">
          <details>
            <summary>
              距离是怎样计算的？
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>
              获得定位权限后，页面会按直线距离估算并排序；实际驾车或步行路程以地图导航为准。
            </p>
          </details>
          <details>
            <summary>
              为什么部分诊所不能微信预约？
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>
              目前仅展示已经提供预约入口的诊所；其他诊所可先拨打门店电话了解安排。
            </p>
          </details>
          <details>
            <summary>
              发现信息不准确怎么办？
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>
              请联系汇医盟客服并说明诊所名称与需要更新的内容，我们会尽快核对。
            </p>
          </details>
        </div>
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
        <a href="#clinics" aria-current="page">
          <MapPin size={20} aria-hidden="true" />
          找诊所
        </a>
        <a href={wellnessIndexHref}>
          <BookOpenText size={20} aria-hidden="true" />
          养生指南
        </a>
        <a href="#about">
          <Building2 size={20} aria-hidden="true" />
          关于我们
        </a>
      </nav>
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
