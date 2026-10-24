import type { Metadata } from 'next';
import { ClinicDirectory } from '@/components/clinic-directory';

export const metadata: Metadata = {
  title: '广州医馆查询｜汇医盟',
  description:
    '按名称、地址或地区查看广州医馆目录资料、电话、导航和已有预约入口，出诊安排请向医馆确认。',
  alternates: { canonical: 'https://www.huiyimeng.com/clinics.html' },
};
export default function Page() {
  return <ClinicDirectory />;
}
