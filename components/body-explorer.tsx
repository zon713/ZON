'use client';
/* eslint-disable next/no-img-element -- Existing local clinic photo in the static COS export. */
import { useEffect, useRef, useState } from 'react';
import {
  PersonStanding,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Phone,
  Rotate3d,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import {
  bodyRegions,
  verifiedBodyServices,
  type BodyRegionId,
} from '../lib/body-regions';
import type { mountBodyScene } from './body-scene';
import './body-explorer.css';
type Scene = Awaited<ReturnType<typeof mountBodyScene>>;
export function BodyExplorer({ onAppointment }: { onAppointment: () => void }) {
  const [selected, setSelected] = useState<BodyRegionId>('back');
  const [mode, setMode] = useState<'idle' | 'loading' | 'ready' | 'fallback'>(
    'idle',
  );
  const host = useRef<HTMLDivElement>(null),
    scene = useRef<Scene | null>(null),
    selection = useRef(selected);
  useEffect(() => {
    selection.current = selected;
    scene.current?.choose(selected);
  }, [selected]);
  useEffect(() => {
    if (mode !== 'loading') return;
    const controller = new AbortController();
    let cancelled = false;
    import('./body-scene')
      .then(async ({ mountBodyScene: mount }) => {
        if (cancelled || !host.current) return;
        const instance = await mount(
          host.current,
          setSelected,
          () => {
            scene.current?.dispose();
            scene.current = null;
            setMode('fallback');
          },
          controller.signal,
        );
        if (cancelled) {
          instance.dispose();
          return;
        }
        scene.current = instance;
        instance.choose(selection.current);
        instance.turn(
          selection.current === 'back' || selection.current === 'waist',
        );
        setMode('ready');
      })
      .catch(() => {
        if (!cancelled) {
          scene.current?.dispose();
          scene.current = null;
          setMode('fallback');
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
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
          <p className="section-eyebrow">BODY GUIDE / 身体导览</p>
          <h2 id="body-title">从一个部位，开始了解。</h2>
        </div>
        <p>
          轻转身体，选择你想咨询的部位。
          <br />
          服务咨询，不代替医生诊断。
        </p>
      </div>
      <div className="body-layout">
        <div className="body-view">
          <div className="body-view-label">
            <span>
              <i /> 01 · 选择部位
            </span>
            <span>360° 身体导览</span>
          </div>
          <div ref={host} className="body-canvas">
            {mode === 'idle' && (
              <div className="body-start">
                <div className="body-start-symbol">
                  <PersonStanding
                    size={68}
                    strokeWidth={0.8}
                    aria-hidden="true"
                  />
                </div>
                <h3>转动身体，点选部位</h3>
                <p>也可使用下方文字选择</p>
                <button type="button" onClick={() => setMode('loading')}>
                  <Rotate3d size={17} aria-hidden="true" /> 开启 3D 导览
                </button>
                <small>按需加载 · 原创人体示意</small>
              </div>
            )}
            {mode === 'loading' && (
              <output className="body-status">
                <span className="body-loading-ring" aria-hidden="true" />
                正在准备身体导览
              </output>
            )}
            {mode === 'fallback' && (
              <div className="body-start">
                <PersonStanding size={52} strokeWidth={1} aria-hidden="true" />
                <h3>文字部位导览</h3>
                <p>使用下方按钮，同样可以继续了解服务。</p>
                <button type="button" onClick={() => setMode('loading')}>
                  重新加载 3D
                </button>
              </div>
            )}
          </div>
          {mode === 'ready' && (
            <div className="body-controls">
              <div className="body-face-switch">
                <button
                  type="button"
                  onClick={() => scene.current?.turn(false)}
                >
                  正面
                </button>
                <button type="button" onClick={() => scene.current?.turn(true)}>
                  背面
                </button>
              </div>
              <button
                type="button"
                className="body-text-mode"
                onClick={() => {
                  scene.current?.dispose();
                  scene.current = null;
                  setMode('fallback');
                }}
              >
                文字模式
              </button>
              <p>
                <Rotate3d size={14} aria-hidden="true" /> 左右拖动旋转 ·
                轻点部位选择
              </p>
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
          <p className="body-model-note">人体示意 · 非诊断工具</p>
        </div>
        <div className="body-result">
          <p className="body-selection">02 · 了解服务与预约</p>
          <div
            className="body-selected-title"
            aria-live="polite"
            aria-atomic="true"
          >
            <h3>{region.label}</h3>
            <span>已选择的部位</span>
          </div>
          {services.length ? (
            services.map((service) => (
              <article className="body-verified-service" key={service.clinicId}>
                <h4>{service.service}</h4>
                {service.doctors.map((doctor) => (
                  <p key={doctor.name}>
                    {doctor.name} · {doctor.specialty}
                  </p>
                ))}
              </article>
            ))
          ) : (
            <p className="body-data-note">
              该部位的服务与医师资料尚待确认，请先向诊所咨询。
            </p>
          )}
          <article className="body-clinic">
            <div className="body-clinic-top">
              <div>
                <p className="body-clinic-tag">可联系的诊所</p>
                <h4>汇医堂中医诊所</h4>
                <p className="body-clinic-area">广州 · 天河区</p>
              </div>
              <img
                src="/huiyitang-clinic.jpg"
                alt="汇医堂中医诊所门店实景"
                width={76}
                height={76}
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="body-clinic-address">
              <MapPin size={15} aria-hidden="true" />
              <span>中山大道中1098号</span>
            </p>
            <div className="body-service-status">
              <span />
              部位服务范围，请先电话确认
            </div>
            <div className="body-info-row">
              <Stethoscope size={18} aria-hidden="true" />
              <div>
                <strong>医师信息</strong>
                <span>具体医师与擅长以小程序为准</span>
              </div>
            </div>
            <div className="body-info-row">
              <CalendarDays size={18} aria-hidden="true" />
              <div>
                <strong>可约时间</strong>
                <span>进入小程序查看可约时间</span>
              </div>
            </div>
            <button type="button" className="body-book" onClick={onAppointment}>
              <span>查看医师与预约</span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </button>
            <a className="body-phone" href="tel:13178828419">
              <Phone size={14} aria-hidden="true" />
              <span>电话咨询</span>
              <strong>13178828419</strong>
            </a>
          </article>
          <div className="body-trust">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>部位选择仅在本页使用，不上传。</span>
          </div>
          <details className="body-booking-note">
            <summary>预约须知</summary>
            <p>
              本站暂无已核验的部位专属推荐、医师名册与实时号源。预约进入现有汇医堂小程序，具体服务、医师和时间请以小程序及诊所确认为准。
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
