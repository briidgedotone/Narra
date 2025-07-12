/**
 * Proxy Instagram images through our API to avoid CORS issues
 */
export function proxyInstagramImage(imageUrl: string): string {
  if (!imageUrl) return imageUrl;

  // Only proxy Instagram CDN images
  if (imageUrl.includes("cdninstagram.com") || imageUrl.includes("fbcdn.net")) {
    return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}&platform=instagram`;
  }

  return imageUrl;
}

/**
 * Proxy image URLs through our API to handle CORS and caching
 */
export const proxyImage = (
  url: string | undefined,
  platform: "tiktok" | "instagram",
  isAvatar = false
): string => {
  // Return appropriate fallback for undefined URLs
  if (!url) {
    return isAvatar ? "/placeholder-avatar.jpg" : "/placeholder-post.jpg";
  }

  // Don't proxy local URLs or data URLs
  if (
    url.startsWith("/") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // For TikTok videos, don't proxy the URL (contains expiring signatures)
  if (platform === "tiktok" && url.includes("video")) {
    return url;
  }

  // For Instagram images and TikTok thumbnails, proxy through our API
  return `/api/proxy-image?url=${encodeURIComponent(url)}&platform=${platform}`;
};
