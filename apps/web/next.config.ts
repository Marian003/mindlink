import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mindlink/ui", "@mindlink/types", "@mindlink/agents", "@mindlink/config"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Bundle analyzer support (enabled by ANALYZE=true env var)
  ...(process.env.ANALYZE === "true"
    ? { webpack: (config: any) => { config.plugins.push(require("@next/bundle-analyzer")({ enabled: true })({})); return config; } }
    : {}),
};

export default nextConfig;
