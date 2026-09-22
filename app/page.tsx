'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
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
import { BrandMark } from './brand-mark';

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
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [locationError, setLocationError] = useState('');
  const [activeClinicImage, setActiveClinicImage] = useState<Clinic | null>(null);
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
          setLocationError('没有获得定位权限。请在微信或浏览器设置中允许位置访问，也可以按区域查找。');
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
    <main className="min-h-screen bg-[#f2eee5] pb-16 text-[#173d35] md:pb-0">
      <header className="border-b border-white/10 bg-[#123d34] text-[#fbf4e3]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="返回页面顶部"
          >
            <BrandMark />
            <span>
              <span className="block text-base font-bold tracking-[0.12em] text-white">
                汇医盟
              </span>
              <span className="block text-xs tracking-[0.08em] text-[#c6d7d0]">
                诊所与日常养护
              </span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href={wellnessIndexHref}
              className="hidden h-9 items-center gap-2 px-2 text-sm font-medium text-[#e5eee9] transition-colors hover:text-[#ead59c] sm:inline-flex"
            >
              <BookOpenText className="size-4" aria-hidden="true" />
              养生指南
            </a>
            <a
              href={`tel:${customerServicePhone}`}
              className="inline-flex h-9 items-center gap-2 border-l border-white/15 pl-3 text-sm font-medium text-[#f4e8c8]"
            >
              <PhoneCall className="size-4" aria-hidden="true" />
              电话咨询
            </a>
          </div>
        </div>
      </header>

      <section id="top" className="hero-atelier relative overflow-hidden text-[#f8f1df]">
        <div className="hero-paper-texture absolute inset-0" aria-hidden="true" />
        <div className="hero-ink-orbit absolute -right-24 -top-44 size-[33rem] rounded-full" aria-hidden="true" />
        <div className="hero-watermark absolute -bottom-16 left-[42%] hidden select-none lg:block" aria-hidden="true">汇</div>
        <div className="relative mx-auto max-w-6xl px-5 pb-7 pt-7 sm:px-8 sm:pb-11 sm:pt-10">
          <div className="max-w-4xl md:py-2">
            <div>
              <div className="flex items-center gap-3">
                <span className="hero-kicker-seal" aria-hidden="true">寻</span>
                <p className="text-sm font-semibold tracking-[0.2em] text-[#ead59c]">诊所查询</p>
                <span className="h-px w-12 bg-gradient-to-r from-[#d9b968] to-transparent" aria-hidden="true" />
              </div>
              <h1 className="mt-4 max-w-xl text-[2.2rem] font-bold leading-[1.18] tracking-[-0.04em] text-white sm:text-[2.8rem] lg:text-[3.45rem]">
                找到离你近的诊所
                <span className="hero-title-emphasis mt-1 block w-fit text-[#f0d894]">少走一点弯路。</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-[#d3e0da] sm:text-lg sm:leading-8">
                地址、距离、电话和导航，都替你整理好了。需要时安心去看医生，平日也把自己照顾好。
              </p>
            </div>

            <div className="hero-search-paper mt-6 max-w-3xl rounded-[1.5rem] p-2 text-[#173d35] sm:p-3">
              <div className="flex items-center gap-2 rounded-xl bg-white px-2 py-1 shadow-[0_8px_28px_rgba(22,55,47,0.08)]">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71837c]"
                    aria-hidden="true"
                  />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') scrollToResults();
                    }}
                    placeholder="诊所名、街道或区域"
                    aria-label="搜索诊所"
                    className="h-12 border-0 bg-transparent pl-10 text-base text-[#173d35] shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="button"
                  className="h-11 shrink-0 rounded-lg bg-[#a87a32] px-5 text-base font-semibold text-white hover:bg-[#8d6528]"
                  onClick={scrollToResults}
                >
                  搜一下
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section
        id="clinics"
        ref={resultsRef}
        className="mx-auto max-w-6xl scroll-mt-4 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-11"
        aria-labelledby="clinic-results-title"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#9a6d2b]">诊所一览</p>
            <h2
              id="clinic-results-title"
              className="mt-1.5 text-3xl font-bold tracking-[-0.03em] text-[#173d35]"
            >
              广州 · {clinicResults.length} 家诊所
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#65766f]">
              {userLocation
                ? '距离为当前位置到门店的直线估算，实际路程以地图导航为准。'
                : '点开导航前，建议先打电话确认坐诊和营业时间。'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => requestLocation(false)}
            disabled={locationStatus === 'loading'}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#176b53]/25 bg-[#fffdf8] px-4 text-sm font-semibold text-[#176b53] shadow-[0_4px_16px_rgba(39,55,49,0.06)] transition-colors hover:border-[#176b53]/55 hover:bg-[#edf5f1] disabled:cursor-wait disabled:opacity-65 sm:self-auto"
            aria-label={userLocation ? '重新获取当前位置并按距离排序' : '使用当前位置按距离排序诊所'}
          >
            <LocateFixed className="size-4" aria-hidden="true" />
            {locationStatus === 'loading' ? '正在定位…' : userLocation ? '重新定位' : '按距离找诊所'}
          </button>
        </div>
        {locationError ? (
          <output className="mt-3 block rounded-xl border border-[#d7bd8e]/50 bg-[#fff8e9] px-4 py-2.5 text-sm leading-6 text-[#755b32]">
            {locationError}
          </output>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2" aria-label="按区域筛选">
          {areas.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setArea(item)}
              className={
                area === item
                  ? 'rounded-full bg-[#173d35] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(23,61,53,0.15)]'
                  : 'rounded-full border border-[#173d35]/12 bg-[#faf7ef] px-4 py-2 text-sm font-medium text-[#5f756d] hover:border-[#176b53]/30 hover:bg-white'
              }
            >
              {item}
            </button>
          ))}
        </div>
        {clinicResults.length ? (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {clinicResults.map((clinic, index) => {
              const isNearest = clinic.id === nearestClinicId;
              return (
                <article
                  key={clinic.id}
                  className={`group relative overflow-hidden rounded-[1.5rem] border bg-[#fffdf8] transition-transform duration-300 hover:-translate-y-0.5 ${isNearest ? 'border-[#b98a3d]/65 shadow-[0_16px_35px_rgba(62,49,24,0.10)]' : 'border-[#173d35]/10 shadow-[0_12px_30px_rgba(39,55,49,0.06)]'}`}
                >
                  <img
                    src="/clinic-card-ink-wash.png"
                    alt=""
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16] mix-blend-multiply ${index % 2 ? '-scale-x-100' : ''}`}
                  />
                  <div className="relative p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6d7b75]">
                          <span className="rounded-full bg-[#e5efe9] px-2.5 py-1 text-[#176b53]">{clinic.city} · {clinic.area}</span>
                          <span>{clinic.type}</span>
                          {isNearest ? (
                            <span className="rounded-full bg-[#f1dfaa] px-2.5 py-1 font-bold text-[#7b581f]">
                              离您最近
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-3 text-[1.35rem] font-bold tracking-[-0.025em] text-[#173d35]">
                          {clinic.name}
                        </h3>
                        {clinic.distanceInKm !== null ? (
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#1b785d]">
                            <LocateFixed className="size-4" aria-hidden="true" />
                            {formatDistance(clinic.distanceInKm)}
                          </p>
                        ) : null}
                      </div>
                      {clinic.image ? (
                        <button
                          type="button"
                          onClick={() => setActiveClinicImage(clinic)}
                          className="clinic-card-visual group/photo relative shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b53]/55 focus-visible:ring-offset-2"
                          aria-label={`查看${clinic.name}门店实景大图`}
                        >
                          <img
                            src={clinic.image}
                            alt={clinic.imageAlt ?? `${clinic.name}门店实景`}
                            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover/photo:scale-105"
                            loading="eager"
                            decoding="async"
                          />
                          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-[#173d35]/85 px-2 py-0.5 text-[0.625rem] font-medium text-white backdrop-blur-sm">
                            <ZoomIn className="size-3" aria-hidden="true" />
                            看实景
                          </span>
                        </button>
                      ) : (
                        <div className="clinic-card-visual clinic-card-visual-empty relative shrink-0" aria-hidden="true">
                          <span className="absolute left-3 top-1 text-[0.625rem] font-semibold tracking-[0.12em] text-[#607c70]">汇医盟</span>
                          <span className="absolute bottom-0 right-2 font-serif text-[2.8rem] leading-none text-[#176b53]/35">{String(index + 1).padStart(2, '0')}</span>
                        </div>
                      )}
                    </div>

                    <a
                      href={clinic.navigationUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`在地图中打开${clinic.name}地址`}
                      className="mt-3.5 flex min-h-14 items-center gap-2 rounded-xl bg-[#f4f0e6] px-3.5 py-2.5 text-sm leading-5 text-[#53665f] hover:bg-[#eee8da] hover:text-[#176b53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b53]/40"
                    >
                      <MapPin className="size-4 shrink-0 text-[#a27632]" aria-hidden="true" />
                      <span className="min-w-0 flex-1">{clinic.shortAddress}</span>
                      <ChevronRight className="size-4 shrink-0 text-[#176b53]" aria-hidden="true" />
                    </a>

                    <div className={`mt-3 grid gap-2 ${clinic.appointmentAvailable ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <a
                        href={`tel:${clinic.phone}`}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#176b53] px-3 text-sm font-semibold text-white hover:bg-[#125642]"
                      >
                        <PhoneCall className="size-4" aria-hidden="true" />
                        电话
                      </a>
                      <a
                        href={clinic.navigationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#176b53]/20 bg-white px-3 text-sm font-semibold text-[#176b53] hover:bg-[#edf5f1]"
                      >
                        <Navigation className="size-4" aria-hidden="true" />
                        导航
                      </a>
                      {clinic.appointmentAvailable ? (
                        <a
                          href={huiyitangAppointmentUrl}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#a87a32]/25 bg-[#f8edcf] px-2 text-sm font-semibold text-[#7d5925] hover:bg-[#f2e2b7]"
                          aria-label={`打开${clinic.name}预约小程序`}
                        >
                          <CalendarDays className="size-4" aria-hidden="true" />
                          预约
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#176b53]/25 bg-white px-6 py-12 text-center">
            <Search
              className="mx-auto size-7 text-[#176b53]"
              aria-hidden="true"
            />
            <p className="mt-3 font-bold text-[#173d35]">没有找到相关诊所</p>
            <p className="mt-1 text-sm text-[#6f817b]">
              换一个名称、区域或地址关键词试试。
            </p>
            <button
              type="button"
              onClick={() => {
                setArea('全部');
                setKeyword('');
              }}
              className="mt-4 text-sm font-bold text-[#176b53]"
            >
              查看全部诊所
            </button>
          </div>
        )}
      </section>

      <section id="about" className="bg-[#173d35] text-[#f8f1df]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-11 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-14">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#e1c77f]">关于汇医盟</p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-[-0.03em] text-white">
              把找诊所这件事，做得简单一点
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#cedcd6]">
              找诊所时，大家通常先想知道三件事：离我多远、怎么去、能不能联系上。我们把地址、电话和导航放在一个页面里，少一点来回查找。
            </p>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[#cedcd6]">
              门店信息偶尔会调整。如果你发现地址或电话不对，告诉我们就好，我们核对后会及时更新。
            </p>
          </div>

          <div
            id="join"
            className="rounded-[1.5rem] border border-[#e1c77f]/45 bg-[#f5ead2] p-6 text-[#173d35] shadow-[0_20px_50px_rgba(4,25,20,0.25)] sm:p-7"
          >
            <p className="text-sm font-semibold text-[#8b6429]">诊所资料需要新增或修改？</p>
            <h2 className="mt-2 text-2xl font-bold">和我们说一声</h2>
            <p className="mt-3 text-sm leading-7 text-[#60736c]">
              请准备好诊所名称、地址、联系电话和营业时间。我们核对资料后再更新页面。
            </p>
            <a
              id="contact"
              href={`tel:${customerServicePhone}`}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176b53] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(23,107,83,0.18)]"
            >
              <PhoneCall className="size-4" aria-hidden="true" />
              电话联系 {customerServicePhone}
            </a>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
        aria-labelledby="faq-title"
      >
        <div className="flex items-center gap-3 border-b border-[#173d35]/10 pb-5">
          <span className="grid size-10 place-items-center rounded-full bg-[#e1c77f]/30 text-[#8b6429]">
            <CircleHelp className="size-5" aria-hidden="true" />
          </span>
          <h2 id="faq-title" className="text-2xl font-bold tracking-[-0.02em]">
            常见问题
          </h2>
        </div>
        <div className="max-w-3xl divide-y divide-[#173d35]/10">
          <details className="group py-5">
            <summary className="cursor-pointer list-none text-base font-bold">
              距离是怎样计算的？
            </summary>
            <p className="mt-3 text-sm leading-7 text-[#657871]">
              获得定位权限后，页面会按直线距离估算并排序；实际驾车或步行路程以地图导航为准。
            </p>
          </details>
          <details className="group py-5">
            <summary className="cursor-pointer list-none text-base font-bold">
              为什么部分诊所不能微信预约？
            </summary>
            <p className="mt-3 text-sm leading-7 text-[#657871]">
              目前仅展示已经提供预约入口的诊所；其他诊所可先拨打门店电话了解安排。
            </p>
          </details>
          <details className="group py-5">
            <summary className="cursor-pointer list-none text-base font-bold">
              发现信息不准确怎么办？
            </summary>
            <p className="mt-3 text-sm leading-7 text-[#657871]">
              请联系汇医盟客服并说明诊所名称与需要更新的内容，我们会尽快核对。
            </p>
          </details>
        </div>
      </section>

      <section className="border-t border-[#173d35]/8 bg-[#e7e1d5] px-5 py-6 text-center text-sm leading-7 text-[#657871]">
        <p className="mx-auto max-w-3xl">
          这是一份诊所信息查询页，不能代替医生诊断。门店信息如有变化，请以诊所实际情况为准；遇到急症，请立即拨打 120 或前往医院急诊。
        </p>
      </section>

      <footer className="bg-[#faf7ef] px-5 py-7 text-center text-sm text-[#6f817b]">
        <p className="font-semibold text-[#385b51]">
          汇医盟 · 广州诊所信息整理
        </p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex rounded-md px-2 py-1 text-xs font-medium underline decoration-[#176b53]/35 underline-offset-4 transition-colors hover:text-[#176b53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b53]/50"
        >
          粤ICP备2026132665号
        </a>
      </footer>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-3 border-t border-[#d6c9b0] bg-[#fffdf8]/96 px-2 shadow-[0_-8px_24px_rgba(37,66,57,0.10)] backdrop-blur md:hidden"
        aria-label="页面快捷入口"
      >
        <a
          href="#clinics"
          className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#176b53]"
        >
          <MapPin className="size-5" aria-hidden="true" />
          找诊所
        </a>
        <a
          href={wellnessIndexHref}
          className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#536c63]"
        >
          <BookOpenText className="size-5" aria-hidden="true" />
          养生指南
        </a>
        <a
          href="#about"
          className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#536c63]"
        >
          <Building2 className="size-5" aria-hidden="true" />
          关于我们
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
          className="max-h-[92vh] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#fffdf8] p-2 shadow-[0_30px_90px_rgba(4,25,20,0.45)] before:fixed before:inset-0 before:-z-10 before:bg-[#071d18]/75 before:backdrop-blur-sm sm:max-w-3xl sm:p-3"
        >
          <DialogTitle className="sr-only">
            {activeClinicImage ? `${activeClinicImage.name}门店实景` : '门店实景'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            点击关闭按钮、弹窗外区域或按 Esc 键可以退出大图查看。
          </DialogDescription>
          <DialogClose
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-[#173d35]/85 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[#173d35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="关闭大图"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
          {activeClinicImage?.image ? (
            <>
              <img
                src={activeClinicImage.image}
                alt={activeClinicImage.imageAlt ?? `${activeClinicImage.name}门店实景`}
                className="max-h-[76vh] w-full rounded-[1.1rem] bg-[#efe9dc] object-contain"
                decoding="async"
              />
              <div className="flex items-center justify-between gap-4 px-3 py-3 sm:px-4">
                <div>
                  <p className="font-bold text-[#173d35]">{activeClinicImage.name}</p>
                  <p className="mt-0.5 text-xs text-[#6f817b]">门店实景</p>
                </div>
                <span className="text-xs text-[#8d7444]">点击空白处关闭</span>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

    </main>
  );
}
