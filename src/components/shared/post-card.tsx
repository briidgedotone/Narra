import Image from "next/image";
import React, { useCallback, useEffect } from "react";

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
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";

interface PostCardProps {
  post: {
    id: string;
    embedUrl: string;
    caption: string;
    originalUrl?: string;
    thumbnail?: string; // Keep for backward compatibility with Instagram
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
  onRemovePost?: ((postId: string) => Promise<void>) | undefined;
  getCarouselIndex?: (postId: string) => number;
  onCarouselNext?: (postId: string, maxIndex: number) => void;
  onCarouselPrev?: (postId: string) => void;
  isSharedView?: boolean;
  context?: "discovery" | "board" | "following";
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
  context = "discovery", // Default to discovery for backward compatibility
}) {
  // Get current carousel state
  const currentIndex = getCarouselIndex(post.id);
  const currentMedia = post.isCarousel
    ? post.carouselMedia?.[currentIndex]
    : null;

  const displayThumbnail = currentMedia?.thumbnail || post.thumbnail;
  const proxiedThumbnail = displayThumbnail 
    ? `/api/image-proxy?url=${encodeURIComponent(displayThumbnail)}`
    : "";

  // Determine if we should use TikTok embed
  const shouldUseTikTokEmbed = 
    post.platform === "tiktok" && 
    post.originalUrl &&
    (context === "board" || context === "following");

  // Fallback: Determine if we should use video first frame instead of thumbnail
  const shouldUseVideoFirstFrame =
    post.platform === "tiktok" &&
    (context === "board" || context === "following") &&
    post.embedUrl &&
    !shouldUseTikTokEmbed;

  // State to track video loading failures for fallback
  const [videoLoadFailed, setVideoLoadFailed] = React.useState(false);
  
  // State for TikTok embed
  const [embedHtml, setEmbedHtml] = React.useState<string | null>(null);
  const [embedLoading, setEmbedLoading] = React.useState(false);
  const [embedError, setEmbedError] = React.useState(false);

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

  // Fetch TikTok embed when needed
  useEffect(() => {
    if (shouldUseTikTokEmbed && post.originalUrl && !embedHtml && !embedLoading && !embedError) {
      setEmbedLoading(true);
      
      fetch('/api/test-tiktok-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: post.originalUrl })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.html) {
            // Extract just the iframe from the embed HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.data.html, 'text/html');
            const iframe = doc.querySelector('iframe');
            if (iframe) {
              // Adjust iframe for PostCard display
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.position = 'absolute';
              iframe.style.top = '0';
              iframe.style.left = '0';
              setEmbedHtml(iframe.outerHTML);
            } else {
              setEmbedError(true);
            }
          } else {
            setEmbedError(true);
          }
        })
        .catch(() => setEmbedError(true))
        .finally(() => setEmbedLoading(false));
    }
  }, [shouldUseTikTokEmbed, post.originalUrl, embedHtml, embedLoading, embedError]);

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
          {shouldUseTikTokEmbed && embedHtml ? (
            // TikTok embed
            <div 
              className="absolute inset-0 h-full w-full"
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          ) : shouldUseTikTokEmbed && embedLoading ? (
            // Loading state for TikTok embed
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : shouldUseVideoFirstFrame && !videoLoadFailed ? (
            // Use video first frame for TikTok in board/following contexts
            <video
              className="absolute inset-0 h-full w-full object-cover"
              preload="metadata"
              muted
              playsInline
              onError={() => {
                console.log("Video failed to load, falling back to thumbnail");
                setVideoLoadFailed(true);
              }}
              onLoadStart={() => {
                // Reset failure state when trying to load
                setVideoLoadFailed(false);
              }}
            >
              <source src={post.embedUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : displayThumbnail || post.platform === "instagram" ? (
            // Use thumbnail approach for Instagram and Discovery context
            <>
              <Image
                src={
                  currentMedia?.thumbnail
                    ? `/api/proxy-image?url=${encodeURIComponent(currentMedia.thumbnail)}`
                    : proxiedThumbnail
                }
                alt="Post thumbnail"
                fill
                className="object-cover"
                loading="lazy"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback =
                    target.nextElementSibling as HTMLElement | null;
                  if (fallback) {
                    fallback.style.display = "flex";
                  }
                }}
              />
              <div className="absolute inset-0 hidden h-full w-full flex-col items-center justify-center bg-gray-200 text-center text-xs text-gray-500">
                <p>Image could not be loaded.</p>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-500">
              {post.platform === "tiktok" ? (
                <>
                  <TikTok className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">TikTok Video</p>
                </>
              ) : (
                <p>No caption available</p>
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

        {/* Carousel indicator */}
        {hasCarousel && (
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-white text-xs font-medium">
                {currentIndex + 1}/{post.carouselMedia?.length}
              </span>
            </div>
          </div>
        )}

        {/* Video play indicator */}
        {(post.isVideo || currentMedia?.isVideo) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
            </div>
          </div>
        )}

        {/* Carousel Navigation */}
        {hasCarousel && (
          <>
            {/* Previous Arrow */}
            {!isFirstSlide && (
              <button
                onClick={handleCarouselPrev}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-1.5 shadow-md transition-colors backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Next Arrow */}
            {!isLastSlide && (
              <button
                onClick={handleCarouselNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-1.5 shadow-md transition-colors backdrop-blur-sm"
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
            <button
              onClick={handleSavePost}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors mr-2"
              title="Save to board"
            >
              <Bookmark className="h-4 w-4 text-gray-700" />
            </button>
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
          {(post.platform === "tiktok" ||
            (post.metrics.views !== undefined && post.metrics.views > 0)) && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">
                {formatNumber(post.metrics.views || 0)}
              </span>
            </div>
          )}
          {(post.platform === "tiktok" ||
            (post.metrics.shares !== undefined && post.metrics.shares > 0)) && (
            <div className="flex items-center gap-1.5">
              <Share className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">
                {formatNumber(post.metrics.shares || 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
