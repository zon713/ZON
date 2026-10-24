import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = JSON.parse(
  await readFile(path.join(root, 'content/clinics-source.json'), 'utf8'),
);
const sourceOnly = process.argv.includes('--source-only');

// These bindings come from the recovered website, independently of the renderer.
// Changing one requires a clinic-confirmed source update and a matching test review.
const originalBindings = new Map([
  [
    'huiyitang-guangzhou',
    { phone: '13178828419', appointment: true, navigation: true },
  ],
  [
    'linghai-liwan',
    { phone: '13929559688', appointment: false, navigation: false },
  ],
  [
    'peiyuantang-tianhe',
    { phone: '13922111258', appointment: false, navigation: true },
  ],
  [
    'yian-tianhe',
    { phone: '18924138921', appointment: false, navigation: true },
  ],
]);
const platformPhone = '17819754219';
const decode = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"');
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return match ? decode(match[1]) : null;
};

assert.equal(
  new Set(source.clinics.map((clinic) => clinic.id)).size,
  source.clinics.length,
  'Clinic IDs must be unique',
);
assert.equal(
  source.clinics.length,
  originalBindings.size,
  'Review authorized source evidence before adding directory records',
);
assert.ok(
  source.audit.codeAuditedAt,
  'A code audit date must be available separately from business verification',
);

for (const clinic of source.clinics) {
  const original = originalBindings.get(clinic.id);
  assert.ok(original, `Unexpected clinic ${clinic.id}`);
  assert.equal(
    clinic.phone,
    original.phone,
    `${clinic.id}: phone must stay bound to the correct clinic`,
  );
  assert.equal(
    Boolean(clinic.appointment),
    original.appointment,
    `${clinic.id}: appointment must not leak from another clinic`,
  );
  assert.ok(
    clinic.address && clinic.area && clinic.name,
    `${clinic.id}: required directory facts`,
  );
  for (const asset of [
    clinic.image,
    clinic.logo,
    clinic.appointment?.qrImage,
  ].filter(Boolean)) {
    assert.ok(
      asset.startsWith('/') && !asset.includes('..'),
      `${clinic.id}: local asset path`,
    );
    await access(path.join(root, 'public', asset.slice(1)));
  }
  for (const fact of [
    ...clinic.doctors,
    ...clinic.services,
    ...clinic.prices,
  ]) {
    assert.ok(
      !fact.verified || fact.source,
      `${clinic.id}: published verified content requires evidence`,
    );
  }
  if (clinic.addressNeedsConfirmation)
    assert.equal(
      clinic.navigationUrl,
      null,
      `${clinic.id}: conflicting addresses must not have a navigation target`,
    );
  if (sourceOnly) continue;

  const htmlPath = path.join(root, 'dist/client/clinics', `${clinic.id}.html`);
  const html = await readFile(htmlPath, 'utf8');
  const links = Array.from(html.matchAll(/<a\b[^>]*>/gi), ([tag]) => ({
    tag,
    href: attribute(tag, 'href'),
  })).filter((link) => link.href);
  const phoneLinks = links.filter(({ href }) => href.startsWith('tel:'));
  assert.ok(
    phoneLinks.some(({ href }) => href === `tel:${original.phone}`),
    `${clinic.id}: rendered own phone action is missing`,
  );
  assert.ok(
    phoneLinks.every(
      ({ href }) =>
        href === `tel:${original.phone}` || href === `tel:${platformPhone}`,
    ),
    `${clinic.id}: another clinic's phone leaked into this page`,
  );
  const mapLinks = links.filter(
    ({ href }) =>
      /^(https?:\/\/)?(?:surl\.)?amap\.com\//.test(href) ||
      href.startsWith('https://uri.amap.com/'),
  );
  assert.equal(
    mapLinks.length > 0,
    original.navigation,
    `${clinic.id}: navigation availability must reflect address status`,
  );
  if (original.navigation) {
    for (const { href } of mapLinks) {
      if (clinic.navigationUrl)
        assert.equal(
          href,
          clinic.navigationUrl,
          `${clinic.id}: original map must stay bound`,
        );
      else {
        const keyword = new URL(href).searchParams.get('keyword');
        assert.ok(
          keyword?.includes(clinic.name) && keyword.includes(clinic.address),
          `${clinic.id}: map search must include this clinic's actual address`,
        );
      }
    }
  } else
    assert.ok(
      html.includes('地址存在冲突'),
      `${clinic.id}: conflicting address needs an explicit explanation`,
    );

  const appointmentLinks = links.filter(({ href }) =>
    href.startsWith('weixin:'),
  );
  const qrImages = Array.from(html.matchAll(/<img\b[^>]*>/gi), ([tag]) =>
    attribute(tag, 'src'),
  ).filter((src) => src?.includes('appointment-mini-program'));
  assert.equal(
    appointmentLinks.length > 0,
    original.appointment,
    `${clinic.id}: incorrect WeChat appointment exposure`,
  );
  assert.equal(
    qrImages.length > 0,
    original.appointment,
    `${clinic.id}: incorrect appointment QR exposure`,
  );
  if (clinic.appointment)
    assert.ok(
      appointmentLinks.every(
        ({ href }) => href === clinic.appointment.schemeUrl,
      ),
      `${clinic.id}: original scheme changed`,
    );

  const canonicalTag = Array.from(
    html.matchAll(/<link\b[^>]*>/gi),
    ([tag]) => tag,
  ).find((tag) => attribute(tag, 'rel') === 'canonical');
  assert.ok(canonicalTag, `${clinic.id}: canonical missing`);
  assert.equal(
    attribute(canonicalTag, 'href'),
    `https://www.huiyimeng.com/clinics/${clinic.id}.html`,
    `${clinic.id}: source parameters must not create duplicate canonical pages`,
  );
  assert.ok(
    html.includes(clinic.name) && html.includes(clinic.phone),
    `${clinic.id}: direct static file must contain readable clinic details`,
  );
  assert.ok(
    html.includes('营业时间') && html.includes('医生出诊'),
    `${clinic.id}: opening hours and physician schedules are separate`,
  );
  assert.ok(
    html.includes('暂未统计'),
    `${clinic.id}: no collector must be shown honestly`,
  );
  if (clinic.businessVerifiedAt === null)
    assert.ok(
      html.includes('待医馆') && html.includes('代码整理日期'),
      `${clinic.id}: unverified facts must not look business-verified`,
    );
  console.log(
    `PASS ${clinic.id}: static page, own phone, address policy, appointment binding, canonical and data status`,
  );
}

console.log(
  sourceOnly
    ? 'PASS clinic source integrity (static page checks intentionally skipped).'
    : 'PASS all 4 exported clinic pages and source bindings.',
);
