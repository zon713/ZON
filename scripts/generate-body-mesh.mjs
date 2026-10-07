// Original neutral human sculpt. Smooth implicit unions, not assembled meshes.
// Generates a local indexed surface once, so mobile devices do no sculpting work.
import { mkdirSync, writeFileSync } from 'node:fs';

const mix = (a, b, t) => a + (b - a) * t;
function union(a, b, k = 0.045) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
function ellipsoid(x, y, z, c, r) {
  x = (x - c[0]) / r[0];
  y = (y - c[1]) / r[1];
  z = (z - c[2]) / r[2];
  return (Math.hypot(x, y, z) - 1) * Math.min(...r);
}
function limb(x, y, z, a, b, ra, rb, depth = 1) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    dz = b[2] - a[2];
  const t = Math.max(
    0,
    Math.min(
      1,
      ((x - a[0]) * dx + (y - a[1]) * dy + (z - a[2]) * dz) /
        (dx * dx + dy * dy + dz * dz),
    ),
  );
  return (
    Math.hypot(
      x - mix(a[0], b[0], t),
      y - mix(a[1], b[1], t),
      (z - mix(a[2], b[2], t)) / depth,
    ) - mix(ra, rb, t)
  );
}
export function field(x, y, z) {
  // Upper thorax, tapered waist and pelvis blend into one continuous trunk.
  let d = ellipsoid(x, y, z, [0, 0.78, 0], [0.29, 0.35, 0.17]);
  d = union(d, ellipsoid(x, y, z, [0, 0.5, 0], [0.22, 0.29, 0.153]), 0.085);
  d = union(
    d,
    ellipsoid(x, y, z, [0, 0.24, -0.008], [0.25, 0.24, 0.173]),
    0.085,
  );
  d = union(
    d,
    limb(x, y, z, [0, 1.01, 0], [0, 1.27, 0], 0.112, 0.09, 0.88),
    0.06,
  );
  // Cranial contour, jaw, chin and restrained face profile.
  d = union(
    d,
    ellipsoid(x, y, z, [0, 1.47, -0.008], [0.138, 0.196, 0.137]),
    0.035,
  );
  d = union(
    d,
    ellipsoid(x, y, z, [0, 1.36, 0.026], [0.108, 0.105, 0.11]),
    0.035,
  );
  d = union(
    d,
    ellipsoid(x, y, z, [0, 1.423, 0.126], [0.025, 0.054, 0.033]),
    0.019,
  );
  for (const s of [-1, 1]) {
    // Trapezius flowing into the deltoid; upper arm, elbow, forearm, wrist.
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.08, 1.075, 0],
        [s * 0.29, 0.985, 0],
        0.08,
        0.098,
        0.91,
      ),
      0.06,
    );
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.3, 0.972, 0],
        [s * 0.407, 0.63, -0.015],
        0.09,
        0.063,
        0.92,
      ),
      0.045,
    );
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.407, 0.63, -0.015],
        [s * 0.49, 0.315, 0.015],
        0.063,
        0.04,
        0.86,
      ),
      0.025,
    );
    d = union(
      d,
      ellipsoid(x, y, z, [s * 0.505, 0.219, 0.024], [0.05, 0.111, 0.031]),
      0.028,
    );
    // A modest thumb silhouette, without isolated pieces.
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.472, 0.24, 0.041],
        [s * 0.46, 0.188, 0.044],
        0.019,
        0.014,
      ),
      0.015,
    );
    // Continuous hips, thighs, knee, tapered calf and ankle.
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.132, 0.2, 0],
        [s * 0.152, -0.44, 0.012],
        0.135,
        0.073,
        1.04,
      ),
      0.055,
    );
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.152, -0.44, 0.012],
        [s * 0.157, -0.92, -0.025],
        0.076,
        0.048,
        1.02,
      ),
      0.035,
    );
    d = union(
      d,
      ellipsoid(x, y, z, [s * 0.158, -0.666, -0.033], [0.081, 0.175, 0.086]),
      0.033,
    );
    d = union(
      d,
      limb(
        x,
        y,
        z,
        [s * 0.157, -0.92, -0.025],
        [s * 0.157, -1.055, -0.009],
        0.048,
        0.047,
      ),
      0.02,
    );
    d = union(
      d,
      ellipsoid(x, y, z, [s * 0.157, -1.063, 0.067], [0.069, 0.058, 0.148]),
      0.026,
    );
    d = union(
      d,
      ellipsoid(x, y, z, [s * 0.137, 1.44, -0.003], [0.021, 0.043, 0.031]),
      0.013,
    );
  }
  return d;
}

// Marching tetrahedra with shared edge vertices and gradient normals.
const step = 0.024,
  nx = 51,
  ny = 121,
  nz = 27;
const origin = [-0.6, -1.17, -0.3];
const grid = new Float32Array(nx * ny * nz);
const idx = (x, y, z) => (y * nz + z) * nx + x;
const point = (i) => {
  const x = i % nx,
    z = Math.floor(i / nx) % nz,
    y = Math.floor(i / (nx * nz));
  return [origin[0] + x * step, origin[1] + y * step, origin[2] + z * step];
};
for (let y = 0; y < ny; y++)
  for (let z = 0; z < nz; z++)
    for (let x = 0; x < nx; x++) {
      const i = idx(x, y, z);
      grid[i] = field(...point(i));
    }
const positions = [],
  normals = [],
  indices = [],
  cache = new Map();
const tetra = [
  [0, 5, 1, 6],
  [0, 1, 2, 6],
  [0, 2, 3, 6],
  [0, 3, 7, 6],
  [0, 7, 4, 6],
  [0, 4, 5, 6],
];
function edge(a, b) {
  const key = a < b ? `${a}:${b}` : `${b}:${a}`;
  if (cache.has(key)) return cache.get(key);
  const pa = point(a),
    pb = point(b),
    t = grid[a] / (grid[a] - grid[b]);
  const p = pa.map((v, i) => mix(v, pb[i], t));
  const e = 0.001;
  const n = [
    field(p[0] + e, p[1], p[2]) - field(p[0] - e, p[1], p[2]),
    field(p[0], p[1] + e, p[2]) - field(p[0], p[1] - e, p[2]),
    field(p[0], p[1], p[2] + e) - field(p[0], p[1], p[2] - e),
  ];
  const length = Math.hypot(...n);
  const i = positions.length / 3;
  positions.push(...p);
  normals.push(...n.map((v) => v / length));
  cache.set(key, i);
  return i;
}
function triangle(a, b, c) {
  const p = (i) => positions.slice(i * 3, i * 3 + 3),
    u = p(b).map((v, i) => v - p(a)[i]),
    v = p(c).map((value, i) => value - p(a)[i]);
  const cross = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  if (cross.reduce((sum, v, i) => sum + v * normals[a * 3 + i], 0) < 0)
    indices.push(a, c, b);
  else indices.push(a, b, c);
}
for (let y = 0; y < ny - 1; y++)
  for (let z = 0; z < nz - 1; z++)
    for (let x = 0; x < nx - 1; x++) {
      const cube = [
        idx(x, y, z),
        idx(x + 1, y, z),
        idx(x + 1, y + 1, z),
        idx(x, y + 1, z),
        idx(x, y, z + 1),
        idx(x + 1, y, z + 1),
        idx(x + 1, y + 1, z + 1),
        idx(x, y + 1, z + 1),
      ];
      if (cube.every((i) => grid[i] > 0) || cube.every((i) => grid[i] <= 0))
        continue;
      for (const t of tetra) {
        const corners = t.map((i) => cube[i]),
          inside = corners.filter((i) => grid[i] <= 0),
          outside = corners.filter((i) => grid[i] > 0);
        if (inside.length === 1)
          triangle(...outside.map((i) => edge(inside[0], i)));
        if (inside.length === 3)
          triangle(...inside.map((i) => edge(outside[0], i)));
        if (inside.length === 2) {
          const a = edge(inside[0], outside[0]),
            b = edge(inside[0], outside[1]),
            c = edge(inside[1], outside[0]),
            d = edge(inside[1], outside[1]);
          triangle(a, b, c);
          triangle(b, d, c);
        }
      }
    }
const vertexCount = positions.length / 3;
const header = new Uint32Array([vertexCount, indices.length]);
if (vertexCount > 65535) throw new Error('Mesh exceeds compact index limit');
const binary = Buffer.concat([
  Buffer.from(header.buffer),
  Buffer.from(
    new Int16Array(positions.map((v) => Math.round(v * 10000))).buffer,
  ),
  Buffer.from(new Int16Array(normals.map((v) => Math.round(v * 32767))).buffer),
  Buffer.from(new Uint16Array(indices).buffer),
]);
mkdirSync('public/models', { recursive: true });
writeFileSync('public/models/hym-human.bin', binary);
console.log(
  JSON.stringify({
    vertexCount,
    triangles: indices.length / 3,
    bytes: binary.length,
  }),
);
