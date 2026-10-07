import * as THREE from 'three';
import { bodyRegions, type BodyRegionId } from '../lib/body-regions';

// Original, stylized human surface built from anatomical cross-sections.
// No external model, texture, CDN or user-data request is used.
export function mountBodyScene(
  host: HTMLElement,
  select: (id: BodyRegionId) => void,
  unavailable: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 20);
  camera.position.set(0, 0.15, 5.5);
  camera.lookAt(0, 0.15, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x708c85, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-3, 4, 4);
  scene.add(light);
  const body = new THREE.Group();
  scene.add(body);
  const material = new THREE.MeshStandardMaterial({
    color: 0xc9dfd8,
    roughness: 0.57,
    metalness: 0.08,
  });
  const surfaces: THREE.Mesh[] = [];
  function surface(rows: number[][], offsetX = 0) {
    const vertices: number[] = [],
      indices: number[] = [];
    const segments = 32;
    rows.forEach(([y, width, depth, x = 0, z = 0]) => {
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        vertices.push(
          offsetX + x + Math.cos(angle) * width,
          y,
          z + Math.sin(angle) * depth,
        );
      }
    });
    for (let i = 0; i < rows.length - 1; i++)
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j,
          b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    body.add(mesh);
    surfaces.push(mesh);
  }
  surface([
    [0.15, 0, 0],
    [0.19, 0.19, 0.14],
    [0.3, 0.25, 0.18],
    [0.45, 0.23, 0.17],
    [0.6, 0.23, 0.17],
    [0.8, 0.29, 0.2],
    [0.95, 0.34, 0.19],
    [1.04, 0.3, 0.16],
    [1.1, 0.12, 0.1],
    [1.22, 0.09, 0.09],
    [1.25, 0, 0],
  ]);
  surface([
    [1.19, 0, 0],
    [1.24, 0.08, 0.09],
    [1.3, 0.13, 0.13],
    [1.4, 0.16, 0.15],
    [1.55, 0.16, 0.15],
    [1.65, 0.12, 0.12],
    [1.7, 0, 0],
  ]);
  // Subtle nose gives a clear front orientation, without exposed anatomy.
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), material);
  nose.scale.set(0.025, 0.035, 0.045);
  nose.position.set(0, 1.44, 0.145);
  body.add(nose);
  surfaces.push(nose);
  for (const sign of [-1, 1]) {
    surface([
      [0.02, 0, 0, sign * 0.57],
      [0.06, 0.055, 0.035, sign * 0.57],
      [0.18, 0.065, 0.045, sign * 0.55],
      [0.28, 0.05, 0.045, sign * 0.53],
      [0.47, 0.065, 0.065, sign * 0.49],
      [0.62, 0.07, 0.07, sign * 0.46],
      [0.83, 0.085, 0.085, sign * 0.4],
      [0.98, 0.1, 0.1, sign * 0.33],
      [1.04, 0, 0, sign * 0.3],
    ]);
    surface(
      [
        [-1.17, 0, 0],
        [-1.13, 0.08, 0.17, 0, 0.06],
        [-1.04, 0.07, 0.09],
        [-0.86, 0.075, 0.08],
        [-0.7, 0.105, 0.105],
        [-0.49, 0.085, 0.085],
        [-0.29, 0.11, 0.12],
        [-0.04, 0.14, 0.14],
        [0.16, 0.14, 0.14],
        [0.25, 0, 0],
      ],
      sign * 0.15,
    );
  }
  const markers = bodyRegions.map((region) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.047, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0x28766a,
        emissive: 0x123f35,
        emissiveIntensity: 0.4,
      }),
    );
    mesh.position.set(
      region.position[0],
      region.position[1],
      region.position[2],
    );
    mesh.userData.region = region.id;
    body.add(mesh);
    return mesh;
  });
  const ray = new THREE.Raycaster();
  let disposed = false,
    down: { x: number; y: number; rotation: number; moved: boolean } | null =
      null;
  function render() {
    if (!disposed) renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const canvas = renderer.domElement;
  function start(event: PointerEvent) {
    if (!event.isPrimary) return;
    down = {
      x: event.clientX,
      y: event.clientY,
      rotation: body.rotation.y,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (!down) return;
    const dx = event.clientX - down.x;
    if (Math.hypot(dx, event.clientY - down.y) > 8) down.moved = true;
    if (down.moved) {
      body.rotation.y = down.rotation + dx * 0.012;
      render();
    }
  }
  function end(event: PointerEvent) {
    if (!down) return;
    if (!down.moved) {
      const rect = canvas.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      // Hit-test against surfaces too: back markers cannot be clicked through the torso.
      const hit = ray.intersectObjects([...markers, ...surfaces])[0];
      if (hit?.object.userData.region)
        select(hit.object.userData.region as BodyRegionId);
    }
    down = null;
  }
  function cancel() {
    down = null;
  }
  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', cancel);
  function contextLost(event: Event) {
    event.preventDefault();
    unavailable();
  }
  canvas.addEventListener('webglcontextlost', contextLost);
  return {
    choose(id: BodyRegionId) {
      markers.forEach((marker) => {
        const active = marker.userData.region === id;
        marker.scale.setScalar(active ? 1.65 : 1);
        marker.material.color.set(active ? 0xe69a47 : 0x28766a);
      });
      render();
    },
    turn(back: boolean) {
      body.rotation.y = back ? Math.PI : 0;
      render();
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('webglcontextlost', contextLost);
      [...surfaces, ...markers].forEach((mesh) => mesh.geometry.dispose());
      markers.forEach((mesh) => mesh.material.dispose());
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
