import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace pages are dynamic because every response is permission-scoped.
  // Keep recently visited page segments in the browser briefly so normal
  // back-and-forth navigation does not repeat a Vercel -> Render round trip.
  experimental: {
    staleTimes: {
      dynamic: 20,
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
