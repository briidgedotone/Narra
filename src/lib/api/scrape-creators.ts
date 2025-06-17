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

// Data transformation interfaces
export interface TikTokVideo {
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

export interface TikTokProfile {
  id: string;
  handle: string;
  displayName: string;
  platform: "tiktok";
  followers: number;
  following: number;
  posts: number;
  bio: string;
  avatarUrl: string;
  verified: boolean;
}

// Data transformation functions
export function transformTikTokProfile(rawData: any): TikTokProfile {
  return {
    id: rawData.id || rawData.user_id || rawData.secUid,
    handle: rawData.unique_id || rawData.username || rawData.handle,
    displayName: rawData.nickname || rawData.display_name || rawData.name,
    platform: "tiktok",
    followers: rawData.follower_count || rawData.followers || 0,
    following: rawData.following_count || rawData.following || 0,
    posts: rawData.video_count || rawData.posts || 0,
    bio: rawData.signature || rawData.bio || rawData.description || "",
    avatarUrl:
      rawData.avatar_larger || rawData.avatar_thumb || rawData.avatar || "",
    verified: rawData.verified || false,
  };
}

export function transformTikTokVideo(
  rawVideo: any,
  profileData: TikTokProfile
): TikTokVideo {
  const videoId = rawVideo.id || rawVideo.aweme_id || "";

  return {
    id: videoId,
    embedUrl: `https://www.tiktok.com/@${profileData.handle}/video/${videoId}`,
    caption: rawVideo.desc || rawVideo.description || "",
    thumbnail: rawVideo.video?.cover || rawVideo.cover || "",
    metrics: {
      views: rawVideo.stats?.play_count || rawVideo.view_count,
      likes: rawVideo.stats?.digg_count || rawVideo.like_count || 0,
      comments: rawVideo.stats?.comment_count || rawVideo.comment_count || 0,
      shares: rawVideo.stats?.share_count || rawVideo.share_count,
    },
    datePosted: rawVideo.create_time
      ? new Date(rawVideo.create_time * 1000).toISOString()
      : new Date().toISOString(),
    platform: "tiktok",
    profile: {
      handle: profileData.handle,
      displayName: profileData.displayName,
      avatarUrl: profileData.avatarUrl,
      verified: profileData.verified,
      followers: profileData.followers,
    },
  };
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

    async getProfileVideos(handle: string, count: number = 20) {
      const cacheKey = cacheKeys.tiktokVideos(handle);
      return await makeRequest(
        `/tiktok/profile/videos?handle=${handle}&count=${count}`,
        cacheKey,
        cacheTTL.posts
      );
    },

    async getVideoTranscript(videoId: string) {
      const cacheKey = cacheKeys.tiktokTranscript(videoId);
      return await makeRequest(
        `/tiktok/video/transcript?video_id=${videoId}`,
        cacheKey,
        cacheTTL.transcript
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
