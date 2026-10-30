import { clinics } from './clinics';
import type { ReferralSource } from './referrals';

export type ClinicEventType =
  | 'page_view'
  | 'phone_click'
  | 'navigation_click'
  | 'appointment_click';

/** No collection service or shared store is configured in this static project. */
export const clinicAnalytics = Object.freeze({
  enabled: false,
  status: 'not_configured',
  displayLabel: '暂未统计',
} as const);

export type ClinicEventResult = {
  status: 'not_collected';
  reason: 'analytics_not_configured' | 'invalid_event';
};

const allowedEvents: readonly string[] = [
  'page_view',
  'phone_click',
  'navigation_click',
  'appointment_click',
];

/**
 * Integration boundary, intentionally disabled. This function neither sends nor
 * buffers events. A future collector may accept only these three allowlisted
 * fields; do not pass URLs, referrers, searches, location or body selections.
 */
export function recordClinicEvent(
  event: ClinicEventType,
  clinicId: string,
  source: ReferralSource,
): ClinicEventResult {
  if (
    !allowedEvents.includes(event) ||
    !clinics.some((clinic) => clinic.id === clinicId) ||
    !['clinic', 'platform', 'unknown'].includes(source)
  ) {
    return { status: 'not_collected', reason: 'invalid_event' };
  }
  return { status: 'not_collected', reason: 'analytics_not_configured' };
}
