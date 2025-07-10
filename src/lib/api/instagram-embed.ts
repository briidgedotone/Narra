// Instagram embedding utilities

interface InstagramEmbedResponse {
  version: string;
  title: string;
  author_name: string;
  author_url: string;
  author_id: string;
  media_id: string;
  provider_name: string;
  provider_url: string;
  type: string;
  width: number | null;
  height: number | null;
  html: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

interface InstagramEmbedResult {
  success: boolean;
  data?: InstagramEmbedResponse;
  error?: string;
  method?: "oembed" | "fallback";
}

/**
 * Get Instagram embed HTML
 */
export async function getInstagramEmbed(
  instagramUrl: string
): Promise<InstagramEmbedResult> {
  try {
    const response = await fetch("/api/instagram-embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: instagramUrl }),
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data,
        method: result.method,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to generate Instagram embed",
      };
    }
  } catch (error) {
    console.error("Instagram embed error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validate Instagram URL format
 */
export function isValidInstagramUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const patterns = [
    /^https:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
    /^https:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
    /^https:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
  ];

  return patterns.some(pattern => pattern.test(url));
}

/**
 * Extract shortcode from Instagram URL
 */
export function extractInstagramShortcode(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const match = url.match(/\/(p|reel|tv)\/([\w-]+)/);
  return match ? match[2] : null;
}

/**
 * Generate Instagram post URL from shortcode
 */
export function generateInstagramUrl(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/`;
}

/**
 * Clean and sanitize Instagram embed HTML
 */
export function sanitizeInstagramEmbed(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Remove any script tags that aren't from Instagram
  const cleanHtml = html.replace(
    /<script(?![^>]*instagram\.com)[^>]*>.*?<\/script>/gi,
    ""
  );

  return cleanHtml;
}
