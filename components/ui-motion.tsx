'use client';

import { useEffect } from 'react';

/** Progressive motion: content stays visible without JS or with reduced motion. */
export function UiMotion() {
  useEffect(() => {
    window.__HYM_BROWSER_COMPAT__?.ready();
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const revealed = new Set<Element>();
    const progress = document.querySelector<HTMLElement>('.ui-scroll-progress');

    function setupReveal() {
      observer?.disconnect();
      const sections =
        document.querySelectorAll<HTMLElement>('[data-ui-reveal]');
      sections.forEach((section) => section.classList.remove('ui-waiting'));
      if (preference.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove('ui-waiting');
            entry.target.classList.add('ui-arrived');
            revealed.add(entry.target);
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px 36px 0px' },
      );
      sections.forEach((section) => {
        if (revealed.has(section)) return;
        const bounds = section.getBoundingClientRect();
        if (bounds.top > window.innerHeight)
          section.classList.add('ui-waiting');
        observer?.observe(section);
      });
    }

    function renderScroll() {
      frame = 0;
      const distance =
        document.documentElement.scrollHeight - window.innerHeight;
      progress?.style.setProperty(
        '--reading-progress',
        String(distance > 0 ? window.scrollY / distance : 0),
      );
      document.documentElement.classList.toggle(
        'ui-scrolled',
        window.scrollY > 24,
      );
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(renderScroll);
    }
    setupReveal();
    renderScroll();
    preference.addEventListener('change', setupReveal);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      preference.removeEventListener('change', setupReveal);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.documentElement.classList.remove('ui-scrolled');
    };
  }, []);
  return <div className="ui-scroll-progress" aria-hidden="true" />;
}
