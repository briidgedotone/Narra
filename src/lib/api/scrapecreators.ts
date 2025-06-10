// ScrapeCreators API Client
import type {
  InstagramProfile,
  InstagramPost,
  ScrapeCreatorsResponse,
  DiscoverySearchParams,
} from "@/types/api";

const BASE_URL = "https://api.scrapecreators.com/v1";

class ScrapeCreatorsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string
  ): Promise<ScrapeCreatorsResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API Error: ${response.status} - ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get Instagram profile by handle
  async getInstagramProfile(
    handle: string
  ): Promise<ScrapeCreatorsResponse<InstagramProfile>> {
    return this.request<InstagramProfile>(
      `/instagram/profile?handle=${encodeURIComponent(handle)}`
    );
  }

  // Get Instagram post by URL
  async getInstagramPost(
    postUrl: string
  ): Promise<ScrapeCreatorsResponse<InstagramPost>> {
    return this.request<InstagramPost>(
      `/instagram/post?url=${encodeURIComponent(postUrl)}`
    );
  }

  // Search for content (main discovery function)
  async searchContent(params: DiscoverySearchParams): Promise<
    ScrapeCreatorsResponse<{
      profile: InstagramProfile;
      posts: InstagramPost[];
    }>
  > {
    const { handle, platform } = params;

    if (platform === "instagram") {
      const profileResult = await this.getInstagramProfile(handle);

      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          error: profileResult.error || "Failed to fetch profile",
        };
      }

      // For MVP, we'll return profile with empty posts array
      // Posts will be fetched separately based on filters
      return {
        success: true,
        data: {
          profile: profileResult.data,
          posts: [],
        },
      };
    }

    return {
      success: false,
      error: "TikTok not implemented yet",
    };
  }
}

// Export singleton instance
const getApiKey = (): string => {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    throw new Error("SCRAPECREATORS_API_KEY environment variable is required");
  }
  return apiKey;
};

export const scrapeCreators = new ScrapeCreatorsClient(getApiKey());
export { ScrapeCreatorsClient };
