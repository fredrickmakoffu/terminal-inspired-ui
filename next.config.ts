import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/terminal-inspired-ui',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
