import sourceData from '@/content/clinics-source.json';

export type Coordinates = { latitude: number; longitude: number };
export type ClinicService = {
  id: string;
  name: string;
  source: string;
  verified: boolean;
};
export type ClinicDoctor = {
  id: string;
  name: string;
  title: string | null;
  schedule: string | null;
  source: string;
  verified: boolean;
};
export type ClinicPrice = {
  id: string;
  name: string;
  amount: string;
  applicability: string;
  source: string;
  verified: boolean;
};
export type ClinicAppointment = {
  kind: 'wechat';
  qrImage: string;
  label: string;
  schemeUrl: string;
  verificationStatus: 'pending_reconfirmation' | 'confirmed';
  source: string;
};
export type Clinic = {
  id: string;
  name: string;
  city: string;
  area: string;
  type: string;
  image?: string;
  imageAlt?: string;
  logo: string | null;
  shortAddress: string;
  address: string;
  phone: string;
  navigationUrl: string;
  appointmentAvailable: boolean;
  appointment: ClinicAppointment | null;
  coordinates: Coordinates;
  coordinatesStatus: 'existing_website_pending_confirmation';
  addressNeedsConfirmation: boolean;
  hours: string | null;
  doctors: ClinicDoctor[];
  services: ClinicService[];
  prices: ClinicPrice[];
  license: string | null;
  authorizationStatus: 'unconfirmed' | 'confirmed';
  businessVerifiedAt: string | null;
  codeAuditedAt: string;
  source: string;
  provenance: {
    status: 'existing_website_pending_reconfirmation';
    description: string;
  };
};

export const platformPhone = '17819754219';
export const clinicSourceAuditDate = sourceData.audit.codeAuditedAt;

const amapSearchUrl = (name: string, address: string) =>
  `https://uri.amap.com/search?keyword=${encodeURIComponent(`${name} ${address}`)}&city=${encodeURIComponent('广州')}&callnative=1`;

// All public clinic surfaces use this single source. Existing website records
// are not promoted to verified facts or authorized partner listings by a code audit.
export const clinics: Clinic[] = sourceData.clinics.map((record) => ({
  id: record.id,
  name: record.name,
  city: record.city,
  area: record.area,
  type: record.type,
  image: record.image ?? undefined,
  imageAlt: record.imageAlt ?? undefined,
  logo: record.logo,
  shortAddress: record.shortAddress,
  address: record.address,
  phone: record.phone,
  navigationUrl: record.addressNeedsConfirmation
    ? ''
    : (record.navigationUrl ?? amapSearchUrl(record.name, record.address)),
  appointmentAvailable: record.appointment !== null,
  appointment: record.appointment as ClinicAppointment | null,
  coordinates: record.coordinates,
  coordinatesStatus: 'existing_website_pending_confirmation',
  addressNeedsConfirmation: record.addressNeedsConfirmation,
  hours: record.hours,
  doctors: record.doctors as ClinicDoctor[],
  services: record.services as ClinicService[],
  prices: record.prices as ClinicPrice[],
  license: record.license,
  authorizationStatus:
    record.authorizationStatus as Clinic['authorizationStatus'],
  businessVerifiedAt: record.businessVerifiedAt,
  codeAuditedAt: sourceData.audit.codeAuditedAt,
  source: sourceData.source,
  provenance: {
    status: 'existing_website_pending_reconfirmation',
    description:
      '沿用原网站资料；地址、电话与图片待医馆重新核对，展示授权待确认。',
  },
}));

export const confirmedPartnerClinics = clinics.filter(
  (clinic) =>
    clinic.authorizationStatus === 'confirmed' &&
    clinic.businessVerifiedAt !== null,
);

export function getClinic(id: string) {
  return clinics.find((clinic) => clinic.id === id);
}

export const getClinicById = getClinic;

export function isClinicId(value: string): boolean {
  return clinics.some((clinic) => clinic.id === value);
}

export function verifiedServices(clinic: Clinic): ClinicService[] {
  return clinic.services.filter(
    (service) => service.verified && service.source.trim().length > 0,
  );
}

export function verifiedDoctors(clinic: Clinic): ClinicDoctor[] {
  return clinic.doctors.filter(
    (doctor) => doctor.verified && doctor.source.trim().length > 0,
  );
}

export function verifiedPrices(clinic: Clinic): ClinicPrice[] {
  return clinic.prices.filter(
    (price) => price.verified && price.source.trim().length > 0,
  );
}

export function clinicCanonicalUrl(id: string): string {
  return `https://www.huiyimeng.com/clinics/${encodeURIComponent(id)}.html`;
}
