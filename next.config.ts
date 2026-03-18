import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  async rewrites() {
    // Falls back to the hardcoded IP if the environment variable isn't set.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://140.245.9.90/api';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
