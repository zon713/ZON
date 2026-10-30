'use client';

import { ArrowLeft } from 'lucide-react';

export function SiteBack({ href }: { href: string }) {
  return <a className="site-back" href={href} aria-label="返回上一页" onClick={(event) => {
    const referrer = document.referrer;
    if (referrer && new URL(referrer).origin === window.location.origin && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  }}><ArrowLeft size={18} aria-hidden="true" /></a>;
}
