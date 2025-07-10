import React from "react";

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
}

/**
 * PostGrid - Flexible masonry layout for displaying raw embeds
 *
 * Features:
 * - Pinterest-style masonry layout using CSS columns (1-3 columns based on screen size)
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
 *
 * Performance optimizations:
 * - Memoized filtered posts calculation
 * - Memoized loading skeleton
 * - Memoized empty state messages
 * - Recent filter with 30-day cutoff
 * - Break-inside-avoid for better column distribution
 */
export const PostGrid = React.memo<PostGridProps>(function PostGrid({
  posts,
  isLoading,
  activeFilter,
}) {
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
   * Shows 6 skeleton cards in flexible column layout
   */
  const loadingSkeleton = React.useMemo(
    () => (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 break-inside-avoid mb-6"
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
      </div>
    ),
    []
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

  // Main grid render - flexible layout for mixed content
  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 masonry-container"
      role="grid"
      aria-label={`${filteredPosts.length} posts in ${activeFilter} filter`}
    >
      {filteredPosts.map(post => (
        <div key={post.id} className="masonry-item mb-6">
          {post.platform === "instagram" ? (
            <InstagramEmbed url={post.originalUrl || post.embedUrl} />
          ) : (
            <TikTokEmbed url={post.originalUrl || post.embedUrl} />
          )}
        </div>
      ))}
    </div>
  );
});
