import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
    // Falls back to the hardcoded IP if the environment variable isn't set.
    const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://140.245.9.90';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendHost}/:path*`,
      },
    ];
  },
};

export default nextConfig;
