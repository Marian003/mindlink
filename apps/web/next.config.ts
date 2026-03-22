import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.CI ? "standalone" : undefined,
  transpilePackages: ["@mindlink/ui", "@mindlink/types", "@mindlink/agents", "@mindlink/config"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "mindlink-web.vercel.app",
        process.env.NEXT_PUBLIC_APP_URL ?? "",
      ].filter(Boolean),
    },
  },
  // Bundle analyzer support (enabled by ANALYZE=true env var)
  ...(process.env.ANALYZE === "true"
    ? { webpack: (config: any) => { config.plugins.push(require("@next/bundle-analyzer")({ enabled: true })({})); return config; } }
    : {}),
};

export default nextConfig;
