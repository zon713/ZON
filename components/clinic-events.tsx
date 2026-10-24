'use client';

import { useEffect, type AnchorHTMLAttributes } from 'react';
import { recordClinicEvent, type ClinicEventType } from '@/lib/analytics';
import { getClinicReferralSource } from '@/lib/referrals';

/** Marks the intended page-view boundary; collection is currently disabled. */
export function ClinicEvents({ clinicId }: { clinicId: string }) {
  useEffect(() => {
    recordClinicEvent(
      'page_view',
      clinicId,
      getClinicReferralSource(window.location.search, clinicId),
    );
  }, [clinicId]);
  return null;
}

type ClinicEventLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  clinicId: string;
  event: Exclude<ClinicEventType, 'page_view'>;
};

/** The anchor always performs its real action, even without a collector. */
export function ClinicEventLink({
  clinicId,
  event,
  onClick,
  href,
  children,
  ...props
}: ClinicEventLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(click) => {
        onClick?.(click);
        if (!click.defaultPrevented) {
          recordClinicEvent(
            event,
            clinicId,
            getClinicReferralSource(window.location.search, clinicId),
          );
        }
      }}
    >
      {children}
    </a>
  );
}

export function TrackedClinicLink({
  eventType,
  ...props
}: Omit<ClinicEventLinkProps, 'event'> & {
  eventType: Exclude<ClinicEventType, 'page_view'>;
}) {
  return <ClinicEventLink {...props} event={eventType} />;
}
