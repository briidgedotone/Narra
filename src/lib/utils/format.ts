/**
 * Format numbers to shortened display format
 * Examples: 5123 -> "5.1K", 14900 -> "14.9K", 632000 -> "632K", 3400000 -> "3.4M"
 */
export function formatMetric(value: number): string {
  if (value < 1000) {
    return value.toString();
  }

  if (value < 1000000) {
    const thousands = value / 1000;
    if (thousands < 10) {
      return `${thousands.toFixed(1)}K`;
    }
    return `${Math.floor(thousands)}K`;
  }

  if (value < 1000000000) {
    const millions = value / 1000000;
    if (millions < 10) {
      return `${millions.toFixed(1)}M`;
    }
    return `${Math.floor(millions)}M`;
  }

  const billions = value / 1000000000;
  if (billions < 10) {
    return `${billions.toFixed(1)}B`;
  }
  return `${Math.floor(billions)}B`;
}

/**
 * Format date to "Month Day" format
 * Example: "Dec 15"
 */
export function formatPostDate(date: Date | string): string {
  // Handle both Date objects and date strings from API responses
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Unknown";
  }

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: "instagram" | "tiktok"): string {
  return platform === "instagram" ? "Instagram" : "TikTok";
}

/**
 * Get platform icon/emoji
 */
export function getPlatformIcon(platform: "instagram" | "tiktok"): string {
  return platform === "instagram" ? "📸" : "🎵";
}
