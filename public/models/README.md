# MakeHuman hm08 neutral body guide

`hym-human.bin` is a locally converted derivative of the MakeHuman Community hm08 core graphics asset, explicitly released under CC0. It is a neutral matte medical service-navigation illustration, not a diagnostic anatomical reference. No remote model is requested at runtime.

Source: https://github.com/makehumancommunity/makehuman/blob/3c701a8e52f09e69922e8b598d23be2d7dfc49e3/makehuman/data/3dobjs/base.obj

The OBJ header explicitly records its September 2020 CC0 release and the original rights holders (Data Collection AB, Joel Palmius, Jonas Hauquier). Official asset policy: https://static.makehumancommunity.org/about/license.html

Input and full CC0 license are retained in `scripts/model-source/base.obj` and `scripts/model-source/LICENSE.ASSETS.md`. The MakeHuman application code is separately AGPL; no application code is embedded or copied. Our converter is original repository code.

Source SHA256: `8e761e6624b8f54536409135d1636da63b32486a90d4897f84e121d144f6fb4c`.

Regenerate with `node scripts/convert-makehuman.mjs`; verify with `node scripts/check-body-mesh.mjs`. Only the `body` group is retained; all `helper-*` and `joint-*` groups are excluded. Shared indexed topology receives one Catmull-Clark pass and freshly averaged vertex normals. The source proportions and face are retained, with normalization to the guide's existing height.

Desktop geometry: 53,514 vertices, 107,024 triangles, 1,284,320 bytes (under the 1.5 MB activated-only budget). A viewport at most 760px loads the source-resolution `hym-human-mobile.bin` instead: 13,380 vertices, 26,756 triangles, 321,104 bytes. Both have indexed smooth normals and the same natural body proportions. Rendering is pixel-ratio capped and demand-driven; sustained slow frames fall back to text controls. The ten anchors are checked against both surfaces after replacement.

Binary layout (little endian): vertex count and index count (two Uint32), xyz position (Int16, scale 1/10000), xyz normal (normalized Int16), triangle index (Uint16). The browser decodes this local file only after the user enables 3D. Three.js licensing is retained separately in `docs/THREE-LICENSE.txt`.
