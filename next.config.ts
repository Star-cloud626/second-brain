import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Experimental features for better compatibility with transformers
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers'],
  },
};

export default nextConfig;
