import React, { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  TikTok,
  Instagram,
  Share,
} from "@/components/ui/icons";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";

interface PostCardProps {
  post: {
    id: string;
    embedUrl: string;
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
  };
  onPostClick?: (post: PostCardProps["post"]) => void;
  onSavePost?: (post: PostCardProps["post"]) => void;
  onRemovePost?: (postId: string) => Promise<void>;
  getCarouselIndex?: (postId: string) => number;
  onCarouselNext?: (postId: string, maxIndex: number) => void;
  onCarouselPrev?: (postId: string) => void;
  isSharedView?: boolean;
}

export const PostCard = React.memo<PostCardProps>(function PostCard({
  post,
  onPostClick,
  onSavePost,
  onRemovePost,
  getCarouselIndex = () => 0,
  onCarouselNext,
  onCarouselPrev,
  isSharedView = false,
}) {
  // Get current carousel state
  const currentIndex = getCarouselIndex(post.id);
  const currentMedia = post.isCarousel
    ? post.carouselMedia?.[currentIndex]
    : null;

  const displayThumbnail = currentMedia?.thumbnail || post.thumbnail;

  /**
   * Memoized event handlers to prevent unnecessary re-renders
   */
  const handlePostClick = useCallback(() => {
    onPostClick?.(post);
  }, [onPostClick, post]);

  const handleSavePost = useCallback(() => {
    onSavePost?.(post);
  }, [onSavePost, post]);

  const handleRemovePost = useCallback(async () => {
    if (onRemovePost) {
      await onRemovePost(post.id);
    }
  }, [onRemovePost, post.id]);

  const handleCarouselNext = useCallback(() => {
    if (onCarouselNext && post.carouselMedia) {
      onCarouselNext(post.id, post.carouselMedia.length - 1);
    }
  }, [onCarouselNext, post.id, post.carouselMedia]);

  const handleCarouselPrev = useCallback(() => {
    if (onCarouselPrev) {
      onCarouselPrev(post.id);
    }
  }, [onCarouselPrev, post.id]);

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
    <article
      className={cn(
        "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg",
        onPostClick && "cursor-pointer"
      )}
      onClick={onPostClick ? handlePostClick : undefined}
      role={onPostClick ? "button" : "article"}
      tabIndex={onPostClick ? 0 : undefined}
    >
      <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-100">
        {/* Post thumbnail */}
        <div className="relative h-full w-full">
          <OptimizedImage
            src={displayThumbnail}
            alt={post.caption}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>

        {/* Platform indicator */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
            {platformIcon}
          </div>
        </div>

        {/* Carousel Navigation */}
        {hasCarousel && (
          <>
            {/* Previous Arrow */}
            {!isFirstSlide && (
              <button
                onClick={handleCarouselPrev}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Next Arrow */}
            {!isLastSlide && (
              <button
                onClick={handleCarouselNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Carousel Indicators */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
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

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isSharedView && onSavePost && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSavePost}
              className="mr-2"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
          {!isSharedView && onRemovePost && (
            <Button size="sm" variant="destructive" onClick={handleRemovePost}>
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Post Details */}
      <div className={cn("p-4 space-y-3")}>
        <p className="text-sm line-clamp-2">{post.caption}</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-medium text-sm">
              {formatNumber(post.metrics.likes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">
              {formatNumber(post.metrics.comments)}
            </span>
          </div>
          {post.metrics.views && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">
                {formatNumber(post.metrics.views)}
              </span>
            </div>
          )}
          {post.metrics.shares && (
            <div className="flex items-center gap-1.5">
              <Share className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">
                {formatNumber(post.metrics.shares)}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
