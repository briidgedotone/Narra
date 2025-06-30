import React from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Instagram,
  MessageCircle,
  Share,
  TikTok,
  TimeQuarter,
  Trash2,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { proxyImage } from "@/lib/utils/image-proxy";
import type { SavedPost } from "@/types/board";

interface PostCardProps {
  /** The post data to display */
  post: SavedPost;
  /** Whether this is a shared/public view (hides remove button) */
  isSharedView?: boolean;
  /** Callback when post is clicked to open modal */
  onPostClick: (post: SavedPost) => void;
  /** Callback to remove post from board (undefined in shared view) */
  onRemovePost?: ((postId: string) => Promise<void>) | undefined;
  /** Function to get current carousel index for this post */
  getCarouselIndex: (postId: string) => number;
  /** Callback to navigate to next carousel item */
  onCarouselNext: (postId: string, maxIndex: number) => void;
  /** Callback to navigate to previous carousel item */
  onCarouselPrev: (postId: string) => void;
}

/**
 * PostCard - Individual post display component with carousel navigation
 *
 * Features:
 * - Pinterest-style card layout with hover effects
 * - Platform icons (TikTok/Instagram) with overlay
 * - Carousel navigation for multi-image posts
 * - Profile information with verification badges
 * - Engagement metrics (views, likes, comments, shares)
 * - Remove button for board management
 * - Lazy loading images for performance
 * - Optimized with React.memo for re-render prevention
 *
 * Performance optimizations:
 * - Memoized event handlers with useCallback
 * - Memoized platform icon rendering
 * - Computed carousel state values
 * - Lazy image loading
 */
export const PostCard = React.memo<PostCardProps>(function PostCard({
  post,
  isSharedView = false,
  onPostClick,
  onRemovePost,
  getCarouselIndex,
  onCarouselNext,
  onCarouselPrev,
}) {
  // Get current carousel state
  const currentIndex = getCarouselIndex(post.id);
  const currentMedia = post.isCarousel
    ? post.carouselMedia?.[currentIndex]
    : null;

  const displayThumbnail = post.isCarousel
    ? currentMedia?.thumbnail || post.thumbnail
    : post.thumbnail;

  /**
   * Memoized event handlers to prevent unnecessary re-renders
   */
  const handlePostClick = React.useCallback(() => {
    onPostClick(post);
  }, [onPostClick, post]);

  const handleRemovePost = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemovePost?.(post.id);
    },
    [onRemovePost, post.id]
  );

  const handleCarouselPrev = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCarouselPrev(post.id);
    },
    [onCarouselPrev, post.id]
  );

  const handleCarouselNext = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCarouselNext(post.id, post.carouselMedia?.length || 0);
    },
    [onCarouselNext, post.id, post.carouselMedia?.length]
  );

  /**
   * Memoized platform icon to prevent recreation
   */
  const platformIcon = React.useMemo(() => {
    return post.platform === "tiktok" ? (
      <TikTok className="w-4 h-4 text-white" />
    ) : (
      <Instagram className="w-4 h-4 text-white" />
    );
  }, [post.platform]);

  // Computed carousel state
  const hasCarousel =
    post.isCarousel && post.carouselMedia && post.carouselMedia.length > 1;
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === (post.carouselMedia?.length || 1) - 1;

  return (
    <article className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      {/* Post thumbnail/video section */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={handlePostClick}
        role="button"
        tabIndex={0}
        aria-label={`View post: ${post.caption || "Untitled post"}`}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePostClick();
          }
        }}
      >
        <img
          src={proxyImage(displayThumbnail, post.platform)}
          alt={post.caption || "Post thumbnail"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-post.jpg";
          }}
        />

        {/* Platform indicator */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
            {platformIcon}
          </div>
        </div>

        {/* Carousel navigation controls */}
        {hasCarousel && (
          <>
            <button
              onClick={handleCarouselPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isFirstSlide}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCarouselNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isLastSlide}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Carousel position indicators */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1"
              role="tablist"
            >
              {post.carouselMedia?.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  )}
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Image ${index + 1} of ${post.carouselMedia?.length}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Remove button (only in edit mode) */}
        {!isSharedView && onRemovePost && (
          <button
            onClick={handleRemovePost}
            className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove from board"
            aria-label="Remove post from board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Post information section */}
      <div className="p-4">
        {/* Profile information */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={proxyImage(post.profile.avatarUrl, post.platform, true)}
            alt={`${post.profile.displayName} profile picture`}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-avatar.jpg";
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="font-medium text-sm text-gray-900 truncate">
                {post.profile.displayName}
              </p>
              {post.profile.verified && (
                <div
                  className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                  title="Verified account"
                  aria-label="Verified account"
                >
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              @{post.profile.handle}
            </p>
          </div>
        </div>

        {/* Post caption */}
        {post.caption && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        )}

        {/* Engagement metrics */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {post.metrics.views && (
              <div
                className="flex items-center gap-1"
                title={`${formatNumber(post.metrics.views)} views`}
              >
                <Eye className="w-3 h-3" />
                <span>{formatNumber(post.metrics.views)}</span>
              </div>
            )}
            <div
              className="flex items-center gap-1"
              title={`${formatNumber(post.metrics.likes)} likes`}
            >
              <Heart className="w-3 h-3" />
              <span>{formatNumber(post.metrics.likes)}</span>
            </div>
            <div
              className="flex items-center gap-1"
              title={`${formatNumber(post.metrics.comments)} comments`}
            >
              <MessageCircle className="w-3 h-3" />
              <span>{formatNumber(post.metrics.comments)}</span>
            </div>
            {post.metrics.shares && (
              <div
                className="flex items-center gap-1"
                title={`${formatNumber(post.metrics.shares)} shares`}
              >
                <Share className="w-3 h-3" />
                <span>{formatNumber(post.metrics.shares)}</span>
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-1"
            title={`Posted ${formatDate(post.datePosted)}`}
          >
            <TimeQuarter className="w-3 h-3" />
            <span>{formatDate(post.datePosted)}</span>
          </div>
        </div>
      </div>
    </article>
  );
});
