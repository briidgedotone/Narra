// Discovery Component Types
// Extracted from discovery-content.tsx for better organization

export interface DiscoveryContentProps {
  userId: string;
}

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  platform: "instagram" | "tiktok";
  followers: number;
  following: number;
  posts: number;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isFollowing?: boolean;
}

export interface CarouselMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  isVideo: boolean;
}

export interface Post {
  id: string;
  embedUrl: string;
  caption: string;
  thumbnail: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  platform: "instagram" | "tiktok";
  tiktokUrl?: string;
  shortcode?: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
  // Instagram-specific fields
  videoUrl?: string;
  displayUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface TikTokVideoData {
  aweme_id: string;
  desc: string;
  video?: {
    play_addr?: {
      url_list?: string[];
    };
    download_addr?: {
      url_list?: string[];
    };
    origin_cover?: {
      url_list?: string[];
    };
    dynamic_cover?: {
      url_list?: string[];
    };
  };
  statistics?: {
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    share_count?: number;
  };
  create_time: number;
}

export interface InstagramPostData {
  id: string;
  pk?: string;
  video_url?: string;
  display_url?: string;
  thumbnail_src?: string;
  caption?: {
    text?: string;
  };
  image_versions2?: {
    candidates?: Array<{
      url?: string;
    }>;
  };
  carousel_media?: Array<{
    image_versions2?: {
      candidates?: Array<{
        url?: string;
      }>;
    };
  }>;
  edge_media_to_caption?: {
    edges?: Array<{
      node?: {
        text?: string;
      };
    }>;
  };
  edge_media_preview_like?: {
    count?: number;
  };
  edge_media_to_comment?: {
    count?: number;
  };
  video_view_count?: number;
  view_count?: number;
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  taken_at?: number;
  taken_at_timestamp: number;
}

export interface SavePostData {
  id: string;
  platformPostId: string;
  platform: "instagram" | "tiktok";
  embedUrl: string;
  caption?: string;
  originalUrl?: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  handle: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
  // Instagram-specific fields
  thumbnail?: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
  videoUrl?: string;
  displayUrl?: string;
  shortcode?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

// Search and UI State Types
export type Platform = "instagram" | "tiktok";
export type SortOption =
  | "most-recent"
  | "most-viewed"
  | "most-liked"
  | "most-commented";
export type ActiveTab = "overview" | "transcript";
