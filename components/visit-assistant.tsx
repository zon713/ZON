'use client';

/* eslint-disable next/no-html-link-for-pages -- COS static document routes. */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MessageCircle, Send, X } from 'lucide-react';
import { clinicsHref } from '@/lib/site-links';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const answers = [
  { title: '怎样确认预约成功？', short: '预约成功', keywords: ['预约', '成功', '挂号', '小程序', '医生', '医师', '坐诊'], answer: '打开小程序或看到二维码，只是进入预约入口。请以小程序内的预约结果或医馆确认信息为准。汇医堂保留原网站微信预约入口，当前可用性待医馆复核；无法打开请电话确认。其他医馆可通过本馆电话咨询。' },
  { title: '同一部手机怎么识别二维码？', short: '识别二维码', keywords: ['二维码', '扫码', '识别', '微信', '同一', '手机', '保存'], answer: '在微信内可尝试长按完整小程序码识别。普通浏览器中，先长按保存图片或截取完整码，再打开微信“扫一扫”，从相册选择图片。识别失败时，请联系相应医馆。' },
  { title: '到馆需要带什么？', short: '到馆资料', keywords: ['准备', '带什么', '资料', '证件', '病历', '报告', '直接', '到馆'], answer: '先联系医馆确认当天接诊及预约要求。按医馆要求准备证件、预约信息、已有检查报告、既往病历和正在使用的药物清单；也可以记下不适出现的时间和想问医生的问题。' },
  { title: '改期、取消或费用找谁？', short: '改期与费用', keywords: ['改期', '取消', '费用', '收费', '价格', '退款', '多少钱'], answer: '请通过原预约渠道或对应医馆电话咨询。费用、改期与取消规则由具体医馆确认，本页不统一收费或办理预约变更。' },
  { title: '不开定位，怎样找地址？', short: '地址与定位', keywords: ['地址', '路线', '定位', '导航', '怎么去', '位置', '岭海'], answer: '可以在医馆页按区域筛选，或输入医馆名称、地址搜索，无需开启定位。距离为估算直线距离，实际路线以地图为准。岭海资料含两个地址，出发前请电话确认本次接诊地点。' },
];
type Message = { role: 'guide' | 'visitor'; text: string };
const greeting = '你好，我是到访小助手。可以帮你查阅预约、二维码、资料和地址说明。选一个问题，或输入你想了解的事项。';

export function VisitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'guide', text: greeting }]);
  const [input, setInput] = useState('');
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'auto' }); }, [messages, open]);
  function ask(text: string, known?: string) {
    const question = text.trim(); if (!question) return;
    const medical = /症状|诊断|处方|吃什么药|怎么用药|用药建议|疼|痛|发烧|发热|难受|失眠|麻木|治病|治疗|中药/;
    const privateData = /\d{7,}|我的(?:住址|姓名|电话)(?:是|[:：])/;
    const answer = privateData.test(question) ? '这里无需填写手机号、证件号或个人病历。请直接通过医馆的公开联系方式沟通预约事项。' : medical.test(question) ? '这里只提供到访和预约说明，不能判断症状或给出用药建议。身体不适请联系正规医疗机构；如遇急症，请拨打 120 或前往医院急诊。' : known ?? answers.map((item) => ({ ...item, score: item.keywords.filter((word) => question.includes(word)).length })).sort((a, b) => b.score - a.score).find((item) => item.score > 0)?.answer ?? '这项信息需要由具体医馆确认。你可以进入“各医馆联系方式”，联系要到访的医馆。这里也可以继续查阅预约、二维码、资料、地址或改期说明。';
    setMessages((previous) => [...previous.slice(-11), { role: 'visitor', text: privateData.test(question) ? '个人资料问题（内容不显示）' : question }, { role: 'guide', text: answer }]); setInput('');
  }
  return <>
    <button type="button" className="visit-assistant-launch" aria-haspopup="dialog" onClick={() => setOpen(true)}><span className="visit-assistant-icon"><MessageCircle size={27} strokeWidth={1.5} aria-hidden="true" /></span><span><strong>到访小助手</strong><small>预约、资料、路线，点这里问一问。</small></span><ArrowUpRight size={21} aria-hidden="true" /></button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="visit-chat-dialog" showCloseButton={false}>
      <header className="visit-chat-header"><span className="visit-chat-mark"><MessageCircle size={23} aria-hidden="true" /></span><div><DialogTitle>到访小助手</DialogTitle><DialogDescription>自动查阅指南 · 不提供诊断</DialogDescription></div><DialogClose aria-label="关闭到访小助手" className="visit-chat-close"><X size={22} /></DialogClose></header>
      <div className="visit-chat-log" ref={log} role="log" aria-label="到访问答记录" aria-live="polite" aria-relevant="additions">{messages.map((message, index) => <div className={`visit-chat-message visit-chat-${message.role}`} key={`${index}-${message.text}`}><span>{message.role === 'guide' ? '小助手' : '你'}</span><p>{message.text}</p></div>)}</div>
      <div className="visit-chat-quick" aria-label="常见到访问题">{answers.map((item) => <button type="button" key={item.short} onClick={() => ask(item.title, item.answer)}>{item.short}</button>)}</div>
      <a className="visit-chat-contact" href={clinicsHref}>各医馆联系方式<ArrowUpRight size={15} aria-hidden="true" /></a>
      <form className="visit-chat-form" onSubmit={(event) => { event.preventDefault(); ask(input); }}><label className="sr-only" htmlFor="visit-chat-input">输入到访问题</label><input id="visit-chat-input" placeholder="例如：到馆需要带什么？" autoComplete="off" value={input} maxLength={140} onChange={(event) => setInput(event.target.value)} /><button type="submit" aria-label="发送到访问题" disabled={!input.trim()}><Send size={20} /></button></form>
      <p className="visit-chat-privacy">请勿填写个人病历、证件号或手机号。输入仅在当前页面处理，不上传、不保存。</p>
    </DialogContent></Dialog>
  </>;
}
