export interface Post {
  id: string;
  platform: "instagram" | "tiktok";
  embedUrl: string;
  thumbnailUrl?: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  datePosted: Date | string;
  profile: {
    id: string;
    handle: string;
    platform: "instagram" | "tiktok";
    avatar?: string;
    displayName?: string;
    followers?: number;
    following?: number;
    postsCount?: number;
    bio?: string;
    isVerified?: boolean;
  };
  caption?: string;
  transcript?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  originalData?: any;
}

export interface Profile {
  id: string;
  handle: string;
  platform: "instagram" | "tiktok";
  avatar?: string;
  displayName?: string;
  bio?: string;
  followers: number;
  following: number;
  postsCount: number;
  isVerified?: boolean;
  isBusiness?: boolean;
  isFollowed?: boolean;
  lastUpdated?: Date;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  folderId?: string;
  postCount: number;
  coverImage?: string;
  isPublic: boolean;
  publicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  boardCount: number;
  createdAt: Date;
  updatedAt: Date;
}
