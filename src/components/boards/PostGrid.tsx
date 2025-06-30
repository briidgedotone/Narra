import React from "react";

import { PostCard } from "@/components/shared/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchList } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedPost } from "@/types/board";

interface PostGridProps {
  /** Array of posts to display */
  posts: SavedPost[];
  /** Whether posts are currently loading */
  isLoading: boolean;
  /** Whether this is a shared/public view */
  isSharedView?: boolean;
  /** Active filter for posts ("all" | "tiktok" | "instagram" | "recent") */
  activeFilter: string;
  /** Callback when a post is clicked */
  onPostClick: (post: SavedPost) => void;
  /** Callback to remove post (undefined in shared view) */
  onRemovePost?: ((postId: string) => Promise<void>) | undefined;
  /** Function to get carousel index for a post */
  getCarouselIndex: (postId: string) => number;
  /** Callback for carousel next navigation */
  onCarouselNext: (postId: string, maxIndex: number) => void;
  /** Callback for carousel previous navigation */
  onCarouselPrev: (postId: string) => void;
}

/**
 * PostGrid - Responsive grid layout for displaying posts
 *
 * Features:
 * - Pinterest-style responsive grid (1-4 columns based on screen size)
 * - Post filtering by platform and recency
 * - Loading skeleton states
 * - Empty state handling
 * - Optimized rendering with React.memo
 *
 * Grid breakpoints:
 * - Mobile: 1 column
 * - Small tablet: 2 columns
 * - Large tablet: 3 columns
 * - Desktop: 4 columns
 *
 * Performance optimizations:
 * - Memoized filtered posts calculation
 * - Memoized loading skeleton
 * - Memoized empty state messages
 * - Recent filter with 30-day cutoff
 */
export const PostGrid = React.memo<PostGridProps>(function PostGrid({
  posts,
  isLoading,
  isSharedView = false,
  activeFilter,
  onPostClick,
  onRemovePost,
  getCarouselIndex,
  onCarouselNext,
  onCarouselPrev,
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
   * Shows 8 skeleton cards in grid layout
   */
  const loadingSkeleton = React.useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
            role="status"
            aria-label="Loading post"
          >
            <Skeleton className="aspect-[2/3] w-full rounded-t-xl" />
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

  // Main grid render
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="grid"
      aria-label={`${filteredPosts.length} posts in ${activeFilter} filter`}
    >
      {filteredPosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onPostClick={() => onPostClick(post)}
          onRemovePost={onRemovePost}
          isSharedView={isSharedView}
          getCarouselIndex={getCarouselIndex}
          onCarouselNext={onCarouselNext}
          onCarouselPrev={onCarouselPrev}
        />
      ))}
    </div>
  );
});
