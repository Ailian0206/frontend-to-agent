import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/frontend-to-agent" : "",
  assetPrefix: isGitHubPages ? "/frontend-to-agent/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
