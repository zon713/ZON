// The user confirmed this single-doctor display for every model region.
// It describes the current entry point, not a claim about medical specialties.
// Official clinic identity/address: https://hytzyzs.com/
export const bodyGuideDoctor: {
  name: string;
  clinicName: string;
  address: string;
  portraitUrl: string | null;
  appointmentUrl: string | null;
} = {
  name: '刘敬东',
  clinicName: '汇医堂中医诊所',
  address: '广州天河区中山大道中1098号（京东养车旁二楼）',
  // No verified official portrait or doctor-specific URL is available yet.
  // Do not substitute a same-name portrait or the generic clinic Scheme.
  portraitUrl: null,
  appointmentUrl: null,
};
