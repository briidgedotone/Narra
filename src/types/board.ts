export interface BoardPageContentProps {
  boardId: string;
  isSharedView?: boolean;
}

export interface BoardData {
  id: string;
  name: string;
  description: string | null;
  folder_id: string;
  is_shared: boolean;
  public_id: string | null;
  created_at: string;
  updated_at: string;
  folders: {
    name: string;
  };
}

export interface SavedPost {
  id: string;
  embedUrl: string;
  caption: string;
  thumbnail?: string;
  originalUrl?: string;
  platformPostId?: string;
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
  };
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
}

export interface CarouselMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  isVideo: boolean;
}

export interface VideoTranscript {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}
