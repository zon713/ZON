import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import './directory.css';
import './platform.css';
import './refinement.css';

export const metadata: Metadata = {
  title: '广州诊所发现｜汇医盟',
  description:
    '在广州，找到身边的诊所。按区域查看地址、电话、地图导航与逐店预约方式。',
  metadataBase: new URL('https://www.huiyimeng.com'),
  icons: {
    icon: '/huiyimeng-logo.jpg',
    apple: '/huiyimeng-logo.jpg',
  },
  openGraph: {
    title: '广州诊所发现｜汇医盟',
    description:
      '在广州，找到身边的诊所。按区域查看地址、电话、地图导航与逐店预约方式。',
    images: [{ url: '/og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '广州诊所发现｜汇医盟',
    description:
      '在广州，找到身边的诊所。按区域查看地址、电话、地图导航与逐店预约方式。',
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
      <body>{children}</body>
    </html>
  );
}
