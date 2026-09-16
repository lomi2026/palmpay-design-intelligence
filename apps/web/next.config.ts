import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? (process.env.DESIGN_VARIANT === 'studio' ? '.next-studio' : '.next'),
  // Business data must be fetched again on navigation; image caching is independent.
  experimental: {
    serverActions: { bodySizeLimit: '108mb' },
    staleTimes: {
      dynamic: 0,
      static: 30,
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
