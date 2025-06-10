// ScrapeCreators API Client
import type {
  ScrapeCreatorsSearchRequest,
  ScrapeCreatorsSearchResponse,
  ScrapeCreatorsError,
} from "@/types/api";

class ScrapeCreatorsAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SCRAPECREATORS_API_KEY || "";
    this.baseUrl =
      process.env.SCRAPECREATORS_BASE_URL || "https://api.scrapecreators.com";

    if (!this.apiKey) {
      console.warn("ScrapeCreators API key not found. API calls will fail.");
    }
  }

  /**
   * Search for profiles and posts
   */
  async searchProfiles(
    request: ScrapeCreatorsSearchRequest
  ): Promise<ScrapeCreatorsSearchResponse> {
    try {
      const url = new URL(`${this.baseUrl}/search`);

      // Add query parameters
      if (request.handle) url.searchParams.set("handle", request.handle);
      if (request.url) url.searchParams.set("url", request.url);
      if (request.platform) url.searchParams.set("platform", request.platform);
      if (request.limit)
        url.searchParams.set("limit", request.limit.toString());
      if (request.offset)
        url.searchParams.set("offset", request.offset.toString());

      // Add filter parameters
      if (request.filters) {
        const { filters } = request;
        if (filters.recency) url.searchParams.set("recency", filters.recency);
        if (filters.date_range)
          url.searchParams.set("date_range", filters.date_range.toString());
        if (filters.min_likes)
          url.searchParams.set("min_likes", filters.min_likes.toString());
        if (filters.max_likes)
          url.searchParams.set("max_likes", filters.max_likes.toString());
        if (filters.min_comments)
          url.searchParams.set("min_comments", filters.min_comments.toString());
        if (filters.max_comments)
          url.searchParams.set("max_comments", filters.max_comments.toString());
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData: ScrapeCreatorsError = await response.json();
        throw new Error(`ScrapeCreators API Error: ${errorData.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error("ScrapeCreators API Error:", error);
      throw error;
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const scrapeCreatorsAPI = new ScrapeCreatorsAPI();
