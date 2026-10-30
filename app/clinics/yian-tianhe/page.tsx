import type { Metadata } from 'next';
import { ClinicDetail } from '@/components/clinic-detail';
import { clinicCanonicalUrl } from '@/lib/clinics';

const canonical = clinicCanonicalUrl('yian-tianhe');
export const metadata: Metadata = {
  title: '易安中医诊所｜地址与电话咨询｜汇医盟',
  description:
    '查看广州天河区易安中医诊所原网站收录的车陂路地址、本馆电话与导航入口。营业时间、医生安排及价格待医馆确认。',
  alternates: { canonical },
  openGraph: {
    title: '易安中医诊所｜汇医盟',
    description: '本馆地址、电话与导航入口。资料待医馆复核。',
    url: canonical,
    images: [{ url: '/yian-clinic.jpg', alt: '原网站易安门店照片' }],
  },
};
export default function Page() {
  return <ClinicDetail clinicId="yian-tianhe" />;
}
