import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // the board is kanvas's static site in public/canvas (kanvas.config.ts)
      { source: "/canvas", destination: "/canvas/index.html", permanent: false },
      // a board's link from before kanvas: its scene, the hash, comes along. Only a
      // board's name (no dot), so the site's own files (index.html, manifest.json) aren't caught
      { source: "/canvas/:board([a-z0-9-]+)", destination: "/canvas/index.html?board=:board", permanent: false },
    ];
  },
};

export default nextConfig;
