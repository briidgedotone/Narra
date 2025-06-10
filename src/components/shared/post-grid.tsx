"use client";

import { cn } from "@/lib/utils";
import type { Post } from "@/types/content";

import { PostCard } from "./post-card";

interface PostGridProps {
  posts: Post[];
  onSavePost?: (post: Post) => void;
  onViewPostDetails?: (post: Post) => void;
  variant?: "discovery" | "following" | "collections" | "boards";
  className?: string;
  showLoadMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function PostGrid({
  posts,
  onSavePost,
  onViewPostDetails,
  variant = "discovery",
  className,
  showLoadMore = false,
  isLoading = false,
  onLoadMore,
}: PostGridProps) {
  // Grid column classes based on variant and screen size
  const getGridClasses = () => {
    switch (variant) {
      case "discovery":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
      case "following":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "collections":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "boards":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">📱</div>
        <h3 className="text-lg font-semibold mb-2">No posts found</h3>
        <p className="text-muted-foreground max-w-md">
          {variant === "discovery"
            ? "Search for a creator or hashtag to discover amazing content!"
            : variant === "following"
              ? "Follow some creators to see their latest posts here."
              : "No posts available in this collection yet."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Pinterest-style Grid */}
      <div className={cn("grid gap-4 auto-rows-max", getGridClasses())}>
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={cn(
              "break-inside-avoid",
              // Add some randomness to heights for Pinterest effect
              index % 7 === 0
                ? "row-span-1"
                : index % 5 === 0
                  ? "row-span-1"
                  : "row-span-1"
            )}
          >
            <PostCard
              post={post}
              {...(onSavePost && { onSave: onSavePost })}
              {...(onViewPostDetails && { onViewDetails: onViewPostDetails })}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className={cn(
              "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium",
              "hover:bg-primary/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? "Loading..." : "Load More Posts"}
          </button>
        </div>
      )}
    </div>
  );
}

// Specialized grid components for different contexts
export function DiscoveryGrid(props: Omit<PostGridProps, "variant">) {
  return <PostGrid {...props} variant="discovery" />;
}

export function FollowingGrid(props: Omit<PostGridProps, "variant">) {
  return <PostGrid {...props} variant="following" />;
}

export function CollectionsGrid(props: Omit<PostGridProps, "variant">) {
  return <PostGrid {...props} variant="collections" />;
}

export function BoardGrid(props: Omit<PostGridProps, "variant">) {
  return <PostGrid {...props} variant="boards" />;
}
