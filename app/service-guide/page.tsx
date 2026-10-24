import type { Metadata } from 'next';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleHelp,
  MapPin,
  MessageCircle,
  Search,
} from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import {
  appointmentHref,
  bodyGuideHref,
  clinicsHref,
  doctorsHref,
  locationsHref,
  privacyHref,
  supportHref,
  visitGuideHref,
} from '@/lib/site-links';
import './service-guide.css';

export const metadata: Metadata = {
  title: '就诊指南｜第一次使用汇医盟',
  description:
    '了解怎样使用人体导览、查找医馆、查询医生出诊、联系预约、确认费用与到店导航。无需注册即可查询公开资料。',
  alternates: { canonical: 'https://www.huiyimeng.com/service-guide.html' },
};

const steps = [
  {
    number: '01',
    icon: Search,
    title: '先找到医馆',
    text: '打开医馆目录，输入医馆名称、街道或地址，按地区缩小范围。人体导览也可选择部位查看资料收录状态。',
    href: clinicsHref,
    action: '查找医馆',
  },
  {
    number: '02',
    icon: CalendarDays,
    title: '核对出诊，再联系本馆',
    text: '查看该馆详情中的医生、出诊与预约方式。缺少已确认的排班时，请先电话询问医师、日期和接诊地点。',
    href: appointmentHref,
    action: '选择医馆，了解预约方式',
  },
  {
    number: '03',
    icon: MapPin,
    title: '确认地点，再出发',
    text: '确认医馆地址、楼层、入口和当天安排后，点击本馆的“导航到店”。地址有待核对时，请先电话确认。',
    href: locationsHref,
    action: '查看医馆位置',
  },
];

export default function ServiceGuidePage() {
  return (
    <>
      <a className="site-skip-link" href="#service-guide-main">
        跳到就诊指南
      </a>
      <SiteHeader active="visit" backHref="/" />
      <main className="service-page" id="service-guide-main">
        <header className="service-hero">
          <p className="service-eyebrow">汇医盟 · 使用指南</p>
          <span className="service-hero-icon">
            <BookOpen size={28} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h1>第一次使用汇医盟</h1>
          <p>
            查清信息、联系本馆，再安排到访。
            <br />
            公开资料无需注册即可查看。
          </p>
        </header>

        <nav className="service-jump-links" aria-label="指南快速导航">
          <a href="#guide-steps">怎么开始</a>
          <a href="#guide-questions">常见问题</a>
          <a href="#guide-help">信息更正与帮助</a>
        </nav>

        <section
          className="service-section"
          id="guide-steps"
          aria-labelledby="guide-steps-title"
        >
          <div className="service-section-heading">
            <p className="service-eyebrow">三步开始</p>
            <h2 id="guide-steps-title">从查询，到联系，再到店。</h2>
          </div>
          <ol className="service-steps">
            {steps.map((step) => (
              <li className="service-step" key={step.number}>
                <span className="service-step-number">{step.number}</span>
                <div>
                  <step.icon size={23} strokeWidth={1.5} aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <a href={step.href}>
                    {step.action}
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="service-section"
          id="guide-questions"
          aria-labelledby="guide-questions-title"
        >
          <div className="service-section-heading">
            <p className="service-eyebrow">常见问题</p>
            <h2 id="guide-questions-title">出发前，把这几件事问清。</h2>
          </div>
          <div className="service-faqs">
            <details open>
              <summary>
                <span>人体导览能帮我做什么？</span>
                <CircleHelp size={18} aria-hidden="true" />
              </summary>
              <div>
                <p>
                  可点选人体部位，也可使用文字入口查看相应资料的收录状态，再按名称或地区查找医馆。人体导览不根据部位判断疾病、开具方案或推荐某家医馆最适合您。
                </p>
                <p>
                  目前部位与科目、服务的专业对应资料仍待审核，相关查询会如实显示空结果。取消部位条件后，可继续使用公共目录。
                </p>
                <a href={bodyGuideHref}>
                  体验人体导览
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </details>
            <details>
              <summary>
                <span>医馆营业时间就是医生出诊时间吗？</span>
                <CircleHelp size={18} aria-hidden="true" />
              </summary>
              <div>
                <p>
                  营业时间是门店开放安排，医生出诊时间是某位医生在某个地点的接诊安排，两者可能不同。请核对医生、日期和医馆地点；同一医生在不同医馆的安排需分别确认。
                </p>
                <p>
                  尚无经确认的排班时，不显示“有号”“可立即预约”等状态。当前查询页会说明资料状态，可联系本馆核对。
                </p>
                <a href={doctorsHref}>
                  查看医生与出诊资料
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </details>
            <details>
              <summary>
                <span>点了电话或预约入口，就算预约成功了吗？</span>
                <CircleHelp size={18} aria-hidden="true" />
              </summary>
              <div>
                <p>
                  “电话咨询”会打开拨号功能；是否接通、能否预约，需要本馆答复。“预约方式”用于查看本馆现有的小程序或电话渠道。进入外部预约系统，也需要完成该系统的实际确认流程。
                </p>
                <p>
                  汇医盟网页目前不保存预约记录。预约是否成功、具体时段与地点，请以医馆或其预约系统的确认结果为准。
                </p>
                <a href={appointmentHref}>
                  选择医馆，查看真实联系入口
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </details>
            <details>
              <summary>
                <span>诊疗费用在哪里查？</span>
                <CircleHelp size={18} aria-hidden="true" />
              </summary>
              <div>
                <p>
                  进入对应医馆详情，查看已确认的收费项目、价格和适用说明。未展示价格的项目，请向本馆询问项目内容、是否含药费及其他必要费用，再决定是否预约。
                </p>
                <p>
                  合作页面的99元/月、1000元/年是医馆与平台的基础合作费用，不是患者的挂号费、诊疗费或药费。
                </p>
                <a href={clinicsHref}>
                  选择医馆查询费用
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </details>
            <details>
              <summary>
                <span>预约变更、停诊或取消，联系谁？</span>
                <CircleHelp size={18} aria-hidden="true" />
              </summary>
              <div>
                <p>
                  请优先联系您预约的医馆，或在原预约系统按其规则处理。改期、退费和停诊安排由实际提供服务的医馆确认，平台不能通过一次按钮点击替您完成变更。
                </p>
                <p>
                  准备好医馆名称和原预约时间，向本馆咨询所需材料。请勿把身份证、病历等敏感资料发到不明的链接或普通留言渠道。
                </p>
                <a href={appointmentHref}>
                  查找本馆联系方式
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </details>
            <details>
              <summary>
                <span>地图、小程序或电话无法打开怎么办？</span>
                <CircleHelp size={18} aria-hidden="true" />
              </summary>
              <div>
                <p>
                  可先查看医馆详情中显示的电话号码，使用手机手动拨号。地图入口将打开外部地图服务；无反应时，可复制页面上的完整地址自行搜索，并与本馆核对。
                </p>
                <p>
                  汇医堂保留了原网站小程序码和链接，需在微信真机核验。微信内可长按识别，微信外可保存完整小程序码后在微信扫一扫中从相册选择；不能打开时，请电话咨询本馆。
                </p>
                <a href={supportHref}>
                  联系平台反馈入口问题
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </details>
          </div>
        </section>

        <section
          className="service-help-card"
          id="guide-help"
          aria-labelledby="guide-help-title"
        >
          <MessageCircle size={26} strokeWidth={1.5} aria-hidden="true" />
          <h2 id="guide-help-title">资料有变化，或需要使用帮助？</h2>
          <p>
            地址、电话、排班或预约链接有误，可联系平台反馈医馆名称和需要更正的项目。涉及诊疗、费用和预约变更，请直接联系对应医馆。
          </p>
          <div className="service-action-row">
            <a
              className="service-button service-button-primary"
              href={supportHref}
            >
              查看平台联系方式
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="service-button" href={visitGuideHref}>
              查看原有到访指南
            </a>
          </div>
        </section>
        <footer className="service-footer">
          <span>汇医盟 · 广州医馆信息服务</span>
          <a href={privacyHref}>隐私与使用说明</a>
        </footer>
      </main>
    </>
  );
}
