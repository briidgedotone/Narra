// ScrapeCreators API Client
import {
  InstagramProfileData,
  TikTokProfileData,
  TikTokVideosData,
  ScrapeCreatorsResponse,
} from "@/types/api";

const BASE_URL = "https://api.scrapecreators.com";
const API_KEY = process.env.SCRAPECREATORS_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ SCRAPECREATORS_API_KEY not found in environment variables");
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string
): Promise<ScrapeCreatorsResponse<T>> {
  if (!API_KEY) {
    return { success: false, error: "API key not configured" };
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "x-api-key": API_KEY,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Instagram Functions
export async function fetchInstagramProfile(
  handle: string
): Promise<ScrapeCreatorsResponse<InstagramProfileData>> {
  return apiRequest<InstagramProfileData>(
    `/v1/instagram/profile?handle=${encodeURIComponent(handle)}`
  );
}

// TikTok Functions
export async function fetchTikTokProfile(
  handle: string
): Promise<ScrapeCreatorsResponse<TikTokProfileData>> {
  return apiRequest<TikTokProfileData>(
    `/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`
  );
}

export async function fetchTikTokVideos(
  handle: string
): Promise<ScrapeCreatorsResponse<TikTokVideosData>> {
  return apiRequest<TikTokVideosData>(
    `/v1/tiktok/profile/videos?handle=${encodeURIComponent(handle)}`
  );
}
