import { cache, cacheKeys, cacheTTL } from "@/lib/cache/redis";

// ScrapeCreators API client
const SCRAPECREATORS_BASE_URL = "https://api.scrapecreators.com";
const API_KEY = process.env.SCRAPECREATORS_API_KEY;

if (!API_KEY) {
  throw new Error("SCRAPECREATORS_API_KEY is not configured");
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  status?: string;
}

// Instagram API response types based on official documentation
interface InstagramUser {
  biography: string;
  bio_links?: Array<{
    title: string;
    url: string;
    link_type: string;
  }>;
  edge_followed_by: { count: number };
  edge_follow: { count: number };
  full_name: string;
  id: string;
  is_private: boolean;
  is_verified: boolean;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  username: string;
  external_url?: string;
  is_business_account?: boolean;
  category_name?: string;
  edge_owner_to_timeline_media?: {
    count: number;
    edges: Array<{
      node: InstagramPost;
    }>;
  };
}

interface InstagramPost {
  id: string;
  shortcode: string;
  display_url: string;
  is_video: boolean;
  video_url?: string;
  edge_media_to_caption: {
    edges: Array<{
      node: { text: string };
    }>;
  };
  edge_liked_by: { count: number };
  edge_media_to_comment: { count: number };
  video_view_count?: number;
  taken_at_timestamp: number;
  thumbnail_src: string;
  dimensions: {
    height: number;
    width: number;
  };
}

interface InstagramProfileResponse {
  user: InstagramUser;
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
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      };
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        success: false,
        error: `API returned invalid content type: ${contentType}`,
      };
    }

    // Get response text first to validate JSON
    const responseText = await response.text();
    if (!responseText || responseText.trim().length === 0) {
      return {
        success: false,
        error: "API returned empty response",
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("ScrapeCreators JSON parse error:", parseError);
      console.error(
        "Response text preview:",
        responseText.substring(0, 500) + "..."
      );
      return {
        success: false,
        error: "API returned invalid JSON",
      };
    }

    // Handle the official API response format
    if (data.success === false) {
      return {
        success: false,
        error: data.error || "API returned error",
      };
    }

    // Cache the response if cacheKey provided
    if (cacheKey && ttl) {
      await cache.set(cacheKey, data, { ttl });
    }

    return {
      success: true,
      data,
      status: data.status,
    };
  } catch (error) {
    // Handle timeout and network errors
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "API request timed out",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}

export const scrapeCreatorsApi = {
  // Test connection with a simple TikTok profile (using a known public account)
  async testConnection() {
    return await makeRequest("/v1/tiktok/profile?handle=iamsydneythomas");
  },

  // TikTok API endpoints
  tiktok: {
    async getProfile(handle: string) {
      const cacheKey = cacheKeys.tiktokProfile(handle);
      return await makeRequest(
        `/v1/tiktok/profile?handle=${handle}`,
        cacheKey,
        cacheTTL.profile
      );
    },

    async getProfileVideos(
      handle: string,
      count: number = 20,
      cursor?: string
    ) {
      const cacheKey = cursor
        ? `tiktok:videos:${handle}:${count}:${cursor}`
        : cacheKeys.tiktokVideos(handle, count);
      let endpoint = `/v3/tiktok/profile/videos?handle=${handle}&count=${count}`;
      if (cursor) {
        endpoint += `&cursor=${cursor}&max_cursor=${cursor}`;
      }
      return await makeRequest(endpoint, cacheKey, cacheTTL.posts);
    },

    async getVideoTranscript(videoUrl: string, language: string = "en") {
      const cacheKey = cacheKeys.tiktokTranscript(videoUrl);
      return await makeRequest(
        `/v1/tiktok/video/transcript?url=${encodeURIComponent(videoUrl)}&language=${language}`,
        cacheKey,
        cacheTTL.transcript
      );
    },

    async getIndividualVideo(videoUrl: string) {
      const cacheKey = cacheKeys.tiktokVideo(videoUrl);
      return await makeRequest(
        `/v2/tiktok/video?url=${encodeURIComponent(videoUrl)}`,
        cacheKey,
        cacheTTL.posts
      );
    },
  },

  // Instagram API endpoints - Updated to match official documentation
  instagram: {
    async getProfile(handle: string, trim: boolean = false) {
      const cacheKey = cacheKeys.instagramProfile(handle);
      const trimParam = trim ? "&trim=true" : "";
      return await makeRequest<InstagramProfileResponse>(
        `/v1/instagram/profile?handle=${handle}${trimParam}`,
        cacheKey,
        cacheTTL.profile
      );
    },

    async getPosts(handle: string, count: number = 20, nextMaxId?: string) {
      // Use the dedicated posts endpoint that supports pagination
      const cacheKey = nextMaxId
        ? `instagram:posts:${handle}:${count}:${nextMaxId}`
        : cacheKeys.instagramPosts(handle, count);
      let endpoint = `/v2/instagram/user/posts?handle=${handle}&count=${count}`;

      // Add pagination if nextMaxId is provided
      if (nextMaxId) {
        endpoint += `&next_max_id=${nextMaxId}`;
      }

      const response = await makeRequest(endpoint, cacheKey, cacheTTL.posts);

      // If the v2 endpoint fails, fallback to profile extraction
      if (!response.success) {
        console.log(
          "v2 posts endpoint failed, falling back to profile extraction"
        );
        const profileResponse = await makeRequest<InstagramProfileResponse>(
          `/v1/instagram/profile?handle=${handle}`,
          cacheKey,
          cacheTTL.posts
        );

        // Transform the profile response to extract posts
        if (profileResponse.success && profileResponse.data) {
          const user = (profileResponse.data as any)?.data?.user;
          if (user?.edge_owner_to_timeline_media?.edges) {
            // Create a posts-like response structure
            const posts = user.edge_owner_to_timeline_media.edges
              .slice(0, count)
              .map((edge: any) => edge.node);

            return {
              success: true,
              data: {
                items: posts,
                num_results: posts.length,
                more_available: false,
                next_max_id: null,
              },
              cached: profileResponse.cached,
              status: profileResponse.status,
            };
          }
        }
        return profileResponse;
      }

      return response;
    },

    async getVideoTranscript(postUrl: string) {
      const cacheKey = cacheKeys.instagramTranscript(postUrl);
      return await makeRequest(
        `/v2/instagram/media/transcript?url=${encodeURIComponent(postUrl)}`,
        cacheKey,
        cacheTTL.transcript
      );
    },

    async getIndividualPost(postUrl: string) {
      const cacheKey = cacheKeys.instagramPost(postUrl);
      return await makeRequest(
        `/v1/instagram/post?url=${encodeURIComponent(postUrl)}`,
        cacheKey,
        cacheTTL.posts
      );
    },
  },
};

// Utility functions to transform API responses
export const transformers = {
  instagram: {
    // Transform Instagram profile data to our application format
    profileToAppFormat(apiResponse: any) {
      const user = apiResponse?.data?.user;
      if (!user) return null;

      return {
        handle: user.username,
        displayName: user.full_name,
        platform: "instagram" as const,
        followers: user.edge_followed_by?.count || 0,
        following: user.edge_follow?.count || 0,
        posts: user.edge_owner_to_timeline_media?.count || 0,
        bio: user.biography || "",
        avatarUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
        verified: user.is_verified || false,
        isPrivate: user.is_private || false,
        isBusiness: user.is_business_account || false,
        category: user.category_name,
        externalUrl: user.external_url,
        bioLinks: user.bio_links || [],
      };
    },

    // Transform Instagram posts to our application format - FIXED
    postsToAppFormat(apiResponse: any, profileHandle: string) {
      // Handle both posts API response and profile-extracted posts
      let items = [];

      if (apiResponse?.items) {
        // Direct items response from our getPosts method
        items = apiResponse.items;
      } else if (apiResponse?.data?.items) {
        // Direct posts API response
        items = apiResponse.data.items;
      } else if (apiResponse?.data?.user?.edge_owner_to_timeline_media?.edges) {
        // Profile response with embedded posts
        items = apiResponse.data.user.edge_owner_to_timeline_media.edges.map(
          (edge: any) => edge.node
        );
      } else {
        // Fallback for other structures
        items = apiResponse?.data?.items || [];
      }

      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }

      return items.map((post: any, index: number) => {
        // Handle different post structures (API vs Profile posts)
        const isProfilePost = post.shortcode && post.display_url; // Profile posts have these fields

        // Extract caption from the complex structure
        const caption =
          post.caption?.text ||
          post.edge_media_to_caption?.edges?.[0]?.node?.text ||
          "";

        // Handle media URLs - different structures for API vs Profile posts
        let mediaUrl, embedUrl, thumbnail;

        if (isProfilePost) {
          // Profile-embedded post structure
          mediaUrl = post.video_url || post.display_url || "";
          embedUrl = `https://www.instagram.com/p/${post.shortcode}/`;
          thumbnail = post.display_url || post.thumbnail_src || "";
        } else {
          // Direct API post structure
          mediaUrl =
            post.video_url ||
            post.image_versions2?.candidates?.[0]?.url ||
            post.display_url ||
            "";
          embedUrl = post.code
            ? `https://www.instagram.com/p/${post.code}/`
            : mediaUrl;
          thumbnail =
            post.image_versions2?.candidates?.[1]?.url || // Second candidate is usually smaller
            post.image_versions2?.candidates?.[0]?.url ||
            post.display_url ||
            mediaUrl;
        }

        // Handle metrics - different field names
        const likes = post.like_count || post.edge_liked_by?.count || 0;
        const comments =
          post.comment_count || post.edge_media_to_comment?.count || 0;
        const views = post.view_count || post.video_view_count || undefined;

        // Handle timestamp
        const timestamp =
          post.taken_at || post.taken_at_timestamp || Date.now() / 1000;

        return {
          id: post.pk || post.id || `instagram-${index}`,
          platformPostId: post.pk || post.id || `instagram-${index}`,
          platform: "instagram" as const,
          embedUrl: embedUrl,
          caption: caption,
          thumbnail: thumbnail,
          metrics: {
            likes: likes,
            comments: comments,
            views: views,
          },
          datePosted: new Date(timestamp * 1000).toISOString(),
          isVideo: post.media_type === 2 || post.is_video || !!post.video_url,
          videoUrl: post.video_url,
          displayUrl:
            post.display_url || post.image_versions2?.candidates?.[0]?.url,
          shortcode: post.code || post.shortcode,
          dimensions:
            post.original_width && post.original_height
              ? {
                  width: post.original_width,
                  height: post.original_height,
                }
              : post.dimensions || undefined,
          originProfile: {
            handle: profileHandle,
            platform: "instagram" as const,
          },
        };
      });
    },
  },

  tiktok: {
    // Transform TikTok profile data to our application format
    profileToAppFormat(apiResponse: any) {
      const user = apiResponse?.user;
      const stats = apiResponse?.stats || apiResponse?.statsV2;
      if (!user) return null;

      return {
        handle: user.uniqueId,
        displayName: user.nickname || user.uniqueId,
        platform: "tiktok" as const,
        followers: parseInt(stats?.followerCount) || 0,
        following: parseInt(stats?.followingCount) || 0,
        posts: parseInt(stats?.videoCount) || 0,
        bio: user.signature || "",
        avatarUrl:
          user.avatarLarger || user.avatarMedium || user.avatarThumb || "",
        verified: user.verified || false,
      };
    },

    // Transform TikTok individual video data to our application format
    videoToAppFormat(apiResponse: any) {
      const awemeDetail = apiResponse?.aweme_detail;
      if (!awemeDetail) return null;

      const author = awemeDetail.author;
      const statistics = awemeDetail.statistics;
      const video = awemeDetail.video;

      return {
        handle: `@${author?.unique_id || ''}`,
        platform: "tiktok" as const,
        displayName: author?.nickname || author?.unique_id || '',
        bio: author?.signature || '',
        followers: author?.follower_count || 0,
        avatarUrl: author?.avatar_larger?.url_list?.[0] || author?.avatar_medium?.url_list?.[0] || '',
        verified: author?.verification_type === 1,
        platformPostId: awemeDetail.aweme_id,
        embedUrl: awemeDetail.url || '',
        caption: awemeDetail.desc || '',
        originalUrl: awemeDetail.url || '',
        metrics: {
          likes: statistics?.digg_count || 0,
          comments: statistics?.comment_count || 0,
          views: statistics?.play_count || 0,
          shares: statistics?.share_count || 0,
        },
        datePosted: new Date((awemeDetail.create_time || 0) * 1000).toISOString(),
        isVideo: true,
        videoUrl: video?.play_addr?.url_list?.[0] || video?.play_addr_h264?.url_list?.[0] || '',
        thumbnail: video?.cover?.url_list?.[0] || video?.dynamic_cover?.url_list?.[0] || '',
        duration: video?.duration || 0,
      };
    },
  },
};
