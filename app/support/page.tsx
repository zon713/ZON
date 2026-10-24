import type { Metadata } from 'next';
import {
  ArrowRight,
  ClipboardCheck,
  MessageCircle,
  PhoneCall,
  Stethoscope,
} from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import { platformPhone } from '@/lib/clinics';
import {
  appointmentHref,
  clinicsHref,
  cooperationHref,
  privacyHref,
  serviceGuideHref,
} from '@/lib/site-links';
import '../service-guide/service-guide.css';
import './support.css';

export const metadata: Metadata = {
  title: '联系平台与使用帮助｜汇医盟',
  description:
    '查看汇医盟现有平台联系方式，反馈网页使用、资料更新与医馆合作问题。出诊、费用和预约变更请联系对应医馆。',
  alternates: { canonical: 'https://www.huiyimeng.com/support.html' },
};

export default function SupportPage() {
  return (
    <>
      <a className="site-skip-link" href="#support-main">
        跳到平台联系方式
      </a>
      <SiteHeader active="about" backHref="/" />
      <main className="service-page support-page" id="support-main">
        <header className="service-hero">
          <p className="service-eyebrow">就医服务 · 联系客服</p>
          <span className="service-hero-icon">
            <MessageCircle size={27} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h1>
            有问题，
            <br />
            先找对联系入口。
          </h1>
          <p>
            网页使用与资料反馈，可联系汇医盟。
            <br />
            出诊、费用与预约变更，请直接联系本馆。
          </p>
        </header>

        <section
          className="support-contact-card"
          aria-labelledby="support-platform-title"
        >
          <div className="support-card-heading">
            <span className="support-icon">
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="service-eyebrow">平台服务</p>
              <h2 id="support-platform-title">联系汇医盟</h2>
            </div>
          </div>
          <p>
            适用于网页入口无法打开、医馆资料更正、图片与展示授权、医馆合作等平台事项。
          </p>
          <div className="support-phone-block">
            <span>原网站公开机构电话</span>
            <a className="support-phone-number" href={`tel:${platformPhone}`}>
              {platformPhone}
            </a>
            <a
              className="service-button service-button-primary"
              href={`tel:${platformPhone}`}
            >
              <PhoneCall size={18} aria-hidden="true" />
              电话联系平台
            </a>
          </div>
          <dl className="support-channel-status">
            <div>
              <dt>渠道状态</dt>
              <dd>原网站公开机构电话，接通及接待时间待平台确认。</dd>
            </div>
            <div>
              <dt>在线人工</dt>
              <dd>当前网页未接入在线人工客服，点击电话将打开手机拨号功能。</dd>
            </div>
          </dl>
          <p className="support-channel-note">
            若暂时无人接听，可稍后再试。网页不会显示“已转人工”，也不会自动生成工单。
          </p>
        </section>

        <section
          className="support-clinic-card"
          aria-labelledby="support-clinic-title"
        >
          <div className="support-card-heading">
            <span className="support-icon">
              <Stethoscope size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="service-eyebrow">医馆服务</p>
              <h2 id="support-clinic-title">诊疗问题，请联系对应医馆</h2>
            </div>
          </div>
          <p>
            具体健康问题请咨询接诊医师；医生出诊、诊疗费用、预约确认、改期和退费，请向实际提供服务的医馆确认。
          </p>
          <div className="service-action-row">
            <a
              className="service-button service-button-primary"
              href={appointmentHref}
            >
              选择医馆，查看联系与预约方式
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="service-button" href={clinicsHref}>
              查看医馆目录
            </a>
          </div>
        </section>

        <section
          className="support-feedback-card"
          aria-labelledby="support-feedback-title"
        >
          <ClipboardCheck size={25} strokeWidth={1.5} aria-hidden="true" />
          <h2 id="support-feedback-title">反馈时，说清这三件事。</h2>
          <ol>
            <li>
              <span>1</span>
              <div>
                <strong>哪个页面或哪家医馆</strong>
                <p>告诉平台页面名称或医馆完整名称，避免同名混淆。</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>遇到什么问题</strong>
                <p>例如地址有变化、电话错误、预约入口打不开。</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>需要核对的具体内容</strong>
                <p>资料修改需经本馆确认；涉及医学内容和推广文案需专业核查。</p>
              </div>
            </li>
          </ol>
          <p className="support-feedback-note">
            普通使用反馈无需提供病历、身份证、就诊记录或病情描述。本页没有提交表单或资料上传功能。
          </p>
        </section>

        <div className="support-more-links">
          <a href={serviceGuideHref}>
            先看就诊与使用指南
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a href={cooperationHref}>
            了解医馆合作
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <footer className="service-footer">
          <span>汇医盟 · 广州医馆信息服务</span>
          <a href={privacyHref}>隐私与使用说明</a>
        </footer>
      </main>
    </>
  );
}
