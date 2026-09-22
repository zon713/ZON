// Tencent COS serves the exported .html files directly, while the local
// development server uses route paths without the extension.
const staticExport = process.env.NODE_ENV === 'production';

export const wellnessIndexHref = staticExport ? '/wellness.html' : '/wellness';

export function wellnessArticleHref(slug: string) {
  return staticExport ? `/wellness/${slug}.html` : `/wellness/${slug}`;
}
