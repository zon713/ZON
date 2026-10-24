/* eslint-disable next/no-html-link-for-pages -- Native document links are required for the COS .html routes and cross-document transitions. */
import { ChevronRight } from 'lucide-react';
import { clinicsHref } from '@/lib/site-links';

const intros = {
  body: ['人体导览', '了解部位，再整理想问医生的问题。', '身体部位 · 日常参考'],
  clinics: ['广州医馆', '按区域或名称查找，出发前先确认接诊安排。', '天河 · 荔湾 / 四家医馆'],
  visit: ['到访指南', '从预约到离馆，把需要确认的事安排清楚。', '预约 · 准备 · 联系'],
  about: ['关于汇医盟', '中医资源连接 · 品牌内容 · 数字服务', '品牌介绍 · 广州'],
  values: ['我们的理念', '专业 · 选择 · 协作', '汇医盟 · 品牌理念'],
  contact: ['联系汇医盟', '机构合作与资料更新', '汇医盟 · 机构联系'],
  appointment: ['医馆预约', '选择医馆，查看对应的预约与联系入口。', '选择医馆 · 确认到访'],
  clinic: ['', '地址、联系方式与到访安排，都在这里。', '医馆详情 · 广州'],
};

export function PageIntro({ view, clinicName }: { view: keyof typeof intros; clinicName?: string }) {
  const [title, description, label] = intros[view];
  return (
    <header className="route-intro section-wrap" id="page-content" tabIndex={-1}>
      <nav className="route-breadcrumb" aria-label="当前位置">
        <a href="/">首页</a><ChevronRight size={12} aria-hidden="true" />
        {view === 'clinic' && <><a href={clinicsHref}>广州医馆</a><ChevronRight size={12} aria-hidden="true" /></>}
        <span aria-current="page">{clinicName ?? title}</span>
      </nav>
      <p className="route-eyebrow">{label}</p>
      <h1>{clinicName ?? title}</h1>
      <p className="route-description">{description}</p>
    </header>
  );
}
