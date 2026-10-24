// Tencent COS serves the exported .html files directly, while the local
// development server uses route paths without the extension.
const staticExport = process.env.NODE_ENV === 'production';

const pageHref = (path: string) =>
  staticExport ? `/${path}.html` : `/${path}`;

export const clinicsHref = pageHref('clinics');
export const bodyGuideHref = pageHref('body-guide');
export const visitGuideHref = pageHref('visit-guide');
export const aboutHref = pageHref('about');
export const valuesHref = pageHref('brand-values');
export const contactHref = pageHref('contact');
export const appointmentHref = pageHref('appointment');
export const cooperationHref = pageHref('cooperation');
export const doctorsHref = pageHref('doctors');

export function clinicDetailHref(id: string) {
  return pageHref(`clinics/${id}`);
}

export const wellnessIndexHref = staticExport ? '/wellness.html' : '/wellness';

export function wellnessArticleHref(slug: string) {
  return staticExport ? `/wellness/${slug}.html` : `/wellness/${slug}`;
}
