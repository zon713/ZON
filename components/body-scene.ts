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
  if (buffer.byteLength < 8) throw new Error('Invalid body model');
  const [count, indexCount] = new Uint32Array(buffer, 0, 2);
  if (
    !count ||
    !indexCount ||
    count > 65535 ||
    buffer.byteLength !== 8 + count * 12 + indexCount * 2
  )
    throw new Error('Invalid body model');
  const packed = new Int16Array(buffer, 8, count * 3),
    position = new Float32Array(count * 3);
  packed.forEach((v, i) => {
    position[i] = v / 10000;
  });
  const rollback: (() => void)[] = [];
  let initializationCleanup: (() => void) | undefined;
  try {
    const geometry = new THREE.BufferGeometry();
    rollback.push(() => geometry.dispose());
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
    rollback.push(() => renderer.dispose());
    rollback.push(() => renderer.domElement.remove());
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    host.appendChild(renderer.domElement);
    const overlay = document.createElement('div');
    rollback.push(() => overlay.remove());
    overlay.className = 'body-hotspots';
    host.appendChild(overlay);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(31, 1, 0.1, 20);
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox!;
    const centerY = (bounds.min.y + bounds.max.y) / 2;
    const halfHeight = (bounds.max.y - bounds.min.y) / 2;
    // A cylindrical envelope keeps both arms in view throughout a turn, even
    // while the host narrows to make room for the appointment panel.
    let horizontalRadius = 0;
    for (let i = 0; i < count; i++) {
      horizontalRadius = Math.max(
        horizontalRadius,
        Math.hypot(position[i * 3], position[i * 3 + 2]),
      );
    }
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
    rollback.push(() => material.dispose());
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
      const v =
        211 + Math.round(((Math.sin(i * 12.9898) * 43758.5453) % 1) * 12);
      grain.set([v, v, v, 255], i * 4);
    }
    const roughnessTexture = new THREE.DataTexture(grain, 128, 128);
    rollback.push(() => roughnessTexture.dispose());
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
    rollback.push(() => texture.dispose());
    texture.needsUpdate = true;
    const contactGeometry = new THREE.PlaneGeometry(1.5, 0.65);
    rollback.push(() => contactGeometry.dispose());
    const contactMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    rollback.push(() => contactMaterial.dispose());
    const contact = new THREE.Mesh(contactGeometry, contactMaterial);
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(0, -1.122, 0.1);
    body.add(contact);
    const ray = new THREE.Raycaster();
    const markers = bodyRegions.map((region) => {
      const direction = region.position[2] < 0 ? -1 : 1;
      ray.set(
        new THREE.Vector3(
          region.position[0],
          region.position[1],
          direction * 2,
        ),
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
      button.setAttribute('aria-label', '\u9009\u62e9' + region.label);
      button.setAttribute('data-region', region.id);
      button.setAttribute('aria-controls', 'body-result');
      button.setAttribute('aria-describedby', 'body-keyboard-help');
      button.title = region.label;
      const dot = document.createElement('span');
      dot.className = 'body-hotspot-dot';
      dot.style.position = 'relative';
      button.appendChild(dot);
      const label = document.createElement('span');
      label.className = 'body-hotspot-label';
      label.textContent = region.label;
      button.appendChild(label);
      // Pointer taps are handled once by end(); click retains native keyboard
      // and assistive-technology activation without reselecting after a drag.
      button.onclick = (event) => {
        if (event.detail === 0) select(region.id);
      };
      button.onpointerenter = (event) => {
        if (down || event.pointerType === 'touch') return;
        hovered = nearestScreenMarker(event)?.id ?? region.id;
        shade(selected, hovered);
        render();
      };
      button.onpointerleave = leave;
      overlay.appendChild(button);
      return {
        id: region.id,
        anchor,
        normal,
        button,
        dot,
        screen: new THREE.Vector2(),
      };
    });
    let disposed = false,
      selected: BodyRegionId | null = null,
      hovered: BodyRegionId | null = null,
      frame = 0,
      slowFrames = 0;
    let down: {
      pointerId: number;
      x: number;
      y: number;
      rotation: number;
      axis: 'horizontal' | 'vertical' | null;
      marker: BodyRegionId | null;
    } | null = null;
    let viewport = { width: 1, height: 1 };
    const base = new THREE.Color('#d4dbdd'),
      active = new THREE.Color('#4d9174');
    function shade(id: BodyRegionId | null, hover: BodyRegionId | null = null) {
      const selectedMarker = markers.find((marker) => marker.id === id);
      const hoverMarker = markers.find((marker) => marker.id === hover);
      const wide =
        id !== null && ['back', 'chest', 'abdomen', 'waist'].includes(id);
      const rx = wide ? 0.22 : 0.095,
        ry = wide ? 0.23 : 0.13,
        rz = wide ? 0.11 : 0.09;
      for (let i = 0; i < count; i++) {
        const x = position[i * 3],
          y = position[i * 3 + 1],
          z = position[i * 3 + 2];
        const distance = selectedMarker
          ? ((x - selectedMarker.anchor.x) / rx) ** 2 +
            ((y - selectedMarker.anchor.y) / ry) ** 2 +
            ((z - selectedMarker.anchor.z) / rz) ** 2
          : Infinity;
        let weight = selectedMarker ? Math.exp(-distance * 1.5) * 0.94 : 0;
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
        marker.button.setAttribute('aria-expanded', String(marker.id === id));
      });
    }
    function render() {
      if (disposed) return;
      const began = performance.now();
      scene.updateMatrixWorld(true);
      const { width, height } = viewport;
      markers.forEach((marker) => {
        const world = marker.anchor.clone().applyMatrix4(body.matrixWorld),
          normal = marker.normal.clone().transformDirection(body.matrixWorld);
        const front =
          normal.dot(camera.position.clone().sub(world).normalize()) > 0.18;
        const projected = world.project(camera);
        marker.button.hidden =
          !front || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1;
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        marker.screen.set(x, y);
        const padding = Math.min(23, width / 2);
        const targetX = Math.max(padding, Math.min(width - padding, x));
        const targetY = Math.max(23, Math.min(height - 23, y));
        // Keep visible dots at their anatomical anchors. Only transparent 44px
        // targets are clamped inside the host; overlapping targets use distance
        // to the actual dot instead of DOM stacking order in start().
        marker.button.style.transform = `translate(${targetX}px,${targetY}px) translate(-50%,-50%)`;
        marker.dot.style.left = `${x - targetX}px`;
        marker.dot.style.top = `${y - targetY}px`;
      });
      try {
        renderer.render(scene, camera);
      } catch {
        fail();
        return;
      }
      // Sustained slow rendering switches to the same complete text experience.
      slowFrames = performance.now() - began > 120 ? slowFrames + 1 : 0;
      if (slowFrames >= 3)
        queueMicrotask(() => {
          if (!disposed) fail();
        });
    }
    function resize() {
      if (disposed) return;
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      viewport = { width, height };
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distance =
        Math.max(
          halfHeight / tangent,
          horizontalRadius / (tangent * camera.aspect),
        ) *
          1.12 +
        horizontalRadius;
      camera.position.set(0, centerY, distance);
      camera.lookAt(0, centerY, 0);
      camera.far = Math.max(20, distance + horizontalRadius * 3);
      camera.updateProjectionMatrix();
      render();
    }
    const observer = new ResizeObserver(resize);
    rollback.push(() => observer.disconnect());
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
    function nearestScreenMarker(
      event: PointerEvent,
    ): (typeof markers)[number] | null {
      const rect = host.getBoundingClientRect();
      const point = new THREE.Vector2(
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
      let nearest: (typeof markers)[number] | null = null;
      let minimum = Infinity;
      markers.forEach((marker) => {
        if (marker.button.hidden) return;
        const distance = marker.screen.distanceToSquared(point);
        if (distance < minimum) {
          minimum = distance;
          nearest = marker;
        }
      });
      return nearest;
    }
    function start(event: PointerEvent) {
      if (disposed || down || !event.isPrimary || event.button !== 0) return;
      const target = event.target;
      const marker = markers.find((item) =>
        target instanceof Node ? item.button.contains(target) : false,
      );
      if (target !== canvas && !marker) return;
      cancelAnimationFrame(frame);
      frame = 0;
      hovered = null;
      shade(selected);
      down = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        rotation: body.rotation.y,
        axis: null,
        marker: marker ? (nearestScreenMarker(event)?.id ?? marker.id) : null,
      };
    }
    function move(event: PointerEvent) {
      if (disposed) return;
      if (down) {
        if (event.pointerId !== down.pointerId) return;
        const dx = event.clientX - down.x;
        const dy = event.clientY - down.y;
        if (!down.axis && Math.hypot(dx, dy) > 8) {
          // Delay capture until horizontal intent is clear. pan-y stays native
          // and a browser-cancelled scroll can never select or rotate the body.
          down.axis =
            Math.abs(dx) > Math.abs(dy) * 1.15 ? 'horizontal' : 'vertical';
          if (down.axis === 'horizontal') {
            try {
              canvas.setPointerCapture(event.pointerId);
            } catch {
              cancel(event);
              return;
            }
            canvas.style.cursor = 'grabbing';
          }
        }
        if (down.axis === 'horizontal') {
          body.rotation.y = down.rotation + dx * 0.009;
          render();
        }
        return;
      }
      if (event.pointerType === 'touch') return;
      if (!(event.target instanceof Node) || !host.contains(event.target)) {
        leave();
        return;
      }
      if (event.target !== canvas) return;
      const next = pick(event);
      if (next !== hovered) {
        hovered = next;
        shade(selected, hovered);
        canvas.style.cursor = hovered ? 'pointer' : 'grab';
        render();
      }
    }
    function end(event: PointerEvent) {
      if (!down || event.pointerId !== down.pointerId) return;
      const gesture = down;
      down = null;
      const moved =
        Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8;
      release(event.pointerId);
      if (!gesture.axis && !moved) {
        const id = gesture.marker ?? pick(event);
        if (id) {
          select(id);
          markers
            .find((marker) => marker.id === id)
            ?.button.focus({ preventScroll: true });
        }
      }
    }
    function leave() {
      if (!down && hovered) {
        hovered = null;
        shade(selected);
        canvas.style.cursor = 'grab';
        render();
      }
    }
    function release(pointerId: number) {
      try {
        if (canvas.hasPointerCapture(pointerId))
          canvas.releasePointerCapture(pointerId);
      } catch {
        // A native scroll cancellation may already have retired this pointer.
      }
      canvas.style.cursor = 'grab';
    }
    function cancel(event?: PointerEvent) {
      if (!down || (event && event.pointerId !== down.pointerId)) return;
      const pointerId = down.pointerId;
      down = null;
      release(pointerId);
    }
    function contextLost(event: Event) {
      event.preventDefault();
      fail();
    }
    function fail() {
      if (disposed) return;
      dispose();
      unavailable();
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      cancel();
      observer.disconnect();
      signal.removeEventListener('abort', dispose);
      host.removeEventListener('pointerdown', start);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('lostpointercapture', cancel);
      host.removeEventListener('pointerleave', leave);
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
    }
    initializationCleanup = dispose;
    canvas.style.touchAction = 'pan-y';
    overlay.style.touchAction = 'pan-y';
    host.addEventListener('pointerdown', start);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', cancel);
    canvas.addEventListener('lostpointercapture', cancel);
    host.addEventListener('pointerleave', leave);
    canvas.addEventListener('webglcontextlost', contextLost);
    signal.addEventListener('abort', dispose, { once: true });
    shade(selected);
    resize();
    if (disposed) throw new Error('Body scene unavailable');
    return {
      choose(id: BodyRegionId | null) {
        if (disposed) return;
        selected = id;
        hovered = null;
        shade(id);
        render();
      },
      turn(back: boolean) {
        if (disposed) return;
        cancel();
        cancelAnimationFrame(frame);
        frame = 0;
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
          if (disposed) return;
          const t = Math.min((performance.now() - time) / 420, 1);
          body.rotation.y = start + delta * (1 - (1 - t) ** 3);
          render();
          frame = t < 1 && !disposed ? requestAnimationFrame(tick) : 0;
        }
        frame = requestAnimationFrame(tick);
      },
      dispose,
    };
  } catch (error) {
    // Loading may fail after WebGL construction but before interaction setup.
    // Free every resource allocated so far before the caller offers a retry.
    if (initializationCleanup) initializationCleanup();
    else
      rollback.reverse().forEach((cleanup) => {
        try {
          cleanup();
        } catch {
          /* Continue releasing the other resources. */
        }
      });
    throw error;
  }
}
