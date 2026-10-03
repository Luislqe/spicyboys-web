import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `STATIC_EXPORT=1 npm run build` → fully static site in /out (any static host).
  ...(process.env.STATIC_EXPORT ? { output: "export" as const, images: { unoptimized: true } } : {}),
};

export default nextConfig;
