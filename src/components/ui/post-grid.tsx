"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Types for posts in the grid
export interface PostGridItem {
  id: string;
  embedUrl: string;
  thumbnail?: string;
  platform: "tiktok" | "instagram";
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  aspectRatio?: number; // width/height ratio for proper sizing
}

// Post Grid Container
interface PostGridProps {
  posts: PostGridItem[];
  onPostClick?: (post: PostGridItem) => void;
  onSavePost?: (post: PostGridItem) => void;
  className?: string;
  columns?: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  gap?: "sm" | "md" | "lg";
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function PostGrid({
  posts,
  onPostClick,
  onSavePost,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  loading = false,
  emptyState,
}: PostGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = `columns-${columns.sm} sm:columns-${columns.md} lg:columns-${columns.lg} xl:columns-${columns.xl}`;

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <PostGridSkeleton columns={columns} gap={gap} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {emptyState || <PostGridEmpty />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full",
        columnClasses,
        gapClasses[gap],
        "space-y-0", // Masonry handles spacing
        className
      )}
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="break-inside-avoid mb-4"
          style={{
            // Add slight randomization to heights for natural masonry effect
            marginBottom: `${12 + (index % 3) * 4}px`,
          }}
        >
          <PostCard
            post={post}
            onClick={() => onPostClick?.(post)}
            onSave={() => onSavePost?.(post)}
          />
        </div>
      ))}
    </div>
  );
}

// Individual Post Card Component
interface PostCardProps {
  post: PostGridItem;
  onClick?: () => void;
  onSave?: () => void;
  className?: string;
}

export function PostCard({ post, onClick, onSave, className }: PostCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [saveHovered, setSaveHovered] = React.useState(false);

  // Calculate dynamic height based on aspect ratio
  const aspectRatio = post.aspectRatio || 9 / 16; // Default to TikTok ratio
  const maxHeight = 400;
  const minHeight = 200;
  const calculatedHeight = Math.min(
    maxHeight,
    Math.max(minHeight, 250 / aspectRatio)
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div
      className={cn(
        "group relative bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border",
        className
      )}
      onClick={onClick}
      style={{ height: calculatedHeight }}
    >
      {/* Thumbnail/Preview */}
      <div className="relative w-full h-full">
        {post.thumbnail ? (
          <>
            <img
              src={post.thumbnail}
              alt="Post thumbnail"
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                imageLoaded ? "opacity-100" : "opacity-0",
                "group-hover:scale-105"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <PostCardSkeleton />}
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-sm">
              {post.platform === "tiktok" ? "TikTok" : "Instagram"}
            </div>
          </div>
        )}

        {/* Platform Badge */}
        <div className="absolute top-2 left-2">
          <PlatformBadge platform={post.platform} />
        </div>

        {/* Save Button */}
        <button
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            saveHovered && "bg-primary text-primary-foreground"
          )}
          onClick={e => {
            e.stopPropagation();
            onSave?.();
          }}
          onMouseEnter={() => setSaveHovered(true)}
          onMouseLeave={() => setSaveHovered(false)}
        >
          <SaveIcon className="w-4 h-4" />
        </button>

        {/* Overlay with metrics */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <HeartIcon className="w-3 h-3" />
                <span>{formatNumber(post.metrics.likes)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChatIcon className="w-3 h-3" />
                <span>{formatNumber(post.metrics.comments)}</span>
              </div>
              {post.metrics.views && (
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{formatNumber(post.metrics.views)}</span>
                </div>
              )}
            </div>
            <div className="text-xs opacity-75">
              {new Date(post.datePosted).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Platform Badge Component
interface PlatformBadgeProps {
  platform: "tiktok" | "instagram";
  size?: "sm" | "md";
}

export function PlatformBadge({ platform, size = "sm" }: PlatformBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const platformConfig = {
    tiktok: {
      label: "TikTok",
      className: "bg-black text-white",
    },
    instagram: {
      label: "IG",
      className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    },
  };

  const config = platformConfig[platform];

  return (
    <div
      className={cn(
        "rounded-md font-medium backdrop-blur-sm",
        sizeClasses[size],
        config.className
      )}
    >
      {config.label}
    </div>
  );
}

// Loading Skeleton
export function PostGridSkeleton({
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  count = 12,
}: {
  columns?: PostGridProps["columns"];
  gap?: PostGridProps["gap"];
  count?: number;
}) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = `columns-${columns.sm} sm:columns-${columns.md} lg:columns-${columns.lg} xl:columns-${columns.xl}`;

  return (
    <div className={cn("w-full", columnClasses, gapClasses[gap])}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="break-inside-avoid mb-4">
          <PostCardSkeleton
            height={180 + (index % 4) * 40} // Varied heights
          />
        </div>
      ))}
    </div>
  );
}

function PostCardSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="w-full bg-muted rounded-lg animate-pulse"
      style={{ height }}
    >
      <div className="p-3 h-full flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-12 h-5 bg-muted-foreground/20 rounded"></div>
          <div className="w-6 h-6 bg-muted-foreground/20 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="flex space-x-3">
            <div className="w-8 h-3 bg-muted-foreground/20 rounded"></div>
            <div className="w-8 h-3 bg-muted-foreground/20 rounded"></div>
            <div className="w-8 h-3 bg-muted-foreground/20 rounded"></div>
          </div>
          <div className="w-16 h-2 bg-muted-foreground/20 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Empty State
export function PostGridEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <SearchIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No posts found</h3>
      <p className="text-muted-foreground max-w-sm">
        Try adjusting your search criteria or explore different profiles to
        discover amazing content.
      </p>
    </div>
  );
}

// Simple Icons (you might want to replace with proper icon library)
const SaveIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
