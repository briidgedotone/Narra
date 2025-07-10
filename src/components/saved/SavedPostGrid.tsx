import React from "react";

import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { Folder } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface SavedPost {
  id: string;
  embedUrl: string;
  originalUrl?: string;
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
  profile: {
    handle: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    thumbnail: string;
    isVideo: boolean;
  }>;
  carouselCount?: number;
}

interface SavedPostGridProps {
  posts: SavedPost[];
  isLoading: boolean;
}

/**
 * SavedPostGrid - Displays saved posts using embed components
 *
 * Features:
 * - Uses InstagramEmbed and TikTokEmbed components
 * - Grid layout similar to board page
 * - Shows caption and metrics for each post
 * - Handles loading and empty states
 */
export const SavedPostGrid = React.memo<SavedPostGridProps>(
  function SavedPostGrid({ posts, isLoading }) {
    // Loading state
    if (isLoading) {
      return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 break-inside-avoid mb-6"
              role="status"
              aria-label="Loading post"
            >
              <Skeleton className="aspect-[9/16] w-full rounded-t-xl" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Empty state
    if (posts.length === 0) {
      return (
        <EmptyState
          icons={[Folder]}
          title="No saved posts"
          description="You haven't saved any posts yet. Start exploring and save posts you like to see them here."
        />
      );
    }

    // Main grid render
    return (
      <div
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 masonry-container"
        role="grid"
        aria-label={`${posts.length} saved posts`}
      >
        {posts.map(post => (
          <div key={post.id} className="masonry-item mb-6">
            {post.platform === "instagram" ? (
              <InstagramEmbed
                url={post.originalUrl || post.embedUrl}
                caption={post.caption}
                metrics={post.metrics}
                showMetrics={true}
              />
            ) : (
              <TikTokEmbed
                url={post.originalUrl || post.embedUrl}
                caption={post.caption}
                metrics={post.metrics}
                showMetrics={true}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
);
