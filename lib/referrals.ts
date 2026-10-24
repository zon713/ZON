import { clinics } from './clinics';

/** Entry identifiers only. Never include symptoms, body selections or identities. */
export type ReferralSource = 'clinic' | 'platform' | 'unknown';

export const referralSourceLabels: Record<ReferralSource, string> = {
  clinic: '医馆自有渠道',
  platform: '汇医盟公共推广',
  unknown: '未标记来源',
};

function isKnownClinic(clinicId: string) {
  return clinics.some((clinic) => clinic.id === clinicId);
}

/**
 * A source is valid only for the clinic explicitly identified in the same URL.
 * Do not carry it through public-directory navigation or browser storage.
 */
export function getClinicReferralSource(
  search: string | URLSearchParams,
  clinicId: string,
): ReferralSource {
  const params =
    typeof search === 'string' ? new URLSearchParams(search) : search;
  if (
    !isKnownClinic(clinicId) ||
    params.getAll('clinic').length !== 1 ||
    params.get('clinic') !== clinicId ||
    params.getAll('source').length !== 1
  ) {
    return 'unknown';
  }
  const source = params.get('source');
  return source === 'clinic' || source === 'platform' ? source : 'unknown';
}

/** An absolute link to one real exported clinic page, with no inherited query. */
export function createClinicShareUrl(
  clinicId: string,
  source: ReferralSource = 'clinic',
  origin = 'https://www.huiyimeng.com',
): string {
  if (!isKnownClinic(clinicId)) throw new Error('Unknown clinic ID');
  const url = new URL(`/clinics/${encodeURIComponent(clinicId)}.html`, origin);
  url.searchParams.set('clinic', clinicId);
  url.searchParams.set(
    'source',
    source === 'clinic' || source === 'platform' ? source : 'unknown',
  );
  return url.toString();
}

export function clinicSourceLabel(source: ReferralSource) {
  return referralSourceLabels[source] ?? referralSourceLabels.unknown;
}
