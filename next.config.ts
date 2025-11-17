import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Experimental features for better compatibility with transformers and chromadb
  // chromadb is marked as external so it's not bundled (it's a server-side package)
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers', 'chromadb'],
  },
};

export default nextConfig;
