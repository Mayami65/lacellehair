import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // standalone output only during production build — breaks Turbopack routing in dev
  ...(isProd ? { output: "standalone" as const } : {}),
  // Prevent Turbopack from bundling these — env var reads must resolve at runtime
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
