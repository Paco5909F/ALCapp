import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
