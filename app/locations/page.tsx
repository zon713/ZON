import type { Metadata } from 'next';
import { ClinicLocations } from '@/components/clinic-locations';

export const metadata: Metadata = {
  title: '到店导航｜先选择医馆｜汇医盟',
  description:
    '按地区或名称查找广州医馆位置，核对本馆地址后打开地图或电话咨询。地址待核对的医馆不提供未经确认的导航。',
  alternates: { canonical: 'https://www.huiyimeng.com/locations.html' },
};

export default function LocationsPage() {
  return <ClinicLocations />;
}
