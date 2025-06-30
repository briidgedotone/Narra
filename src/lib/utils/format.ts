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
 * Format currency values
 * Example: 19 -> "$19", 1999 -> "$1,999"
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
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

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
}

export function parseWebVTT(webvttContent: string): string {
  if (!webvttContent) return "";

  // Split by lines and filter out timing lines and WEBVTT header
  const lines = webvttContent.split("\n");
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines, WEBVTT header, and timing lines
    if (
      !trimmedLine ||
      trimmedLine === "WEBVTT" ||
      trimmedLine.includes("-->") ||
      /^\d{2}:\d{2}:\d{2}/.test(trimmedLine)
    ) {
      continue;
    }

    textLines.push(trimmedLine);
  }

  // Join all text lines with spaces and clean up
  return textLines.join(" ").replace(/\s+/g, " ").trim();
}

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise(resolve => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const result = document.execCommand("copy");
        document.body.removeChild(textArea);
        resolve(result);
      } catch {
        document.body.removeChild(textArea);
        resolve(false);
      }
    }
  });
}
