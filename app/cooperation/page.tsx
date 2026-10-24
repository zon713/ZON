import type { Metadata } from 'next';
import { ArrowRight, Check, PhoneCall } from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import { platformPhone } from '@/lib/clinics';
import { clinicsHref } from '@/lib/site-links';
import './cooperation.css';

export const metadata: Metadata = {
  title: '医馆合作｜汇医盟',
  description:
    '汇医盟广州医馆资料展示合作，基础合作99元/月或1000元/年。了解标准资料页、目录展示、联系入口和入驻步骤。',
  alternates: { canonical: 'https://www.huiyimeng.com/cooperation.html' },
};

const services = [
  [
    '标准资料页',
    '独立医馆页面，整理经确认的介绍、地址、联系方式和已有预约入口。',
  ],
  ['目录展示', '在公共目录按真实资料展示，方便患者按名称、地址与地区查询。'],
  ['联系入口', '绑定本馆电话、导航和已有预约方式，按钮行为与名称一致。'],
  [
    '约定的信息维护',
    '按双方约定的范围和频次维护资料；排班与价格变化由医馆及时提供并核对。',
  ],
  [
    '已有能力支持的数据反馈',
    '分享入口可区分来源；全站访问与点击数据暂未统计，接入真实统计服务后再按约定反馈。',
  ],
  [
    '参与平台公共推广',
    '按双方约定参与平台公共推广，使用经医馆授权和审核的内容。',
  ],
];
const steps = [
  ['联系沟通', '确认医馆需求、展示内容和合作范围。'],
  ['提供资料', '提供机构基础资料、联系方式及图片展示授权。'],
  ['核对确认', '由医馆确认地址、电话、医生、排班、科目及价格适用说明。'],
  ['页面上线', '核对独立页面和本馆联系入口，确认后发布。'],
  ['持续维护', '按约定更新资料，有变化及时核对。'],
];

export default function CooperationPage() {
  return (
    <>
      <a className="site-skip-link" href="#cooperation-main">
        跳到正文
      </a>
      <SiteHeader active="cooperation" backHref="/" />
      <main id="cooperation-main" className="cooperation-page">
        <section className="cooperation-intro">
          <p className="cooperation-eyebrow">汇医盟 · 医馆合作</p>
          <h1>
            让医馆资料更清楚，
            <br />
            让患者联系更直接。
          </h1>
          <p>
            汇医盟是广州本地的医馆信息平台，帮助患者查找医馆、了解出诊和联系预约方式，也为医馆提供独立展示页面与联系入口。
          </p>
          <a className="cooperation-primary" href="#cooperation-contact">
            联系沟通 <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="cooperation-text-link" href={clinicsHref}>
            先看看医馆目录 <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section
          className="cooperation-section"
          aria-labelledby="cooperation-price"
        >
          <div className="cooperation-heading">
            <p className="cooperation-eyebrow">基础合作</p>
            <h2 id="cooperation-price">清楚的价格，明确的服务。</h2>
            <p>选择适合的合作周期，服务内容按双方约定落实。</p>
          </div>
          <div className="cooperation-prices">
            <article className="cooperation-price-card">
              <span>按月合作</span>
              <p>
                <strong>99</strong>
                <span>元 / 月</span>
              </p>
              <small>基础展示与信息服务</small>
            </article>
            <article className="cooperation-price-card cooperation-price-year">
              <span>按年合作</span>
              <p>
                <strong>1000</strong>
                <span>元 / 年</span>
              </p>
              <small>基础展示与信息服务</small>
            </article>
          </div>
          <ul className="cooperation-services">
            {services.map(([title, description]) => (
              <li key={title}>
                <Check size={20} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="cooperation-note">
            拍摄、代运营、小程序开发等服务，按具体需求另行沟通合作范围与费用。
          </p>
        </section>

        <section
          className="cooperation-section"
          aria-labelledby="cooperation-steps"
        >
          <div className="cooperation-heading">
            <p className="cooperation-eyebrow">入驻步骤</p>
            <h2 id="cooperation-steps">从资料核对开始。</h2>
          </div>
          <ol className="cooperation-steps">
            {steps.map(([title, description], index) => (
              <li key={title}>
                <span className="cooperation-step-number">0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <details className="cooperation-review">
            <summary>上线前需要核对哪些资料？</summary>
            <p>
              机构登记名称与执业资料、诊疗科目、医生身份及展示授权、出诊安排、价格及适用说明、真实地址、对外电话和预约链接。医学对应关系、服务介绍与推广文案应由医馆医疗负责人专业核查；未确认的内容如实标记或暂不展示。
            </p>
            <p>
              平台目录收录不代表医疗水平排名。来源链接只标识推广入口，电话点击不能直接计为真实咨询、确认预约或实际到店。
            </p>
          </details>
        </section>

        <section
          id="cooperation-contact"
          className="cooperation-contact"
          aria-labelledby="cooperation-contact-title"
        >
          <p className="cooperation-eyebrow">联系汇医盟</p>
          <h2 id="cooperation-contact-title">聊聊医馆的展示需求。</h2>
          <p>联系时请说明医馆名称、所在区域和希望展示的内容。</p>
          <a className="cooperation-primary" href={`tel:${platformPhone}`}>
            <PhoneCall size={19} aria-hidden="true" /> 电话沟通 {platformPhone}
          </a>
          <small>
            沿用现有官网的机构联系电话，本轮尚未独立回访确认。就诊、费用与改期请联系对应医馆。
          </small>
        </section>
      </main>
      <footer className="cooperation-footer">汇医盟 · 广州医馆信息服务</footer>
    </>
  );
}
