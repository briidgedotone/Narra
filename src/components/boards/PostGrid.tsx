import React from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { SearchList } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedPost } from "@/types/board";

import { PostCard } from "./PostCard";

interface PostGridProps {
  posts: SavedPost[];
  isLoading: boolean;
  isSharedView?: boolean;
  activeFilter: string;
  onPostClick: (post: SavedPost) => void;
  onRemovePost?: ((postId: string) => Promise<void>) | undefined;
  getCarouselIndex: (postId: string) => number;
  onCarouselNext: (postId: string, maxIndex: number) => void;
  onCarouselPrev: (postId: string) => void;
}

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
  // Memoize filtered posts to prevent unnecessary recalculations
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

  // Memoize loading skeleton to prevent recreation
  const loadingSkeleton = React.useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <Skeleton className="aspect-square w-full rounded-t-xl" />
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

  // Memoize empty state message based on filter
  const emptyStateMessage = React.useMemo(() => {
    if (activeFilter === "all") {
      return "This board doesn't have any posts yet. Start adding posts to see them here.";
    }
    if (activeFilter === "recent") {
      return "No recent posts found in this board.";
    }
    return `No ${activeFilter} posts found in this board.`;
  }, [activeFilter]);

  if (isLoading) {
    return loadingSkeleton;
  }

  if (filteredPosts.length === 0) {
    return (
      <EmptyState
        icons={[SearchList]}
        title="No posts found"
        description={emptyStateMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredPosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          isSharedView={isSharedView}
          onPostClick={onPostClick}
          onRemovePost={onRemovePost}
          getCarouselIndex={getCarouselIndex}
          onCarouselNext={onCarouselNext}
          onCarouselPrev={onCarouselPrev}
        />
      ))}
    </div>
  );
});
