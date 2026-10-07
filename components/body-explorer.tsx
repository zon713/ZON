'use client';
/* eslint-disable next/no-img-element -- Optional official portrait is served with the static COS export. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PersonStanding, X } from 'lucide-react';
import { bodyRegions, type BodyRegionId } from '../lib/body-regions';
import { bodyGuideDoctor } from '../lib/body-guide-doctor';
import type { mountBodyScene } from './body-scene';
import './body-explorer.css';

type Scene = Awaited<ReturnType<typeof mountBodyScene>>;
export function BodyExplorer({
  appointmentUrl,
  onAppointment,
}: {
  appointmentUrl: string;
  onAppointment: (trigger: HTMLAnchorElement) => boolean;
}) {
  const [selected, setSelected] = useState<BodyRegionId | null>(null);
  // Retain outgoing content during the closing transition.
  const [lastSelected, setLastSelected] = useState<BodyRegionId | null>(null);
  const [mode, setMode] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLFieldSetElement>(null);
  const layout = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const selection = useRef<BodyRegionId | null>(null);
  const lastHotspot = useRef<BodyRegionId | null>(null);
  const backFacing = useRef(false);
  function choose(id: BodyRegionId) {
    selection.current = id;
    lastHotspot.current = id;
    setLastSelected(id);
    setSelected(id);
  }
  const closeResult = useCallback(() => {
    selection.current = null;
    setSelected(null);
    const hotspot = host.current?.querySelector<HTMLButtonElement>(
      '[data-region="' + lastHotspot.current + '"]',
    );
    const target =
      hotspot && !hotspot.hidden
        ? hotspot
        : host.current?.querySelector<HTMLButtonElement>(
            '.body-region-list button[aria-pressed="true"], .body-hotspot:not([hidden])',
          );
    target?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    function dismiss(event: KeyboardEvent) {
      if (
        event.key === 'Escape' &&
        selection.current &&
        event.target instanceof Node &&
        layout.current?.contains(event.target)
      ) {
        event.preventDefault();
        closeResult();
      } else if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        event.target instanceof Node &&
        host.current?.contains(event.target) &&
        scene.current
      ) {
        event.preventDefault();
        backFacing.current = !backFacing.current;
        scene.current.turn(backFacing.current);
      }
    }
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [closeResult]);
  useEffect(() => {
    scene.current?.choose(selected);
  }, [selected]);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let instance: Scene | null = null;
    function fail() {
      if (cancelled) return;
      window.clearTimeout(timeout);
      instance?.dispose();
      if (scene.current === instance) scene.current = null;
      setMode('fallback');
    }
    // Interrupted downloads must offer a recovery path.
    const timeout = window.setTimeout(() => {
      controller.abort();
      fail();
    }, 20000);
    import('./body-scene')
      .then(async ({ mountBodyScene: mount }) => {
        if (cancelled || !host.current) return;
        instance = await mount(host.current, choose, fail, controller.signal);
        if (cancelled) {
          instance.dispose();
          return;
        }
        window.clearTimeout(timeout);
        scene.current = instance;
        instance.choose(selection.current);
        instance.turn(backFacing.current);
        setMode('ready');
      })
      .catch(fail);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
      instance?.dispose();
      if (scene.current === instance) scene.current = null;
    };
  }, [attempt]);
  const region = bodyRegions.find((item) => item.id === lastSelected);
  return (
    <section
      id="body-guide"
      className="body-explorer section-wrap"
      aria-labelledby="body-title"
    >
      <div className="body-heading">
        <div>
          <p className="section-eyebrow">BODY GUIDE / 身体导览</p>
          <h2 id="body-title">从一个部位，开始了解。</h2>
        </div>
        <p>服务咨询，不代替医生诊断。</p>
      </div>
      <p id="body-keyboard-help" className="sr-only">
        轻点身体部位查看医馆与预约。左右拖动旋转，向上或向下滑动页面。键盘左右方向键切换正背面，Tab
        选择部位，Enter 确认，Esc 关闭结果。
      </p>
      <div
        ref={layout}
        className="body-layout"
        data-selected={selected !== null}
        data-mode={mode}
      >
        <div className="body-view">
          <fieldset
            ref={host}
            className="body-canvas"
            aria-label="3D 人体部位导览"
            aria-describedby="body-keyboard-help"
            aria-busy={mode === 'loading'}
          >
            {mode === 'loading' && (
              <output className="body-status" aria-live="polite">
                <span className="body-loading-ring" aria-hidden="true" />
                正在加载人体模型
              </output>
            )}
            {mode === 'fallback' && (
              <div className="body-fallback">
                <PersonStanding size={40} strokeWidth={1} aria-hidden="true" />
                <h3>3D 暂未加载</h3>
                <output>可选择部位继续查看，或重试加载。</output>
                <button
                  type="button"
                  className="body-retry"
                  onClick={() => {
                    setMode('loading');
                    setAttempt((value) => value + 1);
                  }}
                >
                  重新加载 3D
                </button>
                <div className="body-region-list" aria-label="选择身体部位">
                  {bodyRegions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected === item.id}
                      onClick={() => choose(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        </div>
        <section
          className="body-result"
          id="body-result"
          aria-label="医馆介绍与预约"
          aria-hidden={selected === null}
          inert={selected === null}
        >
          {region && (
            <>
              <div className="body-result-heading">
                <h3 className="sr-only" aria-live="polite" aria-atomic="true">
                  {region.label}
                </h3>
                <button
                  type="button"
                  className="body-close"
                  aria-label="关闭部位详情"
                  onClick={closeResult}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className="body-clinic-list">
                <article className="body-clinic">
                  <h4>{bodyGuideDoctor.clinicName}</h4>
                  <p className="body-clinic-address">
                    {bodyGuideDoctor.address}
                  </p>
                  <div className="body-doctor-entry">
                    {bodyGuideDoctor.portraitUrl ? (
                      <img
                        className="body-doctor-avatar"
                        src={bodyGuideDoctor.portraitUrl}
                        alt={bodyGuideDoctor.name + '医师'}
                        width={36}
                        height={36}
                      />
                    ) : (
                      <span className="body-doctor-avatar" aria-hidden="true">
                        刘
                      </span>
                    )}
                    <div>
                      <a
                        className="body-doctor-name"
                        href={bodyGuideDoctor.appointmentUrl ?? appointmentUrl}
                        aria-label={
                          bodyGuideDoctor.appointmentUrl
                            ? '预约' + bodyGuideDoctor.name + '医师'
                            : '打开汇医堂小程序，选择' +
                              bodyGuideDoctor.name +
                              '预约'
                        }
                        aria-describedby={
                          bodyGuideDoctor.appointmentUrl
                            ? undefined
                            : 'body-doctor-link-status'
                        }
                        onClick={(event) => {
                          if (
                            !bodyGuideDoctor.appointmentUrl &&
                            !onAppointment(event.currentTarget)
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        {bodyGuideDoctor.name}
                      </a>
                      {!bodyGuideDoctor.appointmentUrl && (
                        <p
                          className="body-doctor-link-status"
                          id="body-doctor-link-status"
                        >
                          小程序内选刘敬东
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
