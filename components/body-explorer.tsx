'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, PersonStanding, X } from 'lucide-react';
import {
  bodyRegions,
  verifiedBodyServices,
  type BodyRegionId,
} from '../lib/body-regions';
import { clinicsHref } from '../lib/site-links';
import type { mountBodyScene } from './body-scene';
import './body-explorer.css';

type Scene = Awaited<ReturnType<typeof mountBodyScene>>;
// Retain the old props so existing callers remain compatible. A body selection
// must never turn a generic clinic appointment URL into a medical match.
export function BodyExplorer(_props: {
  appointmentUrl?: string;
  onAppointment?: (trigger: HTMLAnchorElement) => boolean;
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
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const result = useRef<HTMLElement>(null);
  const backFacing = useRef(false);
  function choose(id: BodyRegionId, trigger?: HTMLButtonElement) {
    selection.current = id;
    lastHotspot.current = id;
    lastTrigger.current =
      trigger ??
      host.current?.querySelector<HTMLButtonElement>(
        '[data-region="' + id + '"]',
      ) ??
      null;
    if (trigger) {
      backFacing.current =
        (bodyRegions.find((item) => item.id === id)?.position[2] ?? 0) < 0;
      scene.current?.turn(backFacing.current);
    }
    setLastSelected(id);
    setSelected(id);
  }
  const closeResult = useCallback(() => {
    selection.current = null;
    setSelected(null);
    const hotspot = host.current?.querySelector<HTMLButtonElement>(
      '[data-region="' + lastHotspot.current + '"]',
    );
    const trigger = lastTrigger.current;
    const target =
      trigger?.isConnected && !trigger.hidden
        ? trigger
        : hotspot && !hotspot.hidden
          ? hotspot
          : layout.current?.querySelector<HTMLButtonElement>(
              '.body-region-list button[aria-pressed="true"], .body-hotspot:not([hidden])',
            );
    target?.focus();
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
    if (selected) {
      result.current?.focus({ preventScroll: true });
      result.current?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    }
  }, [selected]);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let failed = false;
    let instance: Scene | null = null;
    function fail() {
      if (cancelled || failed) return;
      failed = true;
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
        if (cancelled || failed) {
          instance.dispose();
          return;
        }
        window.clearTimeout(timeout);
        scene.current = instance;
        instance.choose(selection.current);
        // choose()/turn() may synchronously fail and clear the current scene.
        // Preserve the retry state instead of marking a disposed scene ready.
        if (failed || scene.current !== instance) return;
        instance.turn(backFacing.current);
        if (!failed && scene.current === instance) setMode('ready');
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
  const verifiedServices = region
    ? (verifiedBodyServices[region.id] ?? [])
    : [];
  return (
    <section
      id="body-guide"
      className="body-explorer section-wrap"
      aria-labelledby="body-title"
    >
      <h2 id="body-title" className="sr-only">
        人体导览
      </h2>
      <p id="body-keyboard-help" className="sr-only">
        轻点身体部位查看资料收录状态，也可使用下方文字选择。左右拖动旋转，向上或向下滑动页面。键盘左右方向键切换正背面，Tab
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
                <output>可使用下方文字选择部位，或重试加载。</output>
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
              </div>
            )}
          </fieldset>
        </div>
        <section
          ref={result}
          className="body-result"
          id="body-result"
          aria-label="部位查询资料"
          tabIndex={-1}
          aria-hidden={selected === null}
          inert={selected === null}
        >
          {region && (
            <>
              <div className="body-result-heading">
                <h3
                  className="body-result-title"
                  aria-live="polite"
                  aria-atomic="true"
                >
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
              <div className="body-query-content">
                <output className="body-query-count" aria-live="polite">
                  {verifiedServices.length} 条已核实对应资料
                </output>
                <p className="body-query-description">
                  {verifiedServices.length === 0
                    ? `尚未收录经专业核查的“${region.label}—科目或服务”对应资料。`
                    : '可进入目录查看经核实的对应资料。'}
                </p>
                <p className="body-query-review">
                  部位与科目、服务的对应关系待专业审核。可直接按医馆名称、地区查询已收录资料。
                </p>
                <div className="body-query-actions">
                  <a
                    className="body-query-link"
                    href={clinicsHref + '?body=' + region.id}
                  >
                    查看该部位查询结果
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a href={clinicsHref}>查看全部地区医馆</a>
                  <button type="button" onClick={closeResult}>
                    重新选择部位
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
        <div className="body-text-controls">
          <div className="body-text-heading">
            <p>也可用文字选择部位</p>
            {mode === 'ready' && (
              <div className="body-turn-controls" aria-label="旋转人体模型">
                <button
                  type="button"
                  onClick={() => {
                    backFacing.current = false;
                    scene.current?.turn(false);
                  }}
                >
                  查看正面
                </button>
                <button
                  type="button"
                  onClick={() => {
                    backFacing.current = true;
                    scene.current?.turn(true);
                  }}
                >
                  查看背面
                </button>
              </div>
            )}
          </div>
          <fieldset className="body-region-list" aria-label="文字选择身体部位">
            {bodyRegions.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected === item.id}
                aria-controls="body-result"
                onClick={(event) => choose(item.id, event.currentTarget)}
              >
                {item.label}
              </button>
            ))}
          </fieldset>
        </div>
      </div>
    </section>
  );
}
