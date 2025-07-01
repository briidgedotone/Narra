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
        hostname: "*.cdninstagram.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
        port: "",
        pathname: "/**",
      },
      // TikTok CDN domains - comprehensive patterns
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
        hostname: "*.tiktokcdn-eu.com",
        port: "",
        pathname: "/**",
      },
      // Specific TikTok CDN patterns for signed URLs
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
      {
        protocol: "https",
        hostname: "p16-pu-sign-no.tiktokcdn-eu.com",
        port: "",
        pathname: "/**",
      },
      // 🔧 FIX: Add missing TikTok CDN patterns
      {
        protocol: "https",
        hostname: "p19-sign.tiktokcdn-us.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "p16-common-sign-sg.tiktokcdn-us.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
