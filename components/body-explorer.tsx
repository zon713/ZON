'use client';

import { useEffect, useRef, useState } from 'react';
import {
  bodyRegions,
  verifiedBodyServices,
  type BodyRegionId,
} from '../lib/body-regions';
import type { mountBodyScene } from './body-scene';
import './body-explorer.css';

type Scene = ReturnType<typeof mountBodyScene>;
export function BodyExplorer({ onAppointment }: { onAppointment: () => void }) {
  const [selected, setSelected] = useState<BodyRegionId>('back');
  const [mode, setMode] = useState<'idle' | 'loading' | 'ready' | 'fallback'>(
    'idle',
  );
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const selection = useRef(selected);
  useEffect(() => {
    selection.current = selected;
    scene.current?.choose(selected);
  }, [selected]);
  useEffect(() => {
    if (mode !== 'loading') return;
    let cancelled = false;
    import('./body-scene')
      .then(({ mountBodyScene: mount }) => {
        if (cancelled || !host.current) return;
        try {
          scene.current = mount(host.current, setSelected, () => {
            scene.current?.dispose();
            scene.current = null;
            setMode('fallback');
          });
          scene.current.turn(
            selection.current === 'back' || selection.current === 'waist',
          );
          scene.current.choose(selection.current);
          setMode('ready');
        } catch {
          scene.current?.dispose();
          scene.current = null;
          setMode('fallback');
        }
      })
      .catch(() => {
        if (!cancelled) setMode('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);
  useEffect(
    () => () => {
      scene.current?.dispose();
    },
    [],
  );
  const region = bodyRegions.find((item) => item.id === selected)!;
  const services = verifiedBodyServices[selected] ?? [];
  return (
    <section
      className="body-explorer section-wrap"
      aria-labelledby="body-title"
    >
      <div className="body-heading">
        <div>
          <p className="section-eyebrow">EXPLORE & CONNECT / 从部位开始了解</p>
          <h2 id="body-title">转一转，找到你想咨询的部位</h2>
        </div>
        <p>选择部位仅帮助浏览服务信息，不能用于诊断。</p>
      </div>
      <div className="body-layout">
        <div className="body-view">
          <div className="body-view-label">
            <span>3D 身体导览</span>
            <span>原创示意人形 · 非解剖模型</span>
          </div>
          <div ref={host} className="body-canvas">
            {mode === 'idle' && (
              <div className="body-start">
                <div className="body-outline" aria-hidden="true">
                  ◯<br />
                  ╱│╲
                  <br />╱ ╲
                </div>
                <h3>认识部位，从容预约</h3>
                <p>按需加载 3D，或直接选择下方部位</p>
                <button type="button" onClick={() => setMode('loading')}>
                  开启 3D 身体导览
                </button>
              </div>
            )}
            {mode === 'loading' && (
              <output className="body-status">正在加载身体导览…</output>
            )}
            {mode === 'fallback' && (
              <output className="body-status">
                文字部位导览：请使用下方按钮选择部位。3D
                无法加载或设备运行缓慢时，也可在这里继续。
              </output>
            )}
          </div>
          {mode === 'ready' && (
            <div className="body-controls">
              <button type="button" onClick={() => scene.current?.turn(false)}>
                正面
              </button>
              <button type="button" onClick={() => scene.current?.turn(true)}>
                背面
              </button>
              <button
                type="button"
                onClick={() => {
                  scene.current?.dispose();
                  scene.current = null;
                  setMode('fallback');
                }}
              >
                切换文字模式
              </button>
              <p>左右拖动旋转 · 点击绿色部位点</p>
            </div>
          )}
          <div className="body-region-list" aria-label="选择身体部位">
            {bodyRegions.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected === item.id}
                onClick={() => {
                  setSelected(item.id);
                  scene.current?.turn(
                    item.id === 'back' || item.id === 'waist',
                  );
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="body-result" aria-live="polite" aria-atomic="true">
          <p className="body-selection">当前选择</p>
          <h3>
            {region.label}
            <span>服务咨询</span>
          </h3>
          {services.length ? (
            services.map((service) => (
              <article key={service.clinicId}>
                <h4>{service.service}</h4>
                <p>资料来源：{service.source}</p>
                {service.doctors.length ? (
                  service.doctors.map((doctor) => (
                    <p key={doctor.name}>
                      {doctor.name} · {doctor.specialty}
                    </p>
                  ))
                ) : (
                  <p>医师资料待完善，请在小程序查看医师。</p>
                )}
              </article>
            ))
          ) : (
            <p className="body-data-note">
              该部位的服务匹配与医师资料待完善。目前没有已核验的部位专属推荐，请先联系诊所确认是否提供相关服务。
            </p>
          )}
          <article className="body-clinic">
            <p className="body-clinic-tag">已有预约入口 · 服务范围待确认</p>
            <h4>汇医堂中医诊所</h4>
            <p>广州 · 天河区 · 中山大道中1098号</p>
            <div className="body-doctor">
              <strong>查看医师</strong>
              <p>
                本站暂无已核验的医师姓名、擅长与排班。具体医师及服务以小程序和诊所确认为准。
              </p>
            </div>
            <p className="body-time">进入小程序查看可约时间</p>
            <button type="button" className="body-book" onClick={onAppointment}>
              查看医师与预约 →
            </button>
            <a className="body-phone" href="tel:13178828419">
              电话确认服务：13178828419
            </a>
          </article>
          <p className="body-privacy">
            部位选择仅保留在本页面，不上传、不写入预约链接。预约入口为现有汇医堂小程序，具体医师和时间以小程序为准。
          </p>
        </div>
      </div>
    </section>
  );
}
