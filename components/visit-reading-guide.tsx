'use client';

/* eslint-disable next/no-html-link-for-pages -- COS static document routes. */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { ArrowUpRight, BookOpenText, Check, ChevronLeft, ChevronRight, ClipboardList, Compass, MapPin } from 'lucide-react';
import { appointmentHref, wellnessIndexHref, clinicsHref } from '@/lib/site-links';
import { VisitAssistant } from './visit-assistant';

const pages = [
  { label: '封面', title: '一次从容的到访，\n从这里开始。', description: '把预约、出发与后续联系安排清楚。翻一页，了解一个阶段。', items: ['预约前，确认医馆与接诊安排', '出发前，整理资料与路线', '到馆后，沟通情况并记好医嘱'], icon: BookOpenText, href: appointmentHref, action: '查看医馆预约' },
  { label: '预约前', title: '先问清楚，\n再安排时间。', description: '不同医馆的接诊安排可能不同。确认具体信息后，再选择到访时间。', items: ['确认所需科目、医师与坐诊时段', '问清预约方式、收费项目与结算方式', '以小程序结果或医馆确认为准'], icon: Compass, href: appointmentHref, action: '选择预约医馆' },
  { label: '出发前', title: '资料和路线，\n提前整理好。', description: '留一点准备时间，出发时更从容。', items: ['核对完整地址，岭海接诊地点请电话确认', '按医馆要求准备证件、预约信息及已有报告', '带上既往病历和正在使用的药物清单'], icon: MapPin, href: clinicsHref, action: '核对医馆与地址' },
  { label: '到馆时', title: '把近期情况，\n清楚地说出来。', description: '提前记下问题，能帮助你在面诊时把情况说清楚。', items: ['按医馆安排完成到访登记', '说明不适出现时间、变化和相关用药', '把想问医生的问题记下来，逐项确认'], icon: ClipboardList, href: clinicsHref, action: '查看医馆联系方式' },
  { label: '离馆后', title: '记好医嘱，\n有疑问及时联系。', description: '后续安排以接诊医师与对应医馆的说明为准。', items: ['保存医嘱、检查资料和复诊安排', '用药与调整方案遵循接诊医师指导', '需要改期、咨询或了解费用时，联系原医馆'], icon: Check, href: wellnessIndexHref, action: '阅读日常养护知识' },
];

function BookPage({ index }: { index: number }) {
  const page = pages[index]; const Icon = page.icon;
  return <><div className="guide-book-page-top"><span>汇医盟 · 到访手册</span><span>{index === 0 ? '序' : `0${index}`}</span></div><div className="guide-book-emblem"><Icon size={38} strokeWidth={1.1} aria-hidden="true" /></div><span className="guide-book-label">{page.label}</span><h3>{page.title.split('\n').map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</h3><p className="guide-book-description">{page.description}</p><ul>{page.items.map((item, i) => <li key={item}><span>0{i + 1}</span>{item}</li>)}</ul><a href={page.href}>{page.action}<ArrowUpRight size={16} aria-hidden="true" /></a><span className="guide-book-folio">{index + 1} / {pages.length}</span></>;
}

export function VisitReadingGuide() {
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState('next');
  const touch = useRef<{ x: number; y: number } | null>(null);
  const book = useRef<HTMLDivElement>(null);
  useEffect(() => { if (previous === null) return; const timer = window.setTimeout(() => setPrevious(null), 560); return () => window.clearTimeout(timer); }, [selected, previous]);
  function turn(next: number) { if (next < 0 || next >= pages.length || next === selected) return; if (book.current && book.current.getBoundingClientRect().top < 165) book.current.scrollIntoView({ block: 'start', behavior: 'auto' }); setDirection(next > selected ? 'next' : 'previous'); setPrevious(selected); setSelected(next); }
  function keys(event: KeyboardEvent<HTMLDivElement>) { const next = event.key === 'ArrowRight' ? selected + 1 : event.key === 'ArrowLeft' ? selected - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? pages.length - 1 : null; if (next !== null) { event.preventDefault(); turn(next); } }
  function swipe(event: TouchEvent<HTMLDivElement>) { if (!touch.current) return; const dx = event.changedTouches[0].clientX - touch.current.x; const dy = event.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 48 && Math.abs(dy) < Math.abs(dx) * .6) turn(selected + (dx < 0 ? 1 : -1)); touch.current = null; }
  return <section id="appointment-guide" className="section-wrap visit-guide guide-book-section" aria-labelledby="appointment-guide-title" data-ui-reveal>
    <div className="guide-book-heading"><div><p className="editorial-label">随身阅读 · 到访手册</p><h2 id="appointment-guide-title">一页一页，安排好到访。</h2></div><span><BookOpenText size={17} aria-hidden="true" />向左轻划，翻到下一页</span></div>
    <div className="guide-book-controls"><button type="button" onClick={() => turn(selected - 1)} disabled={selected === 0}><ChevronLeft size={19} aria-hidden="true" />上一页</button><span aria-live="polite">{pages[selected].label} · {selected + 1} / {pages.length}</span><button type="button" onClick={() => turn(selected + 1)} disabled={selected === pages.length - 1}>下一页<ChevronRight size={19} aria-hidden="true" /></button></div>
    <div className="guide-book-layout"><nav className="guide-book-index" aria-label="到访手册目录">{pages.map((page, index) => <button key={page.label} type="button" aria-current={selected === index ? 'step' : undefined} onClick={() => turn(index)}><span>0{index + 1}</span>{page.label}</button>)}</nav><div ref={book} className="guide-book" role="region" aria-label="可翻页的到访手册" tabIndex={0} onKeyDown={keys} onTouchStart={(event) => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={swipe}>
      <div className="guide-book-page" key={selected} data-cover={selected === 0}><BookPage index={selected} /></div>
      {previous !== null && <div className="guide-book-page guide-book-turning" aria-hidden="true" inert data-direction={direction} data-cover={previous === 0} key={`${previous}-${selected}`}><BookPage index={previous} /></div>}
    </div></div>
    <VisitAssistant /><p className="brand-visit-note">具体接诊、预约与费用，以相应医馆的确认为准。</p>
  </section>;
}
