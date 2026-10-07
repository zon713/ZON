import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const file = readFileSync('public/models/hym-human.bin');
const buffer = file.buffer.slice(
  file.byteOffset,
  file.byteOffset + file.byteLength,
);
const [vertices, indexCount] = new Uint32Array(buffer, 0, 2);
assert.equal(buffer.byteLength, 8 + vertices * 12 + indexCount * 2);
const positions = new Int16Array(buffer, 8, vertices * 3),
  normals = new Int16Array(buffer, 8 + vertices * 6, vertices * 3),
  indices = new Uint16Array(buffer, 8 + vertices * 12, indexCount);
const parents = Array.from({ length: vertices }, (_, i) => i),
  edges = new Map();
function root(i) {
  while (parents[i] !== i) {
    parents[i] = parents[parents[i]];
    i = parents[i];
  }
  return i;
}
for (let i = 0; i < indexCount; i += 3) {
  const triangle = Array.from(indices.slice(i, i + 3));
  assert(triangle.every((v) => v < vertices));
  assert.equal(new Set(triangle).size, 3);
  for (let j = 0; j < 3; j++) {
    const a = triangle[j],
      b = triangle[(j + 1) % 3];
    parents[root(a)] = root(b);
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    edges.set(key, (edges.get(key) ?? 0) + 1);
  }
}
assert.equal(
  new Set(parents.map((_, i) => root(i))).size,
  1,
  'Head, trunk, arms and legs must share one connected surface',
);
assert(
  [...edges.values()].every((count) => count === 2),
  'The sculpt must be closed with no seam boundaries',
);
let low = Infinity,
  high = -Infinity;
for (let i = 0; i < vertices; i++) {
  const length = Math.hypot(...normals.slice(i * 3, i * 3 + 3)) / 32767;
  assert(Math.abs(length - 1) < 0.001);
  low = Math.min(low, positions[i * 3 + 1] / 10000);
  high = Math.max(high, positions[i * 3 + 1] / 10000);
}
assert(
  low < -1.1 && high > 1.65,
  'Entire head and both feet must be preserved',
);
assert(file.length < 800000, 'Keep the on-demand mobile mesh compact');
console.log(
  JSON.stringify({
    connectedSurfaces: 1,
    closedSurface: true,
    normalizedNormals: true,
    vertices,
    triangles: indexCount / 3,
    bytes: file.length,
    bounds: [low, high],
  }),
);
