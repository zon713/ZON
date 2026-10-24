/* eslint-disable next/no-img-element, next/no-html-link-for-pages -- Existing assets and native links are served by the COS static export. */
import {
  ArrowUpRight,
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  Handshake,
  Leaf,
  MapPin,
  MonitorSmartphone,
  PhoneCall,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { BrandMark } from '@/app/brand-mark';
import {
  aboutHref,
  appointmentHref,
  clinicsHref,
  clinicDetailHref,
  cooperationHref,
  doctorsHref,
  contactHref,
  valuesHref,
  visitGuideHref,
  wellnessIndexHref,
} from '@/lib/site-links';

const portals = [
  { title: '品牌介绍', detail: '认识汇医盟', href: aboutHref, icon: Leaf },
  {
    title: '广州医馆',
    detail: '地址与联系方式',
    href: clinicsHref,
    icon: Building2,
  },
  {
    title: '医馆预约',
    detail: '选择对应医馆',
    href: appointmentHref,
    icon: CalendarDays,
  },
  {
    title: '养生指南',
    detail: '日常养护阅读',
    href: wellnessIndexHref,
    icon: BookOpenText,
  },
];

export function HomePortals() {
  return (
    <nav className="home-portals" aria-label="主要栏目">
      {portals.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.href} href={item.href}>
            <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}

const connections = [
  { title: '医馆协作', icon: Building2 },
  { title: '品牌内容', icon: BookOpenText },
  { title: '数字服务', icon: MonitorSmartphone },
];

function BrandNetwork() {
  return (
    <figure className="brand-network" aria-label="汇医盟的三个连接方向">
      <div className="brand-network-center">
        <span className="brand-network-kicker">HUI YI MENG</span>
        <BrandMark />
        <span>中医资源连接与运营支持</span>
      </div>
      <div className="brand-network-trunk" aria-hidden="true" />
      <div className="brand-network-branches">
        {connections.map(({ title, icon: Icon }) => (
          <div key={title}>
            <span className="brand-connection-icon">
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <strong>{title}</strong>
          </div>
        ))}
      </div>
      <figcaption>平台连接资源 · 机构开展诊疗</figcaption>
    </figure>
  );
}

export function BrandOverview({ full = false }: { full?: boolean }) {
  if (!full)
    return (
      <section
        className="brand-home-summary brand-home-story section-wrap"
        aria-labelledby="brand-home-title"
        data-ui-reveal
      >
        <div className="brand-home-story-copy">
          <p className="editorial-label">认识汇医盟</p>
          <h2 id="brand-home-title">
            从一间医馆，
            <br />
            <em>走向更多连接。</em>
          </h2>
          <p>
            从汇医堂的医馆实践出发，我们把内容、数字工具与机构协作接起来，协助医馆，也让日常了解与到访更方便。
          </p>
          <a className="editorial-link" href={aboutHref}>
            读一读品牌故事
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="brand-home-story-visual">
          <div className="brand-origin-line">
            <span>
              <Building2 size={24} strokeWidth={1.3} aria-hidden="true" />
              <b>汇医堂</b>
              <small>医馆实践</small>
            </span>
            <i aria-hidden="true" />
            <span>
              <Leaf size={24} strokeWidth={1.3} aria-hidden="true" />
              <b>汇医盟</b>
              <small>健康科技 · 协作支持</small>
            </span>
          </div>
          <div className="brand-home-pillars">
            {connections.map(({ title, icon: Icon }) => (
              <span key={title}>
                <Icon size={18} strokeWidth={1.4} aria-hidden="true" />
                {title}
              </span>
            ))}
          </div>
          <p>医馆提供诊疗，平台做好连接。</p>
        </div>
      </section>
    );

  return (
    <section
      className="brand-overview brand-overview-full section-wrap"
      aria-labelledby="brand-overview-title"
      data-ui-reveal
    >
      <div className="brand-overview-copy">
        <span className="brand-origin">
          <MapPin size={13} aria-hidden="true" />
          广州 · 2025年6月成立
        </span>
        <h2 id="brand-overview-title">
          以中医为纽带，
          <br />
          把资源连接起来。
        </h2>
        <p>
          汇医盟从汇医堂的医馆实践发展而来。面对日常接诊之外的内容、预约与沟通需求，我们以健康科技公司的方式，协助医馆把这些环节衔接起来。
        </p>
        <p className="brand-origin-detail">
          汇医堂诊所主体于 2022 年成立；广州汇医盟健康科技有限公司于 2025
          年成立。医馆的实践是品牌发展的起点，诊疗仍由具体接诊机构与医务人员开展。
        </p>
        <p className="brand-company-name">广州汇医盟健康科技有限公司</p>
      </div>
      <BrandNetwork />
      <div className="brand-origin-chapters">
        <article>
          <span>01 · 医馆实践</span>
          <h3>从真实到访中，理解需求。</h3>
          <p>
            从汇医堂日常服务的实践出发，关注大家如何了解医馆、确认预约和准备到访。
          </p>
        </article>
        <article>
          <span>02 · 科技协助</span>
          <h3>把信息与工具，衔接到门店。</h3>
          <p>
            用品牌内容、网站与小程序支持信息查询和联系，让医馆与来访者沟通得更清楚。
          </p>
        </article>
        <article>
          <span>03 · 机构协作</span>
          <h3>让更多医馆，有自己的入口。</h3>
          <p>
            围绕各医馆的实际安排整理资料与预约方式，保留每家机构的专业服务和联系渠道。
          </p>
        </article>
      </div>
    </section>
  );
}

type ClinicPreview = {
  id: string;
  name: string;
  area: string;
  shortAddress: string;
  image?: string;
  imageAlt?: string;
  appointmentAvailable: boolean;
  addressNeedsConfirmation?: boolean;
};

export function ClinicShowcase({ clinics }: { clinics: ClinicPreview[] }) {
  return (
    <section
      className="home-clinic-showcase section-wrap"
      aria-labelledby="home-clinic-title"
      data-ui-reveal
    >
      <div className="editorial-heading">
        <div>
          <p className="editorial-label">广州医馆</p>
          <h2 id="home-clinic-title">找到身边的医馆。</h2>
        </div>
        <a className="editorial-link" href={clinicsHref}>
          全部医馆
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <p className="editorial-description">
        收录 {clinics.length} 家 · 天河 / 荔湾
      </p>
      <div className="home-clinic-grid">
        {clinics.map((clinic) => (
          <a
            href={clinicDetailHref(clinic.id)}
            key={clinic.id}
            className="home-clinic-card"
          >
            <div className="home-clinic-photo">
              {clinic.image ? (
                <img
                  src={clinic.image}
                  alt={clinic.imageAlt ?? clinic.name}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={400}
                />
              ) : (
                <div className="home-clinic-placeholder">
                  <Building2 size={35} strokeWidth={1} aria-hidden="true" />
                  <span>门店实景待补充</span>
                </div>
              )}
              <span className="home-clinic-area">{clinic.area}</span>
            </div>
            <div className="home-clinic-copy">
              <h3>{clinic.name}</h3>
              <p>{clinic.shortAddress}</p>
              <span>
                {clinic.addressNeedsConfirmation
                  ? '地址请电话确认'
                  : '查看医馆详情'}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function HomeVisitPreview() {
  return (
    <section
      className="home-visit-preview section-wrap"
      aria-labelledby="home-visit-title"
      data-ui-reveal
    >
      <a href={visitGuideHref}>
        <span className="visit-preview-icon">
          <Compass size={25} strokeWidth={1.4} aria-hidden="true" />
        </span>
        <div>
          <h2 id="home-visit-title">到访指南</h2>
          <p>预约、资料和地址，出发前确认。</p>
        </div>
        <ArrowUpRight size={20} aria-hidden="true" />
      </a>
    </section>
  );
}

export function BrandSubnav({
  active,
}: {
  active: 'about' | 'values' | 'contact';
}) {
  return (
    <nav className="brand-subnav section-wrap" aria-label="品牌栏目">
      <a
        href={aboutHref}
        aria-current={active === 'about' ? 'page' : undefined}
      >
        品牌介绍
      </a>
      <a
        href={valuesHref}
        aria-current={active === 'values' ? 'page' : undefined}
      >
        我们的理念
      </a>
      <a
        href={contactHref}
        aria-current={active === 'contact' ? 'page' : undefined}
      >
        联系汇医盟
      </a>
    </nav>
  );
}

const offerings = [
  {
    title: '医馆协作',
    copy: '整理机构信息，支持医馆沟通与资源协作。',
    href: contactHref,
    action: '机构联系',
    icon: Handshake,
  },
  {
    title: '品牌内容',
    copy: '以真实门店与日常科普，建设品牌内容。',
    href: wellnessIndexHref,
    action: '阅读养生指南',
    icon: BookOpenText,
  },
  {
    title: '数字服务',
    copy: '通过网站与小程序，连接查询、联系和预约。',
    href: appointmentHref,
    action: '查看医馆预约',
    icon: MonitorSmartphone,
  },
];

export function BrandServices() {
  return (
    <>
      <section
        className="brand-services section-wrap"
        aria-labelledby="brand-services-title"
        data-ui-reveal
      >
        <p className="editorial-label">我们做什么</p>
        <h2 id="brand-services-title">让资源与需求相遇。</h2>
        <div className="brand-service-list">
          {offerings.map(({ title, copy, href, action, icon: Icon }) => (
            <article key={title}>
              <span className="brand-card-icon">
                <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <a className="editorial-link" href={href}>
                {action}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>
      <section
        className="brand-directions section-wrap"
        aria-label="发展方向"
        data-ui-reveal
      >
        <details>
          <summary>
            <span>
              <small>发展方向</small>
              <strong>从医馆协作，走向更多连接。</strong>
            </span>
            <ChevronDown size={19} aria-hidden="true" />
          </summary>
          <div className="brand-directions-content">
            <p>后续规划围绕三个方向展开，按项目实际进展逐步推进。</p>
            <ul>
              <li>
                <Building2 size={20} aria-hidden="true" />
                <span>健康产业共建</span>
              </li>
              <li>
                <Leaf size={20} aria-hidden="true" />
                <span>健康产品开发</span>
              </li>
              <li>
                <UserRound size={20} aria-hidden="true" />
                <span>中医人才交流与培养</span>
              </li>
            </ul>
            <span className="brand-plan-label">
              规划方向 · 具体项目以实际进展为准
            </span>
          </div>
        </details>
      </section>
    </>
  );
}

const values = [
  {
    title: '专业为本',
    copy: '诊疗由具备资质的机构与医务人员开展，平台做好信息与资源连接。',
    icon: ShieldCheck,
  },
  {
    title: '尊重选择',
    copy: '先了解医馆，再确认预约。具体安排由你与相应医馆沟通确认。',
    icon: Compass,
  },
  {
    title: '协作同行',
    copy: '把内容、数字工具与门店衔接好，让到访准备与后续联系更清楚。',
    icon: Handshake,
  },
];

export function BrandValues() {
  return (
    <>
      <section
        className="brand-values section-wrap"
        aria-labelledby="brand-values-title"
        data-ui-reveal
      >
        <div className="brand-values-heading">
          <p className="editorial-label">我们的理念</p>
          <h2 id="brand-values-title">
            专业为本，
            <br />
            <em>协作同行。</em>
          </h2>
          <p>让专业、选择与协作，体现在每一次服务连接中。</p>
        </div>
        <div className="brand-values-list">
          {values.map(({ title, copy, icon: Icon }) => (
            <article key={title}>
              <span className="brand-card-icon">
                <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section
        className="brand-journey section-wrap"
        aria-labelledby="brand-journey-title"
        data-ui-reveal
      >
        <h2 id="brand-journey-title">一次到访，从了解开始。</h2>
        <ol>
          <li>
            <Search size={24} strokeWidth={1.5} aria-hidden="true" />
            <strong>了解</strong>
            <span>查看医馆信息</span>
          </li>
          <li>
            <PhoneCall size={24} strokeWidth={1.5} aria-hidden="true" />
            <strong>联系</strong>
            <span>确认接诊安排</span>
          </li>
          <li>
            <MapPin size={24} strokeWidth={1.5} aria-hidden="true" />
            <strong>到访</strong>
            <span>带好所需资料</span>
          </li>
        </ol>
        <a className="editorial-link" href={visitGuideHref}>
          查看到访指南
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}

export function BrandContact({ phone }: { phone: string }) {
  return (
    <section
      className="brand-contact section-wrap"
      aria-labelledby="brand-contact-title"
      data-ui-reveal
    >
      <div className="brand-contact-main">
        <p className="editorial-label">机构合作 · 资料更新</p>
        <h2 id="brand-contact-title">联系汇医盟</h2>
        <p>医馆协作、信息更正与预约入口更新，可电话联系。</p>
        <a className="brand-contact-phone" href={`tel:${phone}`}>
          <PhoneCall size={22} strokeWidth={1.5} aria-hidden="true" />
          <span>
            <small>机构联系</small>
            {phone}
          </span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>
        <p className="brand-contact-note">就诊、费用与改期，请联系对应医馆。</p>
        <a className="editorial-link" href={clinicsHref}>
          各医馆联系方式
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <aside className="brand-contact-prepare">
        <h3>准备这三项，就够了。</h3>
        <ul>
          <li>
            <Building2 size={20} aria-hidden="true" />
            <span>
              <strong>机构名称</strong>
              <small>所在区域与完整地址</small>
            </span>
          </li>
          <li>
            <PhoneCall size={20} aria-hidden="true" />
            <span>
              <strong>联系信息</strong>
              <small>对外电话与预约方式</small>
            </span>
          </li>
          <li>
            <BookOpenText size={20} aria-hidden="true" />
            <span>
              <strong>更新内容</strong>
              <small>需更正的资料或授权图片</small>
            </span>
          </li>
        </ul>
        <p>请准备机构公开资料。</p>
      </aside>
    </section>
  );
}

export function BrandFooterLinks() {
  return (
    <nav className="brand-footer-links" aria-label="品牌与帮助">
      <a href={cooperationHref}>医馆合作</a>
      <a href={doctorsHref}>医生资料状态</a>
      <a href={aboutHref}>品牌介绍</a>
      <a href={valuesHref}>我们的理念</a>
      <a href={contactHref}>联系汇医盟</a>
      <a href={visitGuideHref}>到访指南</a>
    </nav>
  );
}
