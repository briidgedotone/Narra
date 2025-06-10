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
  datePosted: Date;
  profile: {
    handle: string;
    avatar?: string;
    followers?: number;
    following?: number;
    postsCount?: number;
    bio?: string;
  };
  caption?: string;
  transcript?: string;
}

export interface Profile {
  id: string;
  handle: string;
  platform: "instagram" | "tiktok";
  avatar?: string;
  followers: number;
  following: number;
  postsCount: number;
  bio?: string;
  isFollowed?: boolean;
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
