import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '诊所查询｜汇医盟',
  description: '查找诊所地址、电话和导航，也可以按距离看看哪家离你更近。',
  metadataBase: new URL('https://www.huiyimeng.com'),
  icons: {
    icon: '/huiyimeng-logo.jpg',
    apple: '/huiyimeng-logo.jpg',
  },
  openGraph: {
    title: '诊所查询｜汇医盟',
    description: '查找诊所地址、电话和导航，也可以按距离看看哪家离你更近。',
    images: [{ url: '/og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '诊所查询｜汇医盟',
    description: '查找诊所地址、电话和导航，也可以按距离看看哪家离你更近。',
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
