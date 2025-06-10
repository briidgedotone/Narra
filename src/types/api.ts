// API types for external integrations

// ScrapeCreators API types
export interface ScrapeCreatorsProfile {
  handle: string;
  platform: "instagram" | "tiktok";
  display_name?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  avatar_url?: string;
  verified?: boolean;
}

export interface ScrapeCreatorsPost {
  id: string;
  platform: "instagram" | "tiktok";
  embed_url: string;
  caption?: string;
  transcript?: string;
  thumbnail_url?: string;
  date_posted: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface ScrapeCreatorsSearchRequest {
  handle?: string;
  url?: string;
  platform?: "instagram" | "tiktok";
  filters?: {
    recency?: "latest" | "most_viewed";
    date_range?: 30 | 60 | 90 | 180 | 365;
    min_likes?: number;
    max_likes?: number;
    min_comments?: number;
    max_comments?: number;
  };
  limit?: number;
  offset?: number;
}

export interface ScrapeCreatorsSearchResponse {
  profile: ScrapeCreatorsProfile;
  posts: ScrapeCreatorsPost[];
  total_posts: number;
  has_more: boolean;
}

export interface ScrapeCreatorsError {
  error: string;
  message: string;
  status_code: number;
}
