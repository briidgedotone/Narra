// ScrapeCreators API Response Types

// Instagram Profile Response
export interface InstagramProfile {
  id: string;
  handle: string;
  display_name?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  avatar_url?: string;
  verified?: boolean;
}

// Instagram Post Response
export interface InstagramPost {
  id: string;
  platform_post_id: string;
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

// API Response wrapper
export interface ScrapeCreatorsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Search filters for posts
export interface PostFilters {
  recency?: "latest" | "most_viewed";
  date_range?: 30 | 60 | 90 | 180 | 365; // days
  min_likes?: number;
  max_likes?: number;
  min_comments?: number;
  max_comments?: number;
}

// Discovery search params
export interface DiscoverySearchParams {
  handle: string;
  platform: "instagram" | "tiktok";
  filters?: PostFilters;
  limit?: number;
}
