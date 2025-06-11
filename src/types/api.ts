// ScrapeCreators API Response Types

// Basic API response wrapper
export interface ScrapeCreatorsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Instagram Profile Response (simplified)
export interface InstagramProfileData {
  user: {
    id: string;
    username: string;
    full_name?: string;
    biography?: string;
    profile_pic_url?: string;
    is_verified?: boolean;
    is_business_account?: boolean;
    edge_followed_by?: { count: number };
    edge_follow?: { count: number };
    edge_owner_to_timeline_media?: {
      count: number;
      edges: Array<{
        node: {
          id: string;
          shortcode: string;
          display_url: string;
          taken_at_timestamp: number;
          edge_liked_by?: { count: number };
          edge_media_to_comment?: { count: number };
          edge_media_to_caption?: {
            edges: Array<{ node: { text: string } }>;
          };
          is_video?: boolean;
          video_view_count?: number;
        };
      }>;
    };
  };
}

// TikTok Profile Response (simplified)
export interface TikTokProfileData {
  user: {
    id: string;
    unique_id: string;
    nickname?: string;
    signature?: string;
    avatar_url?: string;
    verified?: boolean;
    follower_count?: number;
    following_count?: number;
    video_count?: number;
  };
}

// TikTok Videos Response (simplified)
export interface TikTokVideosData {
  videos: Array<{
    aweme_id: string;
    desc: string;
    create_time: number;
    video?: {
      cover?: { url_list?: string[] };
    };
    statistics?: {
      play_count?: number;
      digg_count?: number;
      comment_count?: number;
      share_count?: number;
    };
  }>;
}
