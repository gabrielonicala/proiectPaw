import type { NextConfig } from "next";

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Disable Turbopack to avoid ENOENT errors on Windows
    turbo: {
      // Add some stability options
      resolveAlias: {},
    },
  },
  // Add webpack configuration to handle file watching issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve file watching on Windows
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
