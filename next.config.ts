import type { NextConfig } from 'next';

// The clinic directory is entirely browser-side.  Export it as static files so
// it can be hosted from Tencent Cloud COS without a Node/Worker runtime.
const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
