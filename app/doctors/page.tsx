import type { Metadata } from 'next';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import { getClinic } from '@/lib/clinics';
import { clinicDetailHref, clinicsHref } from '@/lib/site-links';
import { ClinicEventLink } from '@/components/clinic-events';
import '../cooperation/cooperation.css';
import './doctors.css';

export const metadata: Metadata = {
  title: '医生与出诊信息｜汇医盟',
  description:
    '了解汇医盟医生资料与出诊信息的核实状态，通过各医馆联系方式确认当前出诊及预约安排。',
  alternates: { canonical: 'https://www.huiyimeng.com/doctors.html' },
};

export default function DoctorsPage() {
  const linghai = getClinic('linghai-liwan');
  return (
    <>
      <a className="site-skip-link" href="#doctors-main">
        跳到正文
      </a>
      <SiteHeader backHref={clinicsHref} />
      <main
        id="doctors-main"
        className="cooperation-page doctors-information-page"
      >
        <section className="cooperation-intro">
          <p className="cooperation-eyebrow">医生与出诊</p>
          <h1>
            出发前，
            <br />
            先确认出诊安排。
          </h1>
          <p>
            当前尚未收录资料完整、核实并获得展示授权的医生及排班信息。各医馆营业时间与医生出诊时间分开核对，请通过对应医馆电话或已有预约入口查询。
          </p>
          <a className="cooperation-primary" href={clinicsHref}>
            查看医馆与联系方式 <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>
        <section
          className="cooperation-section doctors-information-card"
          aria-labelledby="doctors-empty-title"
        >
          <CalendarDays size={30} aria-hidden="true" />
          <h2 id="doctors-empty-title">医生资料与排班待医馆确认</h2>
          <p>
            公布前需要核实医生姓名、执业类别与范围、注册机构、出诊时间及展示授权。资料齐全后会在对应医馆详情页展示。
          </p>
          <p className="cooperation-note">
            没有已确认排班时，不提供按出诊日期筛选，避免把营业时间当作医生出诊时间。
          </p>
        </section>
        <section
          className="cooperation-section doctors-information-card doctors-legacy-card"
          aria-labelledby="doctors-legacy-title"
        >
          <span
            id="doctor-linghai-chen"
            className="doctors-legacy-anchor"
            aria-hidden="true"
          />
          <span
            id="doctor-linghai-lan"
            className="doctors-legacy-anchor"
            aria-hidden="true"
          />
          <span
            id="doctor-linghai-zhong"
            className="doctors-legacy-anchor"
            aria-hidden="true"
          />
          <h2 id="doctors-legacy-title">原站医生资料仍在核实</h2>
          <p>原站医生资料尚待身份、出诊及展示授权核实，请联系岭海确认。</p>
          <p>
            旧资料入口继续保留，核实完成前不提供医生详情、排班或可预约状态。
          </p>
          {linghai ? (
            <div className="doctors-legacy-actions">
              <ClinicEventLink
                clinicId={linghai.id}
                event="phone_click"
                href={`tel:${linghai.phone}`}
                className="cooperation-primary"
              >
                电话联系岭海
              </ClinicEventLink>
              <a
                className="cooperation-text-link"
                href={`${clinicDetailHref(linghai.id)}#clinic-contact`}
              >
                查看岭海资料与联系方式{' '}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <a className="cooperation-text-link" href={clinicsHref}>
              查看医馆与联系方式 <ArrowRight size={16} aria-hidden="true" />
            </a>
          )}
        </section>
      </main>
      <footer className="cooperation-footer">汇医盟 · 广州医馆信息服务</footer>
    </>
  );
}
