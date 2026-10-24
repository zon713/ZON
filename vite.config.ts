import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// Static export for the existing hosting service; no private hosting settings.
export default defineConfig({
  // WeChat can retain an older Chromium/X5 engine despite an up-to-date app.
  build: { target: 'es2018', cssTarget: 'chrome70' },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [vinext()],
  server:
    process.env.CODEX_SANDBOX === 'seatbelt'
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
});
