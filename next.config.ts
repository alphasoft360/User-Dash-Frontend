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
    return [
      {
        source: '/api/proxy/global/:path*',
        destination: 'http://140.245.9.90/api/:path*',
      },
      {
        source: '/api/proxy/tenant/:slug/:path*',
        destination: 'http://140.245.9.90/:slug/:path*',
      },
      {
        source: '/api/proxy/assets/:path*',
        destination: 'http://140.245.9.90/:path*',
      },
    ];
  },
};

export default nextConfig;
