import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
