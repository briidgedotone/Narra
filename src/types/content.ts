// Core content types for Use Narra
// These will be populated as we implement different phases

export interface Post {
  id: string;
  embedUrl: string;
  videoUrl?: string; // Direct video URL for embedding
  caption: string;
  thumbnail: string;
  transcript?: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  platform: "instagram" | "tiktok";
  profile: {
    handle: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
    followers: number;
  };
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
