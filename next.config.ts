import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unique-healthcare.duckdns.org',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // Falls back to the new domain if the environment variable isn't set.
    const backendUrl = process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_API_URL || 'https://unique-healthcare.duckdns.org/api')
      : 'http://127.0.0.1:8000/api';
      
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
