import Image from "next/image";
import React from "react";

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
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { proxyImage, proxyInstagramImage } from "@/lib/utils/image-proxy";
import type { Post } from "@/types/content";

interface PostCardProps {
  post: Post;
  onPostClick?: (post: Post) => void;
  onSavePost?: (post: Post) => void;
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

  /**
   * Memoized event handlers to prevent unnecessary re-renders
   */
  const handlePostClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onPostClick?.(post);
    },
    [onPostClick, post]
  );

  const handleSavePost = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSavePost?.(post);
    },
    [onSavePost, post]
  );

  const handleRemovePost = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      await onRemovePost?.(post.id);
    },
    [onRemovePost, post.id]
  );

  const handleCarouselPrev = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onCarouselPrev?.(post.id);
    },
    [onCarouselPrev, post.id]
  );

  const handleCarouselNext = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onCarouselNext?.(post.id, post.carouselMedia?.length || 0);
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
    <article
      className={cn(
        "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg",
        onPostClick && "cursor-pointer"
      )}
      onClick={onPostClick ? handlePostClick : undefined}
      role={onPostClick ? "button" : "article"}
      tabIndex={onPostClick ? 0 : undefined}
    >
      <div className={cn("relative aspect-[4/5]")}>
        {/* Display current carousel media or single media */}
        <div className="relative w-full h-full overflow-hidden">
          {post.isCarousel &&
          post.carouselMedia &&
          post.carouselMedia.length > 0 ? (
            // Carousel Media Display
            <div
              className="flex w-full h-full transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {post.carouselMedia.map((media, index) => (
                <div
                  key={media.id || index}
                  className="w-full h-full flex-shrink-0"
                >
                  {media.isVideo ? (
                    <video
                      src={proxyImage(media.url, post.platform)}
                      poster={proxyImage(media.thumbnail, post.platform)}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      playsInline
                      onMouseEnter={e => {
                        e.currentTarget.play();
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                      onError={e => {
                        // Fallback to image if video fails
                        const img = document.createElement("img");
                        img.src = proxyImage(media.thumbnail, post.platform);
                        img.className = "w-full h-full object-cover";
                        img.alt = "Post media";
                        if (e.currentTarget.parentNode) {
                          e.currentTarget.parentNode.replaceChild(
                            img,
                            e.currentTarget
                          );
                        }
                      }}
                    />
                  ) : (
                    <Image
                      src={proxyInstagramImage(media.url)}
                      alt="Post media"
                      fill
                      className="object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-post.jpg";
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Single Media Display
            <div className="w-full h-full">
              {post.isVideo ? (
                <video
                  src={post.embedUrl}
                  poster={proxyImage(post.thumbnail, post.platform)}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  onMouseEnter={e => {
                    e.currentTarget.play();
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                  onError={e => {
                    // Fallback to image if video fails
                    const img = document.createElement("img");
                    img.src = proxyImage(post.thumbnail, post.platform);
                    img.className = "w-full h-full object-cover";
                    img.alt = "Post thumbnail";
                    if (e.currentTarget.parentNode) {
                      e.currentTarget.parentNode.replaceChild(
                        img,
                        e.currentTarget
                      );
                    }
                  }}
                />
              ) : (
                <Image
                  src={proxyImage(post.thumbnail, post.platform)}
                  alt="Post thumbnail"
                  fill
                  className="object-cover"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-post.jpg";
                  }}
                />
              )}
            </div>
          )}
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
          {post.isVideo && post.metrics.views && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">
                {formatNumber(post.metrics.views)}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
