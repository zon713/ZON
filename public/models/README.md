# Original HYM human guide mesh

`hym-human.bin` is an original, neutral human-shaped sculpt generated for this repository. No third-party human model, texture, remote resource or paid asset is included. It has no exposed anatomy or sexual features and is not a diagnostic anatomical reference.

Regenerate with `node scripts/generate-body-mesh.mjs`; verify topology with `node scripts/check-body-mesh.mjs`. The single closed indexed surface joins the head, neck, shoulders, torso, arms, pelvis, legs and feet. Smooth normals come from the implicit field gradient, independent of tessellation.

Binary layout (little endian): vertex count and index count (two Uint32), xyz position (Int16, scale 1/10000), xyz normal (normalized Int16), triangle index (Uint16). The browser decodes this local file only after the user enables 3D. Three.js licensing is retained separately in `docs/THREE-LICENSE.txt`.
