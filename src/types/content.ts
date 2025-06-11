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
