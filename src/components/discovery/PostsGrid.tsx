"use client";

import { InstagramIcon, TiktokIcon } from "hugeicons-react";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Search,
  FileQuestion,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Share,
} from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { proxyImage, proxyInstagramImage } from "@/lib/utils/image-proxy";
import { Post, Profile, Platform, SortOption } from "@/types/discovery";

interface PostsGridProps {
  searchResults: Profile | null;
  posts: Post[];
  isLoading: boolean;
  isLoadingMorePosts: boolean;
  hasMorePosts: boolean;
  tiktokHasMore: boolean;
  sortOption: SortOption;
  selectedPlatform: Platform;
  hasSearched: boolean;
  searchError: string | null;
  searchQuery: string;
  onPostClick: (post: Post) => void;
  onSavePost: (post: Post) => void;
  onLoadMorePosts: () => void;
  onSortChange: (value: SortOption) => void;
  onPlatformChange: (platform: Platform) => void;
  onResetSearch: () => void;
  getPostCarouselIndex: (postId: string) => number;
  onPostCarouselNext: (postId: string, maxIndex: number) => void;
  onPostCarouselPrev: (postId: string) => void;
}

export function PostsGrid({
  searchResults,
  posts,
  isLoading,
  isLoadingMorePosts,
  hasMorePosts,
  tiktokHasMore,
  sortOption,
  selectedPlatform,
  hasSearched,
  searchError,
  searchQuery,
  onPostClick,
  onSavePost,
  onLoadMorePosts,
  onSortChange,
  onPlatformChange,
  onResetSearch,
  getPostCarouselIndex,
  onPostCarouselNext,
  onPostCarouselPrev,
}: PostsGridProps) {
  // Empty state when no search
  if (!searchResults && !isLoading && !hasSearched) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Platform Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Start Your Content Discovery
            </h2>
            <p className="text-muted-foreground">
              Choose a platform and search for creators to explore their latest
              posts and find inspiration for your content strategy.
            </p>
          </div>

          {/* Platform Buttons */}
          <div className="flex justify-center gap-6">
            <Button
              variant={selectedPlatform === "tiktok" ? "default" : "outline"}
              onClick={() => onPlatformChange("tiktok")}
              className={cn(
                "flex items-center gap-4 px-12 py-6 text-lg font-semibold w-48 justify-center",
                selectedPlatform === "tiktok"
                  ? "bg-black text-white border-0 shadow-lg hover:bg-gray-800"
                  : "border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              <TiktokIcon className="w-7 h-7" />
              TikTok ✨
            </Button>
            <Button
              variant={selectedPlatform === "instagram" ? "default" : "outline"}
              onClick={() => onPlatformChange("instagram")}
              className={cn(
                "flex items-center gap-4 px-12 py-6 text-lg font-semibold w-48 justify-center",
                selectedPlatform === "instagram"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg"
                  : "border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              )}
            >
              <InstagramIcon className="w-7 h-7" />
              Instagram ✨
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state when search fails or no results
  if (!searchResults && !isLoading && hasSearched && searchError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <EmptyState
          title="No Results Found"
          description={`We couldn't find a creator with the handle "${searchQuery}". Try checking the spelling or searching for a different creator.`}
          icons={[Search, FileQuestion]}
          action={{
            label: "Try Another Search",
            onClick: onResetSearch,
          }}
        />
      </div>
    );
  }

  // Loading state during search
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Profile Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Avatar Skeleton */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Skeleton className="w-20 h-20 rounded-full" />
                </div>
              </div>

              {/* Profile Info Skeleton */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Stats Skeleton */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <Skeleton className="h-5 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-5 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-5 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section Skeleton */}
        <div className="space-y-4">
          {/* Posts Header Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>

          {/* Posts Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
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
      </div>
    );
  }

  // Posts Section
  if (!searchResults || (!isLoading && posts.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Posts Header & Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Posts ({posts.length})</h3>

        <div className="flex items-center gap-4">
          <Select value={sortOption} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most-recent">Most Recent</SelectItem>
              <SelectItem value="most-viewed">Most Viewed</SelectItem>
              <SelectItem value="most-liked">Most Liked</SelectItem>
              <SelectItem value="most-commented">Most Commented</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map((post, index) => (
          <div
            key={`${post.id}-${index}`}
            onClick={() => onPostClick(post)}
            className={cn(
              "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg"
            )}
          >
            <div className={cn("relative aspect-[2/3]")}>
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
                            src={proxyImage(media.url, post.platform)}
                            poster={
                              media.thumbnail
                                ? proxyImage(media.thumbnail, post.platform)
                                : undefined
                            }
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
                              img.src = media.thumbnail
                                ? proxyImage(media.thumbnail, post.platform)
                                : "/placeholder-post.jpg";
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
                  // Single Media Display (existing logic)
                  <div className="w-full h-full">
                    <video
                      src={
                        post.platform === "instagram"
                          ? `/api/proxy-image?url=${encodeURIComponent(post.embedUrl)}`
                          : post.embedUrl
                      }
                      poster={
                        post.thumbnail
                          ? proxyInstagramImage(post.thumbnail)
                          : undefined
                      }
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
                        img.src = post.thumbnail
                          ? proxyInstagramImage(post.thumbnail)
                          : "/placeholder-post.jpg";
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
                          onPostCarouselPrev(post.id);
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
                          onPostCarouselNext(
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

              {/* Save Button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSavePost(post);
                  }}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
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
                {(post.platform === "tiktok" ||
                  (post.metrics.views !== undefined &&
                    post.metrics.views > 0)) && (
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">
                      {formatNumber(post.metrics.views || 0)}
                    </span>
                  </div>
                )}
                {(post.platform === "tiktok" ||
                  (post.metrics.shares !== undefined &&
                    post.metrics.shares > 0)) && (
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

      {/* Load More Button for Both Platforms */}
      {!isLoading &&
        ((searchResults?.platform === "instagram" && hasMorePosts) ||
          (searchResults?.platform === "tiktok" && tiktokHasMore)) && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={onLoadMorePosts}
              disabled={isLoadingMorePosts}
              variant="outline"
              size="lg"
              className="px-8"
            >
              {isLoadingMorePosts ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Loading More Posts...
                </>
              ) : (
                <>
                  Load More Posts
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
    </div>
  );
}
