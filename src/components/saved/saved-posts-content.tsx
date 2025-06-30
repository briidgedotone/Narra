"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { getAllUserSavedPosts } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Heart,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Folder,
  Share,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { proxyInstagramImage } from "@/lib/utils/image-proxy";

interface SavedPostsContentProps {
  userId: string;
}

interface SavedPost {
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
  profile: {
    handle: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
}

interface CarouselMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  isVideo: boolean;
}

export function SavedPostsContent({}: SavedPostsContentProps) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [postCarouselStates, setPostCarouselStates] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllUserSavedPosts(50, 0);
      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        setError(result.error || "Failed to load saved posts");
      }
    } catch (err) {
      console.error("Failed to load saved posts:", err);
      setError("Failed to load saved posts");
    } finally {
      setIsLoading(false);
    }
  };

  const getPostCarouselIndex = (postId: string) => {
    return postCarouselStates[postId] || 0;
  };

  const handlePostCarouselNext = (postId: string, maxIndex: number) => {
    setPostCarouselStates(prev => ({
      ...prev,
      [postId]: Math.min((prev[postId] || 0) + 1, maxIndex - 1),
    }));
  };

  const handlePostCarouselPrev = (postId: string) => {
    setPostCarouselStates(prev => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 0) - 1, 0),
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse"
            >
              <Skeleton className="aspect-[9/16] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadSavedPosts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icons={[Folder]}
        title="No saved posts yet"
        description="Posts you save to boards will appear here. Start by discovering content and saving posts to your boards."
        action={{
          label: "Discover Content",
          onClick: () => (window.location.href = "/discovery"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {posts.length} saved posts
        </div>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post, index) => (
            <div
              key={`${post.id}-${index}`}
              className={cn(
                "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg"
              )}
            >
              <div className={cn("relative aspect-[9/16]")}>
                {/* Display current carousel media or single media */}
                <div className="relative w-full h-full overflow-hidden">
                  {post.isCarousel &&
                  post.carouselMedia &&
                  post.carouselMedia.length > 0 ? (
                    // Carousel Media Display with Sliding Animation
                    <div
                      className="flex w-full h-full transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${getPostCarouselIndex(post.id) * 100}%)`,
                      }}
                    >
                      {post.carouselMedia.map((media, index) => (
                        <div
                          key={media.id || index}
                          className="w-full h-full flex-shrink-0"
                        >
                          {media.isVideo ? (
                            <video
                              src={proxyInstagramImage(media.url)}
                              poster={proxyInstagramImage(media.thumbnail)}
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
                                img.src = proxyInstagramImage(media.thumbnail);
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
                                e.currentTarget.src = "/placeholder-post.jpg";
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single Media Display
                    <div className="w-full h-full">
                      <video
                        src={
                          post.platform === "instagram"
                            ? `/api/proxy-image?url=${encodeURIComponent(post.embedUrl)}`
                            : post.embedUrl
                        }
                        poster={proxyInstagramImage(post.thumbnail)}
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
                          img.src = proxyInstagramImage(post.thumbnail);
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
                    </div>
                  )}
                </div>

                {/* Carousel Navigation Arrows */}
                {post.isCarousel &&
                  post.carouselMedia &&
                  post.carouselMedia.length > 1 && (
                    <>
                      {/* Previous Arrow */}
                      {getPostCarouselIndex(post.id) > 0 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handlePostCarouselPrev(post.id);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}

                      {/* Next Arrow */}
                      {getPostCarouselIndex(post.id) <
                        post.carouselMedia.length - 1 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handlePostCarouselNext(
                              post.id,
                              post.carouselMedia!.length
                            );
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}

                {/* Carousel Indicator Dots */}
                {post.isCarousel &&
                  post.carouselCount &&
                  post.carouselCount > 1 && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {Array.from({
                        length: Math.min(post.carouselCount, 5),
                      }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${
                            index === getPostCarouselIndex(post.id)
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}
              </div>

              <div className={cn("p-4 space-y-3")}>
                <p className="text-sm line-clamp-2">{post.caption}</p>

                <div className="flex items-center gap-4 mt-3">
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
                  {(post.platform === "tiktok" || post.metrics.views) && (
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">
                        {formatNumber(post.metrics.views || 0)}
                      </span>
                    </div>
                  )}
                  {(post.platform === "tiktok" || post.metrics.shares) && (
                    <div className="flex items-center gap-1.5">
                      <Share className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">
                        {formatNumber(post.metrics.shares || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {posts.map(post => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={proxyInstagramImage(post.thumbnail)}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Image
                    src={proxyInstagramImage(post.profile.avatarUrl)}
                    alt={post.profile.handle}
                    width={20}
                    height={20}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="text-sm font-medium">
                    @{post.profile.handle}
                  </span>
                  {post.profile.verified && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.caption}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">
                      {formatNumber(post.metrics.likes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      {formatNumber(post.metrics.comments)}
                    </span>
                  </div>
                  {(post.platform === "tiktok" || post.metrics.views) && (
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {formatNumber(post.metrics.views || 0)}
                      </span>
                    </div>
                  )}
                  {(post.platform === "tiktok" || post.metrics.shares) && (
                    <div className="flex items-center gap-1.5">
                      <Share className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        {formatNumber(post.metrics.shares || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
