import * as THREE from 'three';
import { bodyRegions, type BodyRegionId } from '../lib/body-regions';

export async function mountBodyScene(
  host: HTMLElement,
  select: (id: BodyRegionId) => void,
  unavailable: () => void,
  signal: AbortSignal,
) {
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const response = await fetch(
    compact ? '/models/hym-human-mobile.bin' : '/models/hym-human.bin',
    { signal },
  );
  if (!response.ok) throw new Error('Body model unavailable');
  const buffer = await response.arrayBuffer();
  signal.throwIfAborted();
  const [count, indexCount] = new Uint32Array(buffer, 0, 2);
  if (count > 65535 || buffer.byteLength !== 8 + count * 12 + indexCount * 2)
    throw new Error('Invalid body model');
  const packed = new Int16Array(buffer, 8, count * 3),
    position = new Float32Array(count * 3);
  packed.forEach((v, i) => {
    position[i] = v / 10000;
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(
      new Int16Array(buffer, 8 + count * 6, count * 3),
      3,
      true,
    ),
  );
  geometry.setIndex(
    new THREE.BufferAttribute(
      new Uint16Array(buffer, 8 + count * 12, indexCount),
      1,
    ),
  );
  const colors = new Float32Array(count * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  host.appendChild(renderer.domElement);
  const overlay = document.createElement('div');
  overlay.className = 'body-hotspots';
  host.appendChild(overlay);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(31, 1, 0.1, 20);
  camera.position.set(0, 0.3, 5.6);
  camera.lookAt(0, 0.27, 0);
  scene.add(new THREE.HemisphereLight(0xf5f8ff, 0xa5b0b4, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(-3.8, 3.4, 2.6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe2eeff, 1.1);
  fill.position.set(3, 1, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.5);
  rim.position.set(1.7, 2.6, -3);
  scene.add(rim);
  const body = new THREE.Group();
  scene.add(body);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.82,
    metalness: 0,
    clearcoat: 0,
    clearcoatRoughness: 1,
  });
  // Local micro-grain roughness, subtle enough to read as matte cast mineral.
  const uv = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    uv[i * 2] =
      Math.atan2(position[i * 3 + 2], position[i * 3]) / (Math.PI * 2) + 0.5;
    uv[i * 2 + 1] = (position[i * 3 + 1] + 1.17) / 2.9;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const grain = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < 128 * 128; i++) {
    const v = 211 + Math.round(((Math.sin(i * 12.9898) * 43758.5453) % 1) * 12);
    grain.set([v, v, v, 255], i * 4);
  }
  const roughnessTexture = new THREE.DataTexture(grain, 128, 128);
  roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.repeat.set(5, 8);
  roughnessTexture.needsUpdate = true;
  material.roughnessMap = roughnessTexture;
  const surface = new THREE.Mesh(geometry, material);
  body.add(surface);
  // Compact, smoothly transparent contact shadows only. Removing the long
  // directional projection avoids the shadow-frustum/receiver rectangle.
  const pixels = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4;
      pixels[i] = 45;
      pixels[i + 1] = 78;
      pixels[i + 2] = 64;
      const edgeFade = Math.min(x, y, 63 - x, 63 - y, 8) / 8;
      const left = Math.exp(-((x - 15.5) ** 2 / 48 + (y - 31.5) ** 2 / 110));
      const right = Math.exp(-((x - 47.5) ** 2 / 48 + (y - 31.5) ** 2 / 110));
      pixels[i + 3] = Math.round((left + right) * 28 * edgeFade * edgeFade);
    }
  const texture = new THREE.DataTexture(pixels, 64, 64);
  texture.needsUpdate = true;
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.65),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, -1.122, 0.1);
  body.add(contact);
  const ray = new THREE.Raycaster();
  const markers = bodyRegions.map((region) => {
    const direction = region.position[2] < 0 ? -1 : 1;
    ray.set(
      new THREE.Vector3(region.position[0], region.position[1], direction * 2),
      new THREE.Vector3(0, 0, -direction),
    );
    const hit = ray.intersectObject(surface)[0];
    const anchor = hit
      ? hit.point.clone()
      : new THREE.Vector3(
          region.position[0],
          region.position[1],
          region.position[2],
        );
    const normal =
      hit?.face?.normal.clone() ?? new THREE.Vector3(0, 0, direction);
    anchor.addScaledVector(normal, 0.006);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'body-hotspot';
    button.setAttribute('aria-label', '选择' + region.label);
    button.title = region.label;
    const dot = document.createElement('span');
    dot.className = 'body-hotspot-dot';
    button.appendChild(dot);
    const label = document.createElement('span');
    label.className = 'body-hotspot-label';
    label.textContent = region.label;
    button.appendChild(label);
    button.onclick = () => select(region.id);
    button.onpointerdown = start;
    button.onpointerenter = () => {
      hovered = region.id;
      shade(selected, hovered);
      render();
    };
    button.onpointerleave = leave;
    overlay.appendChild(button);
    return { id: region.id, anchor, normal, button };
  });
  let disposed = false,
    selected: BodyRegionId = 'back',
    hovered: BodyRegionId | null = null,
    frame = 0,
    slowFrames = 0;
  let down: { x: number; y: number; rotation: number; moved: boolean } | null =
    null;
  const base = new THREE.Color('#d4dbdd'),
    active = new THREE.Color('#4d9174');
  function shade(id: BodyRegionId, hover: BodyRegionId | null = null) {
    const selectedMarker = markers.find((marker) => marker.id === id)!;
    const hoverMarker = markers.find((marker) => marker.id === hover);
    const wide = ['back', 'chest', 'abdomen', 'waist'].includes(id);
    const rx = wide ? 0.22 : 0.095,
      ry = wide ? 0.23 : 0.13,
      rz = wide ? 0.11 : 0.09;
    for (let i = 0; i < count; i++) {
      const x = position[i * 3],
        y = position[i * 3 + 1],
        z = position[i * 3 + 2];
      const distance =
        ((x - selectedMarker.anchor.x) / rx) ** 2 +
        ((y - selectedMarker.anchor.y) / ry) ** 2 +
        ((z - selectedMarker.anchor.z) / rz) ** 2;
      let weight = Math.exp(-distance * 1.5) * 0.94;
      if (hoverMarker) {
        const p = hoverMarker.anchor;
        weight = Math.max(
          weight,
          Math.exp(
            -((x - p.x) ** 2 + (y - p.y) ** 2 + (z - p.z) ** 2) / 0.008,
          ) * 0.25,
        );
      }
      colors[i * 3] = base.r + (active.r - base.r) * weight;
      colors[i * 3 + 1] = base.g + (active.g - base.g) * weight;
      colors[i * 3 + 2] = base.b + (active.b - base.b) * weight;
    }
    geometry.attributes.color.needsUpdate = true;
    markers.forEach((marker) => {
      marker.button.setAttribute('aria-pressed', String(marker.id === id));
    });
  }
  function render() {
    if (disposed) return;
    const began = performance.now();
    scene.updateMatrixWorld(true);
    const { width, height } = host.getBoundingClientRect();
    markers.forEach((marker) => {
      const world = marker.anchor.clone().applyMatrix4(body.matrixWorld),
        normal = marker.normal.clone().transformDirection(body.matrixWorld);
      const front =
        normal.dot(camera.position.clone().sub(world).normalize()) > 0.18;
      const projected = world.project(camera);
      marker.button.hidden =
        !front || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1;
      marker.button.style.transform =
        'translate(' +
        (projected.x * 0.5 + 0.5) * width +
        'px,' +
        (-projected.y * 0.5 + 0.5) * height +
        'px) translate(-50%,-50%)';
    });
    renderer.render(scene, camera);
    // Sustained slow rendering switches to the same complete text experience.
    slowFrames = performance.now() - began > 120 ? slowFrames + 1 : 0;
    if (slowFrames >= 3)
      queueMicrotask(() => {
        if (!disposed) unavailable();
      });
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
  const canvas = renderer.domElement;
  function pick(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    );
    const hit = ray.intersectObject(surface)[0];
    if (!hit) return null;
    const local = body.worldToLocal(hit.point.clone());
    let nearest: BodyRegionId | null = null,
      minimum = 0.22;
    markers.forEach((marker) => {
      if (marker.button.hidden) return;
      const distance = local.distanceTo(marker.anchor);
      if (distance < minimum) {
        minimum = distance;
        nearest = marker.id;
      }
    });
    return nearest;
  }
  function start(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(frame);
    down = {
      x: event.clientX,
      y: event.clientY,
      rotation: body.rotation.y,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (down) {
      const dx = event.clientX - down.x;
      if (Math.hypot(dx, event.clientY - down.y) > 8) down.moved = true;
      if (down.moved) {
        body.rotation.y = down.rotation + dx * 0.009;
        render();
      }
      return;
    }
    const next = pick(event);
    if (next !== hovered) {
      hovered = next;
      shade(selected, hovered);
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
      render();
    }
  }
  function end(event: PointerEvent) {
    if (!down) return;
    if (!down.moved) {
      const id = pick(event);
      if (id) select(id);
    }
    down = null;
  }
  function leave() {
    if (!down && hovered) {
      hovered = null;
      shade(selected);
      render();
    }
  }
  function cancel() {
    down = null;
  }
  function contextLost(event: Event) {
    event.preventDefault();
    unavailable();
  }
  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('pointerleave', leave);
  canvas.addEventListener('webglcontextlost', contextLost);
  shade(selected);
  resize();
  return {
    choose(id: BodyRegionId) {
      selected = id;
      shade(id);
      render();
    },
    turn(back: boolean) {
      cancelAnimationFrame(frame);
      const target = back ? Math.PI : 0;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        body.rotation.y = target;
        render();
        return;
      }
      const start = body.rotation.y,
        time = performance.now();
      const delta = Math.atan2(
        Math.sin(target - start),
        Math.cos(target - start),
      );
      function tick() {
        const t = Math.min((performance.now() - time) / 420, 1);
        body.rotation.y = start + delta * (1 - (1 - t) ** 3);
        render();
        if (t < 1 && !disposed) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('webglcontextlost', contextLost);
      geometry.dispose();
      material.dispose();
      contact.geometry.dispose();
      contact.material.dispose();
      texture.dispose();
      roughnessTexture.dispose();
      renderer.dispose();
      canvas.remove();
      overlay.remove();
    },
  };
}
