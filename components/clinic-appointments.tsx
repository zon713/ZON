'use client';

/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Real clinic QR asset and static COS routes. */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  PhoneCall,
  QrCode,
  Check,
} from 'lucide-react';
import { clinics as clinicData } from '@/lib/clinics';
import { recordClinicEvent } from '@/lib/analytics';
import { getClinicReferralSource } from '@/lib/referrals';
import { clinicDetailHref, visitGuideHref } from '@/lib/site-links';

type BookingClinic = {
  id: string;
  name: string;
  phone: string;
  area: string;
  addressNeedsConfirmation?: boolean;
};
type BookingEntry = { qr: string; label: string; alt: string; note?: string };
// Add an authorized entry here when another clinic supplies its real QR.
const bookingEntries: Record<string, BookingEntry> = Object.fromEntries(
  clinicData
    .filter((c) => c.appointment)
    .map((c) => [
      c.id,
      {
        qr: c.appointment!.qrImage,
        label: c.appointment!.label,
        alt: c.name + '原版预约小程序码',
        note: '原网站预约入口，当前可用性及医生排班待医馆复核。进入后请确认目标医馆及当前可约安排。',
      },
    ]),
);

export function ClinicAppointments({ clinics }: { clinics: BookingClinic[] }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const id = new URLSearchParams(window.location.search).get('clinic');
      const index = clinics.findIndex((item) => item.id === id);
      if (index >= 0) setSelected(index);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [clinics]);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const clinic = clinics[selected];
  const booking = bookingEntries[clinic.id];
  function choose(index: number) {
    setSelected(index);
  }
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % clinics.length
        : event.key === 'ArrowLeft'
          ? (index + clinics.length - 1) % clinics.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? clinics.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(next);
    tabs.current[next]?.focus();
  }
  return (
    <section className="clinic-booking section-wrap" aria-label="医馆预约入口">
      <div className="booking-step-heading">
        <span>01</span>
        <h2>先选择你要到访的医馆</h2>
      </div>
      <div
        className="booking-clinic-tabs"
        role="tablist"
        aria-label="选择预约医馆"
      >
        {clinics.map((item, index) => (
          <button
            ref={(node) => {
              tabs.current[index] = node;
            }}
            key={item.id}
            id={`booking-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-controls="booking-details"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => choose(index)}
            onKeyDown={(event) => move(event, index)}
          >
            <Building2 size={21} strokeWidth={1.4} aria-hidden="true" />
            <span>
              <strong>{item.name}</strong>
              <small>
                {item.area} ·{' '}
                {bookingEntries[item.id] ? '微信预约' : '电话联系'}
              </small>
            </span>
            {selected === index && <Check size={15} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div
        id="booking-details"
        role="tabpanel"
        aria-labelledby={`booking-tab-${selected}`}
        className="booking-detail-grid"
        key={clinic.id}
      >
        <div className="booking-entry-card">
          <span className="booking-entry-eyebrow">
            02 · {booking ? '微信预约' : '联系医馆'}
          </span>
          <h3>{clinic.name}</h3>
          {booking ? (
            <>
              <div className="appointment-code-label">
                <QrCode size={17} aria-hidden="true" />
                {booking.label}
              </div>
              <img
                className="appointment-page-qr"
                src={booking.qr}
                alt={booking.alt}
                width={528}
                height={489}
              />
              <p className="appointment-page-hint">
                微信内可尝试长按识别原版小程序码
              </p>
              <p className="booking-qr-note">
                电脑端请用手机微信扫一扫，扫描上方小程序码。
              </p>
              <p className="appointment-page-doctor">{booking.note}</p>
            </>
          ) : (
            <>
              <div className="booking-phone-art" aria-hidden="true">
                <PhoneCall size={40} strokeWidth={1.2} />
                <span>联系门店，确认安排</span>
              </div>
              <p className="booking-no-qr">
                当前通过电话联系医馆，确认坐诊、预约方式与到访时间。
              </p>
              <a
                className="booking-phone"
                href={`tel:${clinic.phone}`}
                onClick={() =>
                  recordClinicEvent(
                    'phone_click',
                    clinic.id,
                    getClinicReferralSource(window.location.search, clinic.id),
                  )
                }
              >
                <PhoneCall size={21} aria-hidden="true" />
                <span>
                  <small>医馆电话</small>
                  {clinic.phone}
                </span>
                <ArrowUpRight size={19} aria-hidden="true" />
              </a>
              <p className="booking-qr-note">
                小程序入口更新后，将在这里展示。
              </p>
            </>
          )}
          {clinic.addressNeedsConfirmation && (
            <p className="booking-address-note">
              出发前请电话确认本次接诊地点。
            </p>
          )}
          <a className="booking-clinic-link" href={clinicDetailHref(clinic.id)}>
            查看医馆地址与详情
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <aside className="booking-howto">
          <div className="booking-howto-mark">
            <CalendarDays size={24} strokeWidth={1.3} aria-hidden="true" />
            <span>到访之前</span>
          </div>
          <h3>{booking ? '微信扫码预约' : '这三件事，先问清楚'}</h3>
          <ol>
            {(booking
              ? [
                  '在微信内，长按上方小程序码识别预约。',
                  '在电脑上浏览时，用手机微信扫一扫扫描小程序码。',
                  '若未出现识别选项，可保存完整图片，再从微信扫一扫的相册选取。',
                ]
              : [
                  '确认当天医师与坐诊时间。',
                  '询问预约方式、费用及所需资料。',
                  '核对完整地址，再安排出发。',
                ]
            ).map((text, index) => (
              <li key={text}>
                <span>0{index + 1}</span>
                {text}
              </li>
            ))}
          </ol>
          <p>请以小程序预约结果或医馆确认信息为准。</p>
          <a className="editorial-link" href={visitGuideHref}>
            翻阅到访指南
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}
