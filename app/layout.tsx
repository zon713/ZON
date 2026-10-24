import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import './directory.css';
import './platform.css';
import './refinement.css';
import './experience.css';
import './brand-refinement.css';
import './body-symptoms.css';
import './mobile-brand.css';
import './mobile-interactions.css';
import './mobile-pages.css';
import './brand-content.css';
import './reading-experience.css';
import './revision.css';
import './header.css';
import './wechat-mobile.css';
import { UiMotion } from '@/components/ui-motion';
import { browserCompatibilityScript } from '@/lib/browser-compat';

export const metadata: Metadata = {
  title: '汇医盟｜广州医馆查询与预约方式',
  description:
    '按名称、地址或地区查找广州医馆，了解电话、导航与已有预约入口，出诊与营业安排请向医馆确认。',

  metadataBase: new URL('https://www.huiyimeng.com'),
  icons: {
    icon: '/huiyimeng-logo.jpg',
    apple: '/huiyimeng-logo.jpg',
  },
  openGraph: {
    title: '汇医盟｜广州医馆查询与预约方式',
    description: '按名称或地区查找广州医馆，核对本馆地址、电话与已有预约方式。',
    images: [{ url: '/og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '汇医盟｜广州医馆查询与预约方式',
    description: '按名称或地区查找广州医馆，核对本馆地址、电话与已有预约方式。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          id="huiyimeng-browser-compat"
          dangerouslySetInnerHTML={{ __html: browserCompatibilityScript }}
        />
      </head>
      <body>
        {children}
        <UiMotion />
        <script
          id="huiyimeng-static-capture"
          dangerouslySetInnerHTML={{
            __html: 'window.__HYM_BROWSER_COMPAT__.capture();',
          }}
        />
      </body>
    </html>
  );
}
