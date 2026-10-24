'use client';

/* eslint-disable next/no-html-link-for-pages -- Links target the static COS export. */
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { wellnessIndexHref, clinicsHref } from '@/lib/site-links';

const stages = [
  {
    label: '预约前',
    title: '先问清楚，再安排出发。',
    description: '不同医馆的接诊安排可能不同。确认具体信息后，再选择到访时间。',
    items: ['确认所需科目、医师与坐诊时段', '问清预约方式、收费项目与结算方式', '核对完整地址，以及是否需要携带资料'],
    href: clinicsHref,
    action: '查看医馆与联系方式',
  },
  {
    label: '到馆时',
    title: '把已有资料和近期情况带上。',
    description: '提前整理，能帮助你在面诊时把情况说清楚。',
    items: ['按医馆要求携带身份证件与预约信息', '带上已有检查报告、既往病历及正在使用的药物清单', '记下不适出现的时间、变化和想问医生的问题'],
    href: clinicsHref,
    action: '核对地址与到访信息',
  },
  {
    label: '离馆后',
    title: '记好医嘱，有疑问及时联系。',
    description: '后续安排以接诊医师与对应医馆的说明为准。',
    items: ['保存医嘱、检查资料和复诊安排', '用药与调整方案遵循接诊医师指导', '需要改期、咨询或了解费用时，联系原医馆'],
    href: wellnessIndexHref,
    action: '阅读日常养护知识',
  },
];

const questions = [
  {
    title: '怎样确认预约成功？',
    answer: '打开小程序或看到二维码，只是进入预约入口。请以小程序内的预约结果或医馆确认信息为准。汇医堂支持微信预约，其他医馆请通过门店电话确认。',
  },
  {
    title: '同一部手机，怎么识别预约二维码？',
    answer: '在微信内可尝试长按小程序码识别；普通浏览器中可长按保存图片，或截取包含完整码的屏幕，再打开微信「扫一扫」，从相册选择图片。若无法识别，可联系汇医堂咨询。',
  },
  {
    title: '可以直接到馆吗？需要提前准备什么？',
    answer: '请先联系对应医馆，确认当天坐诊、是否需要预约，以及所需资料。初次到访可整理已有检查报告、病历和正在使用的药物清单；是否需要证件或其他材料，以医馆要求为准。',
  },
  {
    title: '改期、取消或咨询费用，应该找谁？',
    answer: '请通过原预约渠道或对应医馆电话咨询。费用、改期与取消规则由具体医馆确认，本页不统一收费或办理预约变更。',
  },
  {
    title: '不想开启定位，也能查找医馆吗？',
    answer: '可以直接按区域筛选，或输入医馆名称、地址搜索。开启定位后展示的是估算直线距离；实际步行、驾车路程以地图导航为准。',
  },
];

export function VisitGuide() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stage = stages[selected];

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % stages.length;
    else if (event.key === 'ArrowLeft') next = (index + stages.length - 1) % stages.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = stages.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="appointment-guide" className="compact-information section-wrap visit-guide" aria-labelledby="appointment-guide-title" data-ui-reveal>
      <div className="ui-section-meta">
        <span><b className="brand-section-number">02</b> 到访指南</span>
        <span>从预约到离馆</span>
      </div>
      <h2 id="appointment-guide-title">第一次到馆，也能从容安排。</h2>
      <p className="visit-intro">按到访阶段，看看需要确认和准备的事。</p>
      <div className="visit-stage-tabs" role="tablist" aria-label="选择到访阶段">
        {stages.map((item, index) => (
          <button key={item.label} ref={(node) => { tabRefs.current[index] = node; }} type="button" role="tab" id={`visit-tab-${index}`} aria-controls="visit-panel" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => moveTab(event, index)}>
            <span>0{index + 1}</span>{item.label}
          </button>
        ))}
      </div>
      <div className="visit-stage-panel" role="tabpanel" id="visit-panel" aria-labelledby={`visit-tab-${selected}`} tabIndex={0} key={selected}>
        <div className="visit-panel-heading">
          <span className="visit-stage-label">{stage.label}</span>
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
        </div>
        <ul className="visit-preparation">
          {stage.items.map((item) => <li key={item}><Check size={16} aria-hidden="true" /><span>{item}</span></li>)}
        </ul>
        <a className="visit-context-link" href={stage.href}>{stage.action}<ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
      <div className="visit-faq-heading">
        <h3>你可能还想问</h3><span>预约 · 到访 · 联系</span>
      </div>
      <div className="visit-faq">
        {questions.map((question, index) => (
          <div className="visit-faq-item" key={question.title} data-expanded={expanded === index}>
            <h4><button type="button" aria-expanded={expanded === index} aria-controls={`visit-answer-${index}`} id={`visit-question-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}>{question.title}<ChevronDown size={18} aria-hidden="true" /></button></h4>
            <section id={`visit-answer-${index}`} className="visit-answer" aria-labelledby={`visit-question-${index}`} inert={expanded !== index}>
              <div><p>{question.answer}</p></div>
            </section>
          </div>
        ))}
      </div>
      <p className="brand-visit-note">本页帮助你整理到访信息。具体接诊、预约与费用，以相应医馆的确认为准。</p>
    </section>
  );
}
