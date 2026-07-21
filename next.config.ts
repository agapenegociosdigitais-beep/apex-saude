import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: monorepo warning — há outro package-lock.json em C:\Users\benja
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
    ],
  },
};

export default nextConfig;
