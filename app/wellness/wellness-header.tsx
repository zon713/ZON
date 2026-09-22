import Link from 'next/link';
import { ArrowLeft, BookOpenText } from 'lucide-react';

import { BrandMark } from '../brand-mark';

export function WellnessHeader({ backHref = '/' }: { backHref?: string }) {
  return (
    <header className="border-b border-white/10 bg-[#123d34] text-[#f8f1df]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            aria-label="返回"
            className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-[#f4e8c8] transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/" className="flex items-center gap-2.5" aria-label="汇医盟首页">
            <BrandMark />
            <span>
              <span className="block text-base font-bold tracking-[0.1em] text-white">汇医盟</span>
              <span className="block text-xs tracking-[0.08em] text-[#c6d7d0]">养生指南</span>
            </span>
          </Link>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.1em] text-[#d8e4dc] sm:text-sm">
          <BookOpenText className="size-4" aria-hidden="true" />
          健康科普
        </span>
      </div>
    </header>
  );
}
