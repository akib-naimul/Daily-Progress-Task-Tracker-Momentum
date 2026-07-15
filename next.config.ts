import type { NextConfig } from "next";

// When building for the desktop (Electron) app we statically export the site and
// use relative asset paths so it can load from the local filesystem.
// Set via: BUILD_TARGET=desktop (see the "desktop:*" npm scripts).
const isDesktop = process.env.BUILD_TARGET === "desktop";

const nextConfig: NextConfig = isDesktop
  ? {
      output: "export",
      assetPrefix: "./",
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
