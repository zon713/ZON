// Original converter; input graphics asset is MakeHuman hm08, explicitly CC0.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
const source = readFileSync('scripts/model-source/base.obj', 'utf8');
const vertices = [],
  faces = [];
let group = '';
for (const l of source.split('\n')) {
  if (l.startsWith('v '))
    vertices.push(l.trim().split(/\s+/).slice(1).map(Number));
  if (l.startsWith('g ')) group = l.slice(2).trim();
  if (l.startsWith('f ') && group === 'body')
    faces.push(
      l
        .trim()
        .split(/\s+/)
        .slice(1)
        .map((s) => Number(s.split('/')[0]) - 1),
    );
}
const used = [...new Set(faces.flat())],
  map = new Map(used.map((v, i) => [v, i]));
let points = used.map((i) => vertices[i]);
const polys = faces.map((f) => f.map((i) => map.get(i)));
const ys = points.map((v) => v[1]),
  lo = Math.min(...ys),
  hi = Math.max(...ys),
  scale = 2.786 / (hi - lo);
points = points.map(([x, y, z]) => [
  x * scale,
  (y - lo) * scale - 1.12,
  z * scale,
]);
// One Catmull-Clark pass, using shared edges. No helper geometry is imported.
const edges = new Map(),
  adj = points.map(() => []),
  incident = points.map(() => []);
const centers = polys.map((f, fi) => {
  const c = [0, 0, 0];
  for (let i = 0; i < f.length; i++) {
    const a = f[i],
      b = f[(i + 1) % f.length];
    incident[a].push(fi);
    for (let k = 0; k < 3; k++) c[k] += points[a][k] / f.length;
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    let e = edges.get(key);
    if (!e) {
      e = { a, b, faces: [] };
      edges.set(key, e);
      adj[a].push(e);
      adj[b].push(e);
    }
    e.faces.push(fi);
  }
  return c;
});
const smooth = points.map((p, i) => {
  const es = adj[i],
    n = incident[i].length,
    boundary = es.filter((e) => e.faces.length === 1);
  if (boundary.length) {
    const q = boundary.map((e) => points[e.a === i ? e.b : e.a]);
    return p.map(
      (v, k) => v * 0.75 + (q.reduce((s, v) => s + v[k], 0) / q.length) * 0.25,
    );
  }
  return p.map((v, k) => {
    const f = incident[i].reduce((s, j) => s + centers[j][k], 0) / n,
      r =
        es.reduce((s, e) => s + (points[e.a][k] + points[e.b][k]) * 0.5, 0) /
        es.length;
    return (f + 2 * r + (n - 3) * v) / n;
  });
});
for (const e of edges.values()) {
  e.index = smooth.length;
  const p = points[e.a],
    q = points[e.b];
  smooth.push(
    p.map((v, k) =>
      e.faces.length === 2
        ? (v + q[k] + centers[e.faces[0]][k] + centers[e.faces[1]][k]) * 0.25
        : (v + q[k]) * 0.5,
    ),
  );
}
const triangles = [];
polys.forEach((f, fi) => {
  const c = smooth.length;
  smooth.push(centers[fi]);
  for (let j = 0; j < f.length; j++) {
    const a = f[j],
      b = f[(j + 1) % f.length],
      prev = f[(j + f.length - 1) % f.length];
    const nextEdge = edges.get(a < b ? `${a}:${b}` : `${b}:${a}`).index,
      prevEdge = edges.get(a < prev ? `${a}:${prev}` : `${prev}:${a}`).index;
    triangles.push(a, nextEdge, c, a, c, prevEdge);
  }
});
function packMesh(meshPoints, meshIndices, filename) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(meshPoints.flat(), 3),
  );
  geometry.setIndex(meshIndices);
  geometry.computeVertexNormals();
  const pos = geometry.attributes.position.array,
    norm = geometry.attributes.normal.array,
    count = meshPoints.length;
  if (count > 65535) throw Error('Uint16 vertex budget exceeded');
  const buffer = Buffer.alloc(8 + count * 12 + meshIndices.length * 2);
  buffer.writeUInt32LE(count, 0);
  buffer.writeUInt32LE(meshIndices.length, 4);
  for (let i = 0; i < pos.length; i++) {
    buffer.writeInt16LE(Math.round(pos[i] * 10000), 8 + i * 2);
    buffer.writeInt16LE(Math.round(norm[i] * 32767), 8 + count * 6 + i * 2);
  }
  meshIndices.forEach((v, i) =>
    buffer.writeUInt16LE(v, 8 + count * 12 + i * 2),
  );
  writeFileSync(filename, buffer);
  return buffer;
}
const buffer = packMesh(smooth, triangles, 'public/models/hym-human.bin');
const lowTriangles = polys.flatMap((f) => {
  const result = [];
  for (let i = 1; i < f.length - 1; i++) result.push(f[0], f[i], f[i + 1]);
  return result;
});
const compact = packMesh(
  points,
  lowTriangles,
  'public/models/hym-human-mobile.bin',
);
const count = smooth.length;
const report = {
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  keptGroups: ['body'],
  sourceBodyFaces: faces.length,
  vertices: count,
  triangles: triangles.length / 3,
  bytes: buffer.length,
  mobile: {
    vertices: points.length,
    triangles: lowTriangles.length / 3,
    bytes: compact.length,
  },
  bounds: [0, 1, 2].map((k) => [
    Math.min(...smooth.map((v) => v[k])),
    Math.max(...smooth.map((v) => v[k])),
  ]),
  sourceBoundaryEdges: [...edges.values()].filter((e) => e.faces.length === 1)
    .length,
};
writeFileSync(
  'scripts/model-source/conversion-report.json',
  JSON.stringify(report, null, 2),
);
console.log(report);
