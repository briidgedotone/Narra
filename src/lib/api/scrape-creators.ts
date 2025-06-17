import { cache, cacheKeys, cacheTTL } from "@/lib/cache/redis";

// ScrapeCreators API client
const SCRAPECREATORS_BASE_URL_V1 = "https://api.scrapecreators.com/v1";
const SCRAPECREATORS_BASE_URL_V3 = "https://api.scrapecreators.com/v3";
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

// TikTok Video interfaces for v3 API
interface TikTokVideoResponse {
  aweme_list: TikTokVideoItem[];
  has_more: number;
  max_cursor: number;
  min_cursor: number;
  status_code: number;
  status_msg: string;
}

interface TikTokVideoItem {
  aweme_id: string;
  desc: string;
  create_time: number;
  author: {
    unique_id: string;
    nickname: string;
    avatar_thumb: {
      url_list: string[];
    };
    verification_type: number;
    follower_count: number;
  };
  video: {
    cover: {
      url_list: string[];
    };
    play_addr: {
      url_list: string[];
    };
    duration: number;
  };
  statistics: {
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
  };
  cla_info?: {
    caption_infos?: Array<{
      url: string;
      language_code: string;
    }>;
  };
}

// Our standardized Post interface
interface Post {
  id: string;
  embedUrl: string;
  caption: string;
  thumbnail: string;
  transcript?: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  platform: "tiktok";
  profile: {
    handle: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
    followers: number;
  };
}

async function makeRequest<T>(
  endpoint: string,
  cacheKey?: string,
  ttl?: number,
  apiVersion: "v1" | "v3" = "v1"
): Promise<ApiResponse<T>> {
  // Check cache first if cacheKey provided
  if (cacheKey) {
    const cached = await cache.get<T>(cacheKey);
    if (cached) {
      return { success: true, data: cached, cached: true };
    }
  }

  try {
    const baseUrl =
      apiVersion === "v3"
        ? SCRAPECREATORS_BASE_URL_V3
        : SCRAPECREATORS_BASE_URL_V1;
    const response = await fetch(`${baseUrl}${endpoint}`, {
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

// Helper function to extract transcript from TikTok captions
function extractTranscript(item: TikTokVideoItem): string | undefined {
  if (!item.cla_info?.caption_infos?.length) {
    return undefined;
  }

  // Find English transcript
  const englishCaption = item.cla_info.caption_infos.find(
    caption =>
      caption.language_code === "en" || caption.language_code === "eng-US"
  );

  if (englishCaption?.url) {
    // For now, return a placeholder. In a real implementation,
    // you'd fetch the transcript from the URL
    return (
      "Transcript available - would be fetched from: " + englishCaption.url
    );
  }

  return undefined;
}

// Export types
export type { Post, TikTokVideoItem, TikTokVideoResponse };

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

    async getProfileVideos(
      handle: string,
      maxCursor?: string
    ): Promise<
      ApiResponse<{ posts: Post[]; hasMore: boolean; nextCursor?: string }>
    > {
      const cacheKey = `tiktok:videos:${handle}:${maxCursor || "initial"}`;
      const endpoint = `/tiktok/profile/videos?handle=${handle}${maxCursor ? `&max_cursor=${maxCursor}` : ""}`;

      const response = await makeRequest<TikTokVideoResponse>(
        endpoint,
        cacheKey,
        cacheTTL.posts, // 5 minutes
        "v3" // Use v3 API for videos
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to fetch videos",
          cached: response.cached || false,
        };
      }

      // Transform TikTok API response to our Post format
      const posts: Post[] = response.data.aweme_list.map(
        (item: TikTokVideoItem) => ({
          id: item.aweme_id,
          embedUrl: `https://www.tiktok.com/@${item.author.unique_id}/video/${item.aweme_id}`,
          caption: item.desc || "",
          thumbnail: item.video.cover?.url_list?.[0] || "/placeholder-post.jpg",
          ...(extractTranscript(item) && {
            transcript: extractTranscript(item),
          }),
          metrics: {
            views: item.statistics.play_count,
            likes: item.statistics.digg_count,
            comments: item.statistics.comment_count,
            shares: item.statistics.share_count,
          },
          datePosted: new Date(item.create_time * 1000).toISOString(),
          platform: "tiktok" as const,
          profile: {
            handle: item.author.unique_id,
            displayName: item.author.nickname,
            avatarUrl:
              item.author.avatar_thumb?.url_list?.[0] ||
              "/placeholder-avatar.jpg",
            verified: item.author.verification_type === 1,
            followers: item.author.follower_count || 0,
          },
        })
      );

      return {
        success: true,
        data: {
          posts,
          hasMore: response.data.has_more === 1,
          nextCursor: response.data.max_cursor?.toString(),
        },
        cached: response.cached || false,
      };
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
