import { SiteHeader } from '../site-header';

export function WellnessHeader({ backHref = '/' }: { backHref?: string }) {
  return <SiteHeader active="wellness" backHref={backHref} />;
}
