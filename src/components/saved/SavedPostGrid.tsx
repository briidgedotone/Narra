import React from "react";
import Masonry from "react-masonry-css";

import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { Folder } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedPost } from "@/types/board";

interface SavedPostGridProps {
  posts: SavedPost[];
  isLoading: boolean;
  onPostClick?: (post: SavedPost) => void;
  onSavePost?: (post: SavedPost) => void;
  onRemovePost?: (post: SavedPost) => void;
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
  function SavedPostGrid({ posts, isLoading, onPostClick, onSavePost, onRemovePost }) {
    // Masonry breakpoints - matches following page
    const breakpointColumnsObj = React.useMemo(() => ({
      default: 4, // xl:columns-4
      1280: 4, // xl
      1024: 3, // lg:columns-3
      640: 2, // sm:columns-2
      0: 1, // columns-1
    }), []);

    // Memoized post items with stable callback references
    const postItems = React.useMemo(() => {
      return posts.map(post => {
        const handleDetailsClick = () => onPostClick?.(post);
        const handleSaveClick = () => onSavePost?.(post);
        const handleRemoveClick = () => onRemovePost?.(post);

        return (
          <div key={post.id} className="mb-4 flex justify-center">
            {post.platform === "instagram" ? (
              <InstagramEmbed
                url={post.originalUrl || post.embedUrl}
                caption={post.caption}
                metrics={post.metrics}
                showMetrics={true}
                onDetailsClick={handleDetailsClick}
                onSaveClick={handleSaveClick}
                onRemoveClick={handleRemoveClick}
              />
            ) : (
              <TikTokEmbed
                url={post.originalUrl || post.embedUrl}
                caption={post.caption}
                metrics={post.metrics}
                showMetrics={true}
                onDetailsClick={handleDetailsClick}
                onSaveClick={handleSaveClick}
                onRemoveClick={handleRemoveClick}
              />
            )}
          </div>
        );
      });
    }, [posts, onPostClick, onSavePost, onRemovePost]);
    // Loading state
    if (isLoading) {
      return (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4"
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
        </Masonry>
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
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
        role="grid"
        aria-label={`${posts.length} saved posts`}
      >
        {postItems}
      </Masonry>
    );
  }
);
