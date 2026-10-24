import type { Metadata } from 'next';
import { ClinicDetail } from '@/components/clinic-detail';
import { clinicCanonicalUrl } from '@/lib/clinics';

const canonical = clinicCanonicalUrl('huiyitang-guangzhou');
export const metadata: Metadata = {
  title: '汇医堂中医诊所｜地址、电话与预约方式｜汇医盟',
  description:
    '查看广州天河区汇医堂中医诊所原网站收录的地址、电话与微信预约入口。营业时间、医生出诊及价格待医馆核实，到访前请电话确认。',
  alternates: { canonical },
  openGraph: {
    title: '汇医堂中医诊所｜汇医盟',
    description: '本馆地址、电话与微信预约方式。资料待医馆复核，到访前请确认。',
    url: canonical,
    images: [{ url: '/huiyitang-clinic.jpg', alt: '原网站汇医堂门店照片' }],
  },
};
export default function Page() {
  return <ClinicDetail clinicId="huiyitang-guangzhou" />;
}
