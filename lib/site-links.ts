import platform from '@/content/platform-links.json';
const staticExport = process.env.NODE_ENV === 'production';
function routeHref(key: keyof typeof platform.routes) {
  const route = platform.routes[key];
  return staticExport && route !== '/' ? `${route}.html` : route;
}
export const homeHref = routeHref('home');
export const clinicsHref = routeHref('clinics');
export const bodyGuideHref = routeHref('bodyGuide');
export const visitGuideHref = routeHref('visitGuide');
export const aboutHref = routeHref('about');
export const valuesHref = routeHref('values');
export const contactHref = routeHref('contact');
export const appointmentHref = routeHref('appointment');
export const cooperationHref = routeHref('cooperation');
export const doctorsHref = routeHref('doctors');
export const locationsHref = routeHref('locations');
export const serviceGuideHref = routeHref('serviceGuide');
export const supportHref = routeHref('support');
export const privacyHref = routeHref('privacy');
export const wechatPreviewHref = routeHref('wechatPreview');
export const wellnessIndexHref = routeHref('wellness');
export function clinicDetailHref(id: string) {
  return `${platform.routes.clinics}/${encodeURIComponent(id)}${staticExport ? '.html' : ''}`;
}
export function wellnessArticleHref(slug: string) {
  return `${platform.routes.wellness}/${encodeURIComponent(slug)}${staticExport ? '.html' : ''}`;
}
