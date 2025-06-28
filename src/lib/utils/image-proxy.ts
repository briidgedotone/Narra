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
 * Proxy any external image through our API
 */
export function proxyImage(
  imageUrl: string,
  platform?: "tiktok" | "instagram"
): string {
  if (!imageUrl || imageUrl.startsWith("/") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const params = new URLSearchParams({
    url: imageUrl,
  });

  if (platform) {
    params.append("platform", platform);
  }

  return `/api/proxy-image?${params.toString()}`;
}
