import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
      // Add domains for social media platforms when integrating with ScrapeCreators
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
        port: "",
        pathname: "/**",
      },
      // TikTok CDN domains - specific patterns
      {
        protocol: "https",
        hostname: "*.tiktokcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn-us.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "p16-pu-sign-useast8.tiktokcdn-us.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "p19-pu-sign-useast8.tiktokcdn-us.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
