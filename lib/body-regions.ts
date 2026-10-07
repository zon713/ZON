export const bodyRegions = [
  { id: 'head', label: '头部', position: [0, 1.46, 0.15] },
  { id: 'neck', label: '颈部', position: [0, 1.14, 0.11] },
  { id: 'shoulder', label: '肩部', position: [0.29, 0.99, 0.13] },
  { id: 'chest', label: '胸部', position: [0, 0.87, 0.2] },
  { id: 'abdomen', label: '腹部', position: [0, 0.52, 0.18] },
  { id: 'back', label: '背部', position: [0, 0.84, -0.21] },
  { id: 'waist', label: '腰部', position: [0, 0.48, -0.19] },
  { id: 'arm', label: '手臂', position: [-0.44, 0.48, 0.1] },
  { id: 'knee', label: '膝部', position: [0.16, -0.48, 0.13] },
  { id: 'foot', label: '足部', position: [-0.16, -1.06, 0.18] },
] as const;
export type BodyRegionId = (typeof bodyRegions)[number]['id'];

// No verified region-specific service or clinician data exists in this repository.
// Populate only after clinic approval; an empty mapping must never imply eligibility.
export type VerifiedService = {
  clinicId: string;
  service: string;
  source: string;
  doctors: { name: string; specialty: string; source: string }[];
};
export const verifiedBodyServices: Partial<
  Record<BodyRegionId, VerifiedService[]>
> = {};
