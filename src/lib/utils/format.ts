/**
 * Format numbers to shortened display format
 * Examples: 5123 -> "5.1K", 14900 -> "14.9K", 632000 -> "632K", 3400000 -> "3.4M"
 */
export function formatMetric(value: number | undefined | null): string {
  if (!value || value === 0) return "0";

  if (value < 1000) {
    return value.toString();
  } else if (value < 1000000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  } else if (value < 1000000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  } else {
    return `${(value / 1000000000).toFixed(1).replace(/\.0$/, "")}B`;
  }
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

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
