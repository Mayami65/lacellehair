import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // standalone output only during production build — breaks Turbopack routing in dev
  ...(isProd ? { output: "standalone" as const } : {}),
  serverExternalPackages: ["@libsql/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
