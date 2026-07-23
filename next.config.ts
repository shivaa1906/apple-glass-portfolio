import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The Instagram profile avatar and media URLs come from Meta CDN hosts, so allow those
    // external domains to be rendered by Next Image without changing the existing UI.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.instagram.com",
      },
      {
        protocol: "https",
        hostname: "*.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "*.ggpht.com",
      },
      {
        protocol: "https",
        hostname: "*.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "*.discord.com",
      },
    ],
  },
};

export default nextConfig;
