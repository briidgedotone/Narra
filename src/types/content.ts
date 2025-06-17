// Core content types for Use Narra
// These will be populated as we implement different phases

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
}

export interface VideoTranscript {
  id: string;
  url: string;
  transcript: string; // WEBVTT format
}
