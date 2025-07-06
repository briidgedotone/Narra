// TikTok embedding utilities for official embed generation

interface TikTokEmbedResponse {
  version: string;
  type: string;
  title: string;
  author_name: string;
  author_url: string;
  width: number;
  height: number;
  html: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

interface TikTokEmbedResult {
  success: boolean;
  data?: TikTokEmbedResponse;
  error?: string;
  method?: 'oembed' | 'iframe';
}

/**
 * Get TikTok embed using official oEmbed API
 */
export async function getTikTokOEmbed(tiktokUrl: string): Promise<TikTokEmbedResult> {
  try {
    // Validate TikTok URL format
    if (!isValidTikTokUrl(tiktokUrl)) {
      return {
        success: false,
        error: "Invalid TikTok URL format"
      };
    }

    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
    
    console.log("Fetching TikTok oEmbed:", oembedUrl);

    const response = await fetch(oembedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Use Narra Bot/1.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`TikTok oEmbed HTTP error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `TikTok oEmbed API returned ${response.status}: ${response.statusText}`
      };
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const responseText = await response.text();
      console.error('TikTok oEmbed non-JSON response:', responseText.substring(0, 500));
      return {
        success: false,
        error: `Expected JSON response, got ${contentType}`
      };
    }

    const data: TikTokEmbedResponse = await response.json();
    console.log("TikTok oEmbed success:", { 
      title: data.title, 
      author: data.author_name,
      hasHtml: !!data.html 
    });

    return {
      success: true,
      data,
      method: 'oembed'
    };

  } catch (error) {
    console.error("TikTok oEmbed error:", error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: "TikTok oEmbed request timed out"
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: "Unknown error occurred"
    };
  }
}

/**
 * Generate iframe embed as fallback method
 */
export function generateTikTokIframe(tiktokUrl: string): TikTokEmbedResult {
  try {
    const videoId = extractTikTokVideoId(tiktokUrl);
    if (!videoId) {
      return {
        success: false,
        error: "Could not extract video ID from TikTok URL"
      };
    }

    const iframeHtml = `<iframe 
      src="https://www.tiktok.com/embed/v2/${videoId}" 
      width="325" 
      height="560"
      frameborder="0"
      allow="encrypted-media; autoplay; picture-in-picture"
      allowfullscreen
      sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
      loading="lazy">
    </iframe>`;

    const embedData: TikTokEmbedResponse = {
      version: "1.0",
      type: "video",
      title: `TikTok Video ${videoId}`,
      author_name: "Unknown",
      author_url: tiktokUrl.split('/video/')[0],
      width: 325,
      height: 560,
      html: iframeHtml,
      thumbnail_url: "",
      thumbnail_width: 720,
      thumbnail_height: 1280
    };

    return {
      success: true,
      data: embedData,
      method: 'iframe'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate iframe embed"
    };
  }
}

/**
 * Get TikTok embed with fallback strategy
 * Tries oEmbed first, falls back to iframe if needed
 */
export async function getTikTokEmbed(tiktokUrl: string): Promise<TikTokEmbedResult> {
  // First try official oEmbed API
  const oembedResult = await getTikTokOEmbed(tiktokUrl);
  
  if (oembedResult.success) {
    return oembedResult;
  }

  console.log("oEmbed failed, trying iframe fallback:", oembedResult.error);

  // Fallback to iframe method
  const iframeResult = generateTikTokIframe(tiktokUrl);
  
  if (iframeResult.success) {
    return iframeResult;
  }

  // Both methods failed
  return {
    success: false,
    error: `Both embed methods failed. oEmbed: ${oembedResult.error}, iframe: ${iframeResult.error}`
  };
}

/**
 * Validate TikTok URL format
 */
export function isValidTikTokUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Support various TikTok URL formats
  const tiktokPatterns = [
    /^https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /^https:\/\/vm\.tiktok\.com\/[\w]+/,
    /^https:\/\/m\.tiktok\.com\/v\/\d+/,
    /^https:\/\/www\.tiktok\.com\/t\/[\w]+/
  ];

  return tiktokPatterns.some(pattern => pattern.test(url));
}

/**
 * Extract video ID from TikTok URL
 */
export function extractTikTokVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Match standard TikTok video URL format
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract username from TikTok URL
 */
export function extractTikTokUsername(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Match @username in TikTok URL
  const match = url.match(/@([\w.-]+)\/video/);
  return match ? match[1] : null;
}

/**
 * Convert various TikTok URL formats to standard format
 */
export function normalizeTikTokUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // If already in standard format, return as-is
  if (/^https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+/.test(url)) {
    return url;
  }

  // Handle short URLs - these would need to be resolved via HTTP redirect
  // For now, return null for short URLs as they need server-side resolution
  if (url.includes('vm.tiktok.com') || url.includes('m.tiktok.com') || url.includes('/t/')) {
    console.warn("Short TikTok URLs need to be resolved to full URLs first:", url);
    return null;
  }

  return null;
}

/**
 * Clean and sanitize TikTok embed HTML
 */
export function sanitizeTikTokEmbed(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Basic sanitization - in production you might want more robust sanitization
  // Remove any script tags that aren't from TikTok
  const cleanHtml = html.replace(/<script(?![^>]*tiktok\.com)[^>]*>.*?<\/script>/gi, '');

  return cleanHtml;
}