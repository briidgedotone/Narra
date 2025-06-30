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
  post: SavedPost;
  isSharedView?: boolean;
  onPostClick: (post: SavedPost) => void;
  onRemovePost?: ((postId: string) => Promise<void>) | undefined;
  getCarouselIndex: (postId: string) => number;
  onCarouselNext: (postId: string, maxIndex: number) => void;
  onCarouselPrev: (postId: string) => void;
}

export function PostCard({
  post,
  isSharedView = false,
  onPostClick,
  onRemovePost,
  getCarouselIndex,
  onCarouselNext,
  onCarouselPrev,
}: PostCardProps) {
  const currentIndex = getCarouselIndex(post.id);
  const currentMedia = post.isCarousel
    ? post.carouselMedia?.[currentIndex]
    : null;

  const displayThumbnail = post.isCarousel
    ? currentMedia?.thumbnail || post.thumbnail
    : post.thumbnail;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      {/* Post Image/Video */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={() => onPostClick(post)}
      >
        <img
          src={proxyImage(displayThumbnail, post.platform)}
          alt={post.caption}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-post.jpg";
          }}
        />

        {/* Platform Icon */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
            {post.platform === "tiktok" ? (
              <TikTok className="w-4 h-4 text-white" />
            ) : (
              <Instagram className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Carousel Navigation */}
        {post.isCarousel &&
          post.carouselMedia &&
          post.carouselMedia.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onCarouselPrev(post.id);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onCarouselNext(post.id, post.carouselMedia?.length || 0);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={
                  currentIndex === (post.carouselMedia?.length || 1) - 1
                }
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Carousel Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {post.carouselMedia.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}

        {/* Remove Button */}
        {!isSharedView && onRemovePost && (
          <button
            onClick={e => {
              e.stopPropagation();
              onRemovePost(post.id);
            }}
            className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove from board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Post Info */}
      <div className="p-4">
        {/* Profile Info */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={proxyImage(post.profile.avatarUrl, post.platform, true)}
            alt={post.profile.displayName}
            className="w-8 h-8 rounded-full object-cover"
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
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              @{post.profile.handle}
            </p>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {post.metrics.views && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(post.metrics.views)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(post.metrics.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{formatNumber(post.metrics.comments)}</span>
            </div>
            {post.metrics.shares && (
              <div className="flex items-center gap-1">
                <Share className="w-3 h-3" />
                <span>{formatNumber(post.metrics.shares)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <TimeQuarter className="w-3 h-3" />
            <span>{formatDate(post.datePosted)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
