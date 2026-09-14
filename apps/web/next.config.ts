import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? (process.env.DESIGN_VARIANT === 'studio' ? '.next-studio' : '.next'),
  // Workspace pages are dynamic because every response is permission-scoped.
  // Keep recently visited page segments in the browser long enough for normal
  // work flows (catalog -> detail -> catalog, or admin tab changes) to avoid
  // another Vercel -> Render round trip. Server-side authorization is still
  // enforced whenever a new request is required.
  experimental: {
    serverActions: { bodySizeLimit: '108mb' },
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lomi2026.github.io',
        pathname: '/palmpay-design-intelligence/assets/**',
      },
    ],
  },
};

export default nextConfig;
