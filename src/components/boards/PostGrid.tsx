import React, { useCallback } from "react";
import Masonry from "react-masonry-css";

import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchList } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedPost } from "@/types/board";

interface PostGridProps {
  /** Array of posts to display */
  posts: SavedPost[];
  /** Whether posts are currently loading */
  isLoading: boolean;
  /** Active filter for posts ("all" | "tiktok" | "instagram" | "recent") */
  activeFilter: string;
  /** Callback when post details are clicked */
  onPostClick?: (post: SavedPost) => void;
  /** Callback when post save is clicked */
  onSavePost?: (post: SavedPost) => void;
  /** Callback when post remove is clicked */
  onRemovePost?: (post: SavedPost) => void;
}

/**
 * PostGrid - Flexible masonry layout for displaying raw embeds
 *
 * Features:
 * - Pinterest-style masonry layout using react-masonry-css (1-4 columns based on screen size)
 * - Direct Instagram and TikTok embed display
 * - Post filtering by platform and recency
 * - Loading skeleton states
 * - Empty state handling
 * - Optimized rendering with React.memo
 *
 * Layout breakpoints:
 * - Mobile: 1 column
 * - Small tablet: 2 columns
 * - Large tablet: 3 columns
 * - Desktop: 4 columns
 *
 * Performance optimizations:
 * - Memoized filtered posts calculation
 * - Memoized loading skeleton with masonry layout
 * - Memoized empty state messages
 * - Recent filter with 30-day cutoff
 * - JavaScript-based masonry for optimal distribution
 */
export const PostGrid = React.memo<PostGridProps>(function PostGrid({
  posts,
  isLoading,
  activeFilter,
  onPostClick,
  onSavePost,
  onRemovePost,
}) {
  /**
   * Masonry breakpoints - matches saved posts and following pages
   */
  const breakpointColumnsObj = React.useMemo(
    () => ({
      default: 4, // xl:columns-4
      1280: 4, // xl
      1024: 3, // lg:columns-3
      640: 2, // sm:columns-2
      0: 1, // columns-1
    }),
    []
  );

  /**
   * Memoized filtered posts to prevent unnecessary recalculations
   * Filters posts based on platform or recency
   */
  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      if (activeFilter === "all") return true;
      if (activeFilter === "instagram") return post.platform === "instagram";
      if (activeFilter === "tiktok") return post.platform === "tiktok";
      if (activeFilter === "recent") {
        // Show posts from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(post.datePosted) >= thirtyDaysAgo;
      }
      return true;
    });
  }, [posts, activeFilter]);

  /**
   * Memoized loading skeleton to prevent recreation
   * Shows 6 skeleton cards in masonry layout
   */
  const loadingSkeleton = React.useMemo(
    () => (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4"
            role="status"
            aria-label="Loading post"
          >
            <Skeleton className="aspect-[9/16] w-full rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </Masonry>
    ),
    [breakpointColumnsObj]
  );

  /**
   * Memoized empty state message based on active filter
   */
  const emptyStateMessage = React.useMemo(() => {
    if (activeFilter === "all") {
      return "This board doesn't have any posts yet. Start adding posts to see them here.";
    }
    if (activeFilter === "recent") {
      return "No recent posts found in this board.";
    }
    return `No ${activeFilter} posts found in this board.`;
  }, [activeFilter]);

  /**
   * Memoized post items with stable callback references
   */
  const postItems = React.useMemo(() => {
    return filteredPosts.map(post => {
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
  }, [filteredPosts, onPostClick, onSavePost, onRemovePost]);

  // Loading state
  if (isLoading) {
    return loadingSkeleton;
  }

  // Empty state
  if (filteredPosts.length === 0) {
    return (
      <EmptyState
        icons={[SearchList]}
        title="No posts found"
        description={emptyStateMessage}
      />
    );
  }

  // Main grid render - masonry layout for mixed content
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-4"
      columnClassName="pl-4 bg-clip-padding"
      role="grid"
      aria-label={`${filteredPosts.length} posts in ${activeFilter} filter`}
    >
      {postItems}
    </Masonry>
  );
});
