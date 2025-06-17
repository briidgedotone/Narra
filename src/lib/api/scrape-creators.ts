import { cache, cacheKeys, cacheTTL } from "@/lib/cache/redis";

// ScrapeCreators API client
const SCRAPECREATORS_BASE_URL = "https://api.scrapecreators.com/v1";
const API_KEY = process.env.SCRAPECREATORS_API_KEY;

if (!API_KEY) {
  throw new Error("SCRAPECREATORS_API_KEY is not configured");
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

async function makeRequest<T>(
  endpoint: string,
  cacheKey?: string,
  ttl?: number
): Promise<ApiResponse<T>> {
  // Check cache first if cacheKey provided
  if (cacheKey) {
    const cached = await cache.get<T>(cacheKey);
    if (cached) {
      return { success: true, data: cached, cached: true };
    }
  }

  try {
    const response = await fetch(`${SCRAPECREATORS_BASE_URL}${endpoint}`, {
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Cache the response if cacheKey provided
    if (cacheKey && ttl) {
      await cache.set(cacheKey, data, { ttl });
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const scrapeCreatorsApi = {
  // Test connection with a simple TikTok profile (using a known public account)
  async testConnection() {
    return await makeRequest("/tiktok/profile?handle=iamsydneythomas");
  },

  // TikTok API endpoints
  tiktok: {
    async getProfile(handle: string) {
      const cacheKey = cacheKeys.tiktokProfile(handle);
      return await makeRequest(
        `/tiktok/profile?handle=${handle}`,
        cacheKey,
        cacheTTL.profile
      );
    },
  },

  // Instagram API endpoints
  instagram: {
    async getProfile(handle: string) {
      const cacheKey = cacheKeys.instagramProfile(handle);
      return await makeRequest(
        `/instagram/profile?handle=${handle}`,
        cacheKey,
        cacheTTL.profile
      );
    },
  },
};
