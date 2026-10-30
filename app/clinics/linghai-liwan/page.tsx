import type { Metadata } from 'next';
import { ClinicDetail } from '@/components/clinic-detail';
import { clinicCanonicalUrl } from '@/lib/clinics';

const canonical = clinicCanonicalUrl('linghai-liwan');
export const metadata: Metadata = {
  title: '岭海医疗诊所｜电话与到访信息｜汇医盟',
  description:
    '查看广州荔湾区岭海医疗诊所的原网站收录资料与本馆电话。原资料存在两个地址，请电话核对接诊地点；营业与出诊时间待医馆确认。',
  alternates: { canonical },
  openGraph: {
    title: '岭海医疗诊所｜汇医盟',
    description: '本馆电话与到访资料。原网站地址存在冲突，请先电话确认。',
    url: canonical,
    images: [{ url: '/linghai-clinic.jpg', alt: '原网站岭海门店照片' }],
  },
};
export default function Page() {
  return <ClinicDetail clinicId="linghai-liwan" />;
}
