import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = path.join(root, 'content/clinic-share-codes.json');
const outputDirectory = path.join(root, 'public/share-codes');
const require = createRequire(import.meta.url);
const options = {
  type: 'png',
  width: 512,
  version: 8,
  margin: 4,
  errorCorrectionLevel: 'M',
  color: { dark: '#234f3b', light: '#ffffff' },
};

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function verifyDecodedImage(buffer, expected) {
  const image = PNG.sync.read(buffer);
  ensure(
    image.width === options.width && image.height === options.width,
    `${expected.clinicId}: unexpected PNG dimensions`,
  );
  // Decode the actual PNG pixels using a separate implementation from qrcode.
  // A manifest flag or the encoder's own input is never treated as decode proof.
  const decoded = jsQR(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height,
    {
      inversionAttempts: 'dontInvert',
    },
  );
  ensure(
    decoded !== null,
    `${expected.clinicId}: independent QR decode failed`,
  );
  ensure(
    decoded.data === expected.url,
    `${expected.clinicId}: decoded URL differs from configured target`,
  );
  const target = new URL(decoded.data);
  ensure(
    target.pathname === expected.pathname,
    `${expected.clinicId}: decoded clinic page mismatch`,
  );
  ensure(
    target.searchParams.getAll('clinic').length === 1 &&
      target.searchParams.get('clinic') === expected.clinicId,
    `${expected.clinicId}: decoded clinic identifier mismatch`,
  );
  ensure(
    target.searchParams.get('source') === 'clinic' &&
      target.searchParams.get('entry') === 'clinic_share' &&
      [...target.searchParams.keys()].length === 3,
    `${expected.clinicId}: decoded source or entry mismatch`,
  );
  return {
    sha256: sha256(buffer),
    decoded: true,
    decodedUrl: decoded.data,
    width: image.width,
    height: image.height,
  };
}

async function main() {
  const args = process.argv.slice(2);
  ensure(
    args.length === 0 || (args.length === 1 && args[0] === '--check'),
    'Usage: node scripts/generate-share-codes.mjs [--check]',
  );
  const checkOnly = args[0] === '--check';
  const platform = JSON.parse(
    await readFile(path.join(root, 'content/platform-links.json'), 'utf8'),
  );
  const source = JSON.parse(
    await readFile(path.join(root, 'content/clinics-source.json'), 'utf8'),
  );
  const origin = new URL(platform.siteOrigin);
  ensure(
    origin.protocol === 'https:' &&
      origin.pathname === '/' &&
      !origin.search &&
      !origin.hash,
    'siteOrigin must be an HTTPS origin without a path, query or hash',
  );
  const route = platform.routes.clinics;
  ensure(
    typeof route === 'string' && /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(route),
    'Configured clinic directory route is invalid',
  );
  ensure(
    Array.isArray(source.clinics) && source.clinics.length > 0,
    'No clinic source records found',
  );
  const ids = new Set();
  const expectedCodes = source.clinics.map((clinic) => {
    ensure(
      typeof clinic.id === 'string' &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clinic.id),
      'Clinic IDs must be safe lowercase route identifiers',
    );
    ensure(
      typeof clinic.name === 'string' && clinic.name.trim().length > 0,
      `${clinic.id}: clinic name is missing`,
    );
    ensure(!ids.has(clinic.id), `Duplicate clinic ID: ${clinic.id}`);
    ids.add(clinic.id);
    const pathname = `${route}/${encodeURIComponent(clinic.id)}.html`;
    const target = new URL(pathname, origin);
    target.searchParams.set('clinic', clinic.id);
    target.searchParams.set('source', 'clinic');
    target.searchParams.set('entry', 'clinic_share');
    return {
      clinicId: clinic.id,
      name: clinic.name,
      pathname,
      url: target.toString(),
      image: `/share-codes/${clinic.id}.png`,
    };
  });

  if (checkOnly) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    ensure(manifest.version === 1, 'Unsupported QR manifest version');
    ensure(manifest.purpose === 'clinic_detail_share', 'Unexpected QR purpose');
    ensure(
      manifest.siteOrigin === platform.siteOrigin,
      'QR manifest origin does not match current configuration',
    );
    ensure(
      Array.isArray(manifest.codes) &&
        manifest.codes.length === expectedCodes.length,
      'QR manifest must contain exactly one record per current clinic',
    );
    ensure(
      new Set(manifest.codes.map((code) => code.clinicId)).size ===
        expectedCodes.length,
      'Duplicate clinic records in QR manifest',
    );
    for (const expected of expectedCodes) {
      const record = manifest.codes.find(
        (code) => code.clinicId === expected.clinicId,
      );
      ensure(record, `${expected.clinicId}: missing QR manifest record`);
      ensure(
        record.url === expected.url &&
          record.image === expected.image &&
          record.name === expected.name &&
          record.source === 'clinic' &&
          record.entry === 'clinic_share',
        `${expected.clinicId}: QR metadata no longer matches source configuration`,
      );
      const buffer = await readFile(
        path.join(outputDirectory, `${expected.clinicId}.png`),
      );
      const actual = verifyDecodedImage(buffer, expected);
      ensure(
        record.sha256 === actual.sha256 &&
          record.decoded === true &&
          record.decodedUrl === actual.decodedUrl &&
          record.width === actual.width &&
          record.height === actual.height,
        `${expected.clinicId}: stored hash or decode metadata does not match the actual image`,
      );
      console.log(
        `Verified ${expected.clinicId}: exact URL, clinic ID, PNG pixels and SHA-256.`,
      );
    }
    console.log(
      `QR check passed: ${expectedCodes.length} images; no files regenerated.`,
    );
    return;
  }

  // Keep generated images in memory until every clinic's pixels decode correctly.
  const generated = [];
  for (const expected of expectedCodes) {
    const buffer = await QRCode.toBuffer(expected.url, options);
    const verification = verifyDecodedImage(buffer, expected);
    generated.push({
      buffer,
      record: {
        clinicId: expected.clinicId,
        name: expected.name,
        url: expected.url,
        image: expected.image,
        source: 'clinic',
        entry: 'clinic_share',
        ...verification,
      },
    });
  }

  const manifest = {
    version: 1,
    sourceAuditDate: source.audit.codeAuditedAt,
    siteOrigin: platform.siteOrigin,
    purpose: 'clinic_detail_share',
    verification: {
      method:
        'Independent PNG pixel decoding with jsQR; exact URL and clinic identifier comparison; SHA-256.',
      packages: Object.fromEntries(
        ['qrcode', 'jsqr', 'pngjs'].map((name) => [
          name,
          require(`${name}/package.json`).version,
        ]),
      ),
      errorCorrectionLevel: options.errorCorrectionLevel,
      qrVersion: options.version,
      marginModules: options.margin,
      darkColor: options.color.dark,
      lightColor: options.color.light,
      liveWebsiteChecked: false,
      wechatPhoneScanChecked: false,
      appointmentMiniProgramChecked: false,
    },
    codes: generated.map(({ record }) => record),
  };
  await mkdir(outputDirectory, { recursive: true });
  for (const { buffer, record } of generated) {
    await writeFile(
      path.join(outputDirectory, `${record.clinicId}.png`),
      buffer,
    );
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `Generated and independently decoded ${generated.length} clinic share PNGs.`,
  );
  console.log(
    'This verifies QR contents only. Production availability and WeChat phone scanning still require release checks.',
  );
}

main().catch((error) => {
  console.error(
    `QR generation/check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
