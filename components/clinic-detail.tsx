'use client';

/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Existing photos and real clinic QR are served by the static COS export. */

import { useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  Copy,
  MapPin,
  PhoneCall,
  Share2,
  ShieldCheck,
  X,
  ZoomIn,
} from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import {
  getClinic,
  platformPhone,
  verifiedDoctors,
  verifiedPrices,
  verifiedServices,
} from '@/lib/clinics';
import { clinicsHref, contactHref } from '@/lib/site-links';
import { createClinicShareUrl } from '@/lib/referrals';
import type { ReferralSource } from '@/lib/referrals';
import { ClinicEvents, ClinicEventLink } from '@/components/clinic-events';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import './clinic-detail.css';

const subscribeToOrigin = () => () => {};
const readOrigin = () => window.location.origin;
const productionOrigin = () => 'https://www.huiyimeng.com';

export function ClinicDetail({ clinicId }: { clinicId: string }) {
  const clinic = getClinic(clinicId);
  const shareOrigin = useSyncExternalStore(
    subscribeToOrigin,
    readOrigin,
    productionOrigin,
  );
  const [shareSource, setShareSource] =
    useState<Exclude<ReferralSource, 'unknown'>>('clinic');
  const [shareStatus, setShareStatus] = useState('');
  const shareInput = useRef<HTMLInputElement>(null);
  const { overlay, openOverlay, closeOverlay } = useOverlayHistory<'photo'>();

  if (!clinic)
    return (
      <main className="clinic-page">
        <h1>暂无这家医馆资料</h1>
        <a href={clinicsHref}>查看医馆目录</a>
      </main>
    );

  const services = verifiedServices(clinic);
  const doctors = verifiedDoctors(clinic);
  const prices = verifiedPrices(clinic);
  const shareUrl = createClinicShareUrl(clinic.id, shareSource, shareOrigin);

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('本馆链接已复制。');
    } catch {
      shareInput.current?.focus();
      shareInput.current?.select();
      setShareStatus('未能自动复制，已选中链接，请手动复制。');
    }
  }

  async function shareClinic() {
    if (!clinic) return;
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `${clinic.name}｜汇医盟`,
        text: `查看${clinic.name}的地址、电话和联系预约方式。`,
        url: shareUrl,
      });
      setShareStatus('已完成系统分享操作。');
    } catch (error) {
      setShareStatus(
        error instanceof Error && error.name === 'AbortError'
          ? '已取消分享。'
          : '未能完成分享，可使用下方复制链接。',
      );
    }
  }

  return (
    <div className="clinic-detail-shell">
      <ClinicEvents clinicId={clinic.id} />
      <SiteHeader active="clinics" backHref={clinicsHref} />
      <main className="clinic-page" id="main-content">
        <a className="clinic-directory-return" href={clinicsHref}>
          <ArrowLeft size={16} aria-hidden="true" />
          查看公共医馆目录
        </a>

        <section className="clinic-profile" aria-labelledby="clinic-name">
          <div className="clinic-profile-copy">
            <p className="clinic-detail-eyebrow">
              {clinic.city} · {clinic.area} · {clinic.type}
            </p>
            <h1 id="clinic-name">{clinic.name}</h1>
            <p className="clinic-profile-intro">
              了解本馆地址、联系入口与预约方式。到访前请先向医馆确认接诊安排。
            </p>
            <div className="clinic-detail-tags">
              <span>原网站收录资料</span>
              <span>待医馆复核</span>
            </div>
            <div className="clinic-profile-actions">
              <ClinicEventLink
                clinicId={clinic.id}
                event="phone_click"
                href={`tel:${clinic.phone}`}
                className="clinic-action clinic-action-primary"
              >
                <PhoneCall size={18} aria-hidden="true" />
                电话咨询
              </ClinicEventLink>
              {clinic.navigationUrl ? (
                <ClinicEventLink
                  clinicId={clinic.id}
                  event="navigation_click"
                  href={clinic.navigationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="clinic-action"
                >
                  <MapPin size={18} aria-hidden="true" />
                  导航到店
                </ClinicEventLink>
              ) : (
                <a className="clinic-action" href="#clinic-contact">
                  <MapPin size={18} aria-hidden="true" />
                  核对到访地址
                </a>
              )}
              {clinic.appointment && (
                <a className="clinic-action" href="#clinic-appointment">
                  <CalendarDays size={18} aria-hidden="true" />
                  查看预约方式
                </a>
              )}
            </div>
            <p className="clinic-direct-phone">
              本馆电话{' '}
              <ClinicEventLink
                clinicId={clinic.id}
                event="phone_click"
                href={`tel:${clinic.phone}`}
              >
                {clinic.phone}
              </ClinicEventLink>
            </p>
          </div>
          {clinic.image ? (
            <button
              type="button"
              className="clinic-profile-photo"
              onClick={() => openOverlay('photo')}
              aria-label={`放大查看${clinic.name}原网站门店照片`}
            >
              <img
                src={clinic.image}
                alt={clinic.imageAlt ?? `${clinic.name}原网站门店照片`}
                width={760}
                height={560}
              />
              <span>
                <ZoomIn size={15} aria-hidden="true" />
                查看门店照片
              </span>
            </button>
          ) : (
            <div className="clinic-photo-pending">
              <Building2 size={48} strokeWidth={1.2} aria-hidden="true" />
              <strong>{clinic.name}</strong>
              <span>门店照片待医馆提供</span>
            </div>
          )}
        </section>

        <div className="clinic-detail-layout">
          <div className="clinic-detail-main">
            <section
              className="clinic-detail-panel"
              aria-labelledby="clinic-basics"
            >
              <p className="clinic-detail-eyebrow">医馆资料</p>
              <h2 id="clinic-basics">先了解，再联系</h2>
              <p>
                本页沿用原网站中收录的{clinic.name}
                基础资料。医馆介绍、资质、服务项目及展示授权尚待医馆确认，当前不展示医疗水平、疗效或推荐排名。
              </p>
              <dl className="clinic-fact-list">
                <div>
                  <dt>
                    <MapPin size={17} aria-hidden="true" />
                    所在区域
                  </dt>
                  <dd>
                    {clinic.city} · {clinic.area}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Clock3 size={17} aria-hidden="true" />
                    营业时间
                  </dt>
                  <dd>{clinic.hours ?? '暂未提供，电话咨询医馆确认。'}</dd>
                </div>
                <div>
                  <dt>
                    <CalendarDays size={17} aria-hidden="true" />
                    医生出诊
                  </dt>
                  <dd>
                    {doctors.length
                      ? '见下方已确认的医生安排。'
                      : '暂未收到经核实的医生与出诊排班。'}
                  </dd>
                </div>
                <div>
                  <dt>
                    <ShieldCheck size={17} aria-hidden="true" />
                    资质资料
                  </dt>
                  <dd>
                    {clinic.license ?? '执业许可与诊疗范围待医馆提供核实。'}
                  </dd>
                </div>
              </dl>
              {clinic.id === 'huiyitang-guangzhou' && !clinic.logo && (
                <p className="clinic-muted-note">
                  汇医堂原版 Logo
                  文件暂未找到；本页使用原有门店照片，待补充原文件。
                </p>
              )}
            </section>

            <section
              className="clinic-detail-panel"
              aria-labelledby="clinic-services"
            >
              <p className="clinic-detail-eyebrow">服务与出诊</p>
              <h2 id="clinic-services">服务信息、医生安排分开确认</h2>
              <div className="clinic-information-block">
                <h3>服务科目</h3>
                {services.length ? (
                  <ul>
                    {services.map((service) => (
                      <li key={service.id}>
                        {service.name}
                        <small>依据：{service.source}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    暂未收录经专业审核的服务科目。可通过本馆电话询问诊疗范围；人体导览中的部位选择不代表本馆可提供相应诊疗。
                  </p>
                )}
              </div>
              <div className="clinic-information-block">
                <h3>医生与出诊时间</h3>
                {doctors.length ? (
                  <ul>
                    {doctors.map((doctor) => (
                      <li key={doctor.id}>
                        <strong>
                          {doctor.name}
                          {doctor.title ? ` · ${doctor.title}` : ''}
                        </strong>
                        <p>{doctor.schedule ?? '出诊时间待医馆确认。'}</p>
                        <small>依据：{doctor.source}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    医生姓名、执业信息和排班待医馆核实。营业时间与医生出诊时间不同，请先电话确认当天是否接诊。
                  </p>
                )}
              </div>
              <div className="clinic-information-block">
                <h3>价格与适用说明</h3>
                {prices.length ? (
                  <ul>
                    {prices.map((price) => (
                      <li key={price.id}>
                        <strong>
                          {price.name} · {price.amount}
                        </strong>
                        <p>{price.applicability}</p>
                        <small>依据：{price.source}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    暂未收到医馆确认的价格及适用条件。请向医馆确认具体项目、费用与适用说明。
                  </p>
                )}
              </div>
            </section>

            <section
              className="clinic-detail-panel"
              id="clinic-contact"
              aria-labelledby="clinic-contact-title"
            >
              <p className="clinic-detail-eyebrow">到访与联系</p>
              <h2 id="clinic-contact-title">联系这家医馆</h2>
              <dl className="clinic-fact-list">
                <div>
                  <dt>医馆电话</dt>
                  <dd>
                    <ClinicEventLink
                      clinicId={clinic.id}
                      event="phone_click"
                      href={`tel:${clinic.phone}`}
                    >
                      {clinic.phone}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </ClinicEventLink>
                  </dd>
                </div>
                <div>
                  <dt>地址资料</dt>
                  <dd>{clinic.address}</dd>
                </div>
              </dl>
              {clinic.addressNeedsConfirmation ? (
                <div className="clinic-attention">
                  <strong>地址存在冲突，暂不提供导航。</strong>
                  <p>
                    原网站同时留有以上两个地址。请拨打本馆电话核对当前接诊地点后再出发。
                  </p>
                </div>
              ) : (
                <>
                  <p className="clinic-muted-note">
                    地址来自原网站资料，尚待医馆复核。地图定位与实际入口可能有差异，出发前请电话确认。
                  </p>
                  <ClinicEventLink
                    clinicId={clinic.id}
                    event="navigation_click"
                    href={clinic.navigationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="clinic-inline-link"
                  >
                    导航到店
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </ClinicEventLink>
                </>
              )}
            </section>

            <section
              className="clinic-detail-panel"
              id="clinic-appointment"
              aria-labelledby="clinic-appointment-title"
            >
              <p className="clinic-detail-eyebrow">预约方式</p>
              <h2 id="clinic-appointment-title">
                {clinic.appointment
                  ? '汇医堂微信小程序入口'
                  : '先联系医馆，确认预约方式'}
              </h2>
              {clinic.appointment ? (
                <div className="clinic-appointment-layout">
                  <div className="clinic-qr-wrap">
                    <img
                      src={clinic.appointment.qrImage}
                      alt={`${clinic.name}原网站留存的微信预约小程序码，请使用微信扫描或识别`}
                      width={528}
                      height={489}
                    />
                    <span>{clinic.appointment.label}</span>
                  </div>
                  <div>
                    <p>
                      手机微信内可长按识别小程序码；电脑上浏览时，请使用手机微信扫一扫。
                    </p>
                    <p>
                      在微信外浏览，可尝试打开下方微信小程序入口。若未响应，可保存上方完整图片，再在微信扫一扫中从相册选取。
                    </p>
                    <ClinicEventLink
                      clinicId={clinic.id}
                      event="appointment_click"
                      href={clinic.appointment.schemeUrl}
                      className="clinic-action clinic-action-primary"
                    >
                      打开微信小程序
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </ClinicEventLink>
                    <p className="clinic-muted-note">
                      保留原网站提供的小程序码及链接，入口有效性、医生排班与接诊安排待医馆复核。无法打开时请电话咨询。是否预约成功以小程序结果或医馆确认为准。
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    本馆暂未提供可核实的在线预约链接。电话可用于询问出诊、预约渠道和到访准备，拨号点击不会自动生成预约。
                  </p>
                  <ClinicEventLink
                    clinicId={clinic.id}
                    event="phone_click"
                    href={`tel:${clinic.phone}`}
                    className="clinic-action clinic-action-primary"
                  >
                    <PhoneCall size={17} aria-hidden="true" />
                    电话咨询
                  </ClinicEventLink>
                </>
              )}
            </section>
          </div>

          <aside className="clinic-detail-aside">
            <section
              className="clinic-detail-panel clinic-share-panel"
              aria-labelledby="clinic-share-title"
            >
              <Share2 size={23} strokeWidth={1.5} aria-hidden="true" />
              <h2 id="clinic-share-title">分享这家医馆</h2>
              <p>打开链接后直接查看本馆资料与联系方式。</p>
              <label htmlFor="clinic-share-source">分享用途</label>
              <select
                id="clinic-share-source"
                value={shareSource}
                onChange={(event) => {
                  setShareSource(
                    event.target.value as Exclude<ReferralSource, 'unknown'>,
                  );
                  setShareStatus('');
                }}
              >
                <option value="clinic">医馆自有渠道</option>
                <option value="platform">汇医盟公共推广</option>
              </select>
              <label htmlFor="clinic-share-url">本馆专属链接</label>
              <input
                ref={shareInput}
                id="clinic-share-url"
                value={shareUrl}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
              <div className="clinic-share-actions">
                <button
                  type="button"
                  className="clinic-action clinic-action-primary"
                  onClick={() => void shareClinic()}
                >
                  <Share2 size={16} aria-hidden="true" />
                  分享本馆
                </button>
                <button
                  type="button"
                  className="clinic-action"
                  onClick={() => void copyLink()}
                >
                  <Copy size={16} aria-hidden="true" />
                  复制链接
                </button>
              </div>
              <output className="clinic-share-status" aria-live="polite">
                {shareStatus}
              </output>
              <small>
                来源标识仅用于区分入口，不含患者身份、病情或人体部位信息。页面访问、电话点击、导航点击与预约入口点击目前暂未统计。
              </small>
            </section>
            <section
              className="clinic-detail-panel clinic-source-panel"
              aria-labelledby="clinic-source-title"
            >
              <p className="clinic-detail-eyebrow">资料状态</p>
              <h2 id="clinic-source-title">哪些信息还在核对</h2>
              <dl>
                <div>
                  <dt>资料来源</dt>
                  <dd>原网站医馆目录与预约入口</dd>
                </div>
                <div>
                  <dt>代码整理日期</dt>
                  <dd>
                    <time dateTime={clinic.codeAuditedAt}>
                      {clinic.codeAuditedAt}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt>医馆业务核实日期</dt>
                  <dd>{clinic.businessVerifiedAt ?? '暂未获得'}</dd>
                </div>
                <div>
                  <dt>展示授权</dt>
                  <dd>
                    {clinic.authorizationStatus === 'confirmed'
                      ? '已确认'
                      : '待医馆确认'}
                  </dd>
                </div>
              </dl>
              <p>
                待补充：执业资质、营业时间、医生执业与排班、服务依据、价格与适用说明、照片使用授权。医学内容和医馆推广内容需业务方专业核查后发布。
              </p>
              <a className="clinic-inline-link" href={contactHref}>
                资料更正与授权联系
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a
                className="clinic-platform-phone"
                href={`tel:${platformPhone}`}
              >
                汇医盟资料维护：{platformPhone}
              </a>
            </section>
          </aside>
        </div>
        <footer className="clinic-page-footer">
          <span>汇医盟 · 广州医馆信息</span>
          <a href={clinicsHref}>
            主动查看其他医馆
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </footer>
      </main>

      <nav
        className="clinic-mobile-actions"
        aria-label={`${clinic.name}快捷联系`}
      >
        <ClinicEventLink
          clinicId={clinic.id}
          event="phone_click"
          href={`tel:${clinic.phone}`}
        >
          <PhoneCall size={19} aria-hidden="true" />
          <span>电话咨询</span>
        </ClinicEventLink>
        {clinic.navigationUrl ? (
          <ClinicEventLink
            clinicId={clinic.id}
            event="navigation_click"
            href={clinic.navigationUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={19} aria-hidden="true" />
            <span>导航到店</span>
          </ClinicEventLink>
        ) : (
          <a href="#clinic-contact">
            <MapPin size={19} aria-hidden="true" />
            <span>核对地址</span>
          </a>
        )}
        {clinic.appointment && (
          <a href="#clinic-appointment">
            <CalendarDays size={19} aria-hidden="true" />
            <span>预约方式</span>
          </a>
        )}
      </nav>
      <Dialog
        open={overlay === 'photo'}
        onOpenChange={(open) => {
          if (!open) closeOverlay();
        }}
      >
        <DialogContent className="clinic-photo-dialog" showCloseButton={false}>
          <DialogTitle>{clinic.name} · 门店照片</DialogTitle>
          <DialogClose className="clinic-photo-close" aria-label="关闭门店照片">
            <X size={20} aria-hidden="true" />
          </DialogClose>
          <DialogDescription>
            原网站留存照片，拍摄时间与图片展示授权待医馆确认。
          </DialogDescription>
          {clinic.image && (
            <img
              src={clinic.image}
              alt={clinic.imageAlt ?? `${clinic.name}门店照片`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
