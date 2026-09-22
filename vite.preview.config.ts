import { defineConfig } from 'vite';

// Preview exactly the static files that will be uploaded to COS, without
// loading Vinext's server middleware or requiring dist/server to be present.
export default defineConfig({
  appType: 'mpa',
  build: { outDir: 'dist/client' },
  preview: { host: '127.0.0.1', strictPort: true },
});
