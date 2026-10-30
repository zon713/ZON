import type { Metadata } from 'next';
import { ClinicDirectory } from '@/components/clinic-directory';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/' },
};

export default function Home() {
  return <ClinicDirectory home />;
}
