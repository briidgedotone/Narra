// Database type definitions for Use Narra

// User table - synced with Clerk
export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  subscription_status:
    | "active"
    | "inactive"
    | "trialing"
    | "past_due"
    | "canceled";
  created_at: string;
  updated_at: string;
}

// Social media profiles to follow
export interface Profile {
  id: string;
  handle: string;
  platform: "tiktok" | "instagram";
  display_name?: string;
  bio?: string;
  followers_count?: number;
  avatar_url?: string;
  verified?: boolean;
  last_updated: string;
  created_at: string;
}

// Social media posts
export interface Post {
  id: string;
  profile_id: string;
  platform: "tiktok" | "instagram";
  platform_post_id: string;
  embed_url: string;
  caption?: string;
  transcript?: string;
  original_url?: string;
  metrics: PostMetrics;
  date_posted: string;
  created_at: string;
  updated_at: string;
  // Instagram-specific fields
  thumbnail?: string;
  is_video?: boolean;
  is_carousel?: boolean;
  carousel_media?: CarouselMediaData[];
  carousel_count?: number;
  video_url?: string;
  display_url?: string;
  shortcode?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  // Embed HTML for displaying posts in boards
  embed_html?: string;
}

// Post metrics
export interface PostMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
}

// Carousel media data for Instagram posts
export interface CarouselMediaData {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  is_video: boolean;
}

// Organization folders
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Content boards within folders
export interface Board {
  id: string;
  folder_id: string;
  name: string;
  description?: string;
  public_id?: string; // For public sharing
  is_shared: boolean;
  copied_from_public_id?: string; // Public ID of the original shared board this was copied from
  copied_at?: string; // Timestamp when this board was copied from a shared board
  original_board_name?: string; // Original name of the shared board when it was copied
  created_at: string;
  updated_at: string;
}

// Many-to-many relationship for posts in boards
export interface BoardPost {
  id: string;
  board_id: string;
  post_id: string;
  added_at: string;
}

// User-profile following relationships
export interface Follow {
  id: string;
  user_id: string;
  profile_id: string;
  created_at: string;
  last_refresh?: string;
}

// Stripe subscriptions
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: "active" | "inactive" | "trialing" | "past_due" | "canceled";
  billing_period: "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Database table names
export type TableName =
  | "users"
  | "profiles"
  | "posts"
  | "folders"
  | "boards"
  | "board_posts"
  | "follows"
  | "subscriptions";

// Database row types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "last_updated">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Post, "id" | "profile_id" | "created_at">>;
      };
      folders: {
        Row: Folder;
        Insert: Omit<Folder, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Folder, "id" | "user_id" | "created_at">>;
      };
      boards: {
        Row: Board;
        Insert: Omit<Board, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Board, "id" | "folder_id" | "created_at">>;
      };
      board_posts: {
        Row: BoardPost;
        Insert: Omit<BoardPost, "id" | "added_at">;
        Update: never; // Board posts are only added or removed
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, "id" | "created_at" | "last_refresh">;
        Update: Partial<Pick<Follow, "last_refresh">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "user_id" | "created_at">>;
      };
    };
  };
}
