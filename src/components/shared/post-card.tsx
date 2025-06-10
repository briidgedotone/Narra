"use client";

import { Heart, MessageCircle, Share, Eye, Play, Bookmark } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatMetric,
  formatPostDate,
  getPlatformIcon,
} from "@/lib/utils/format";
import type { Post } from "@/types/content";

interface PostCardProps {
  post: Post;
  onSave?: (post: Post) => void;
  onViewDetails?: (post: Post) => void;
  className?: string;
}

export function PostCard({
  post,
  onSave,
  onViewDetails,
  className,
}: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    onSave?.(post);
  };

  const handleViewDetails = () => {
    onViewDetails?.(post);
  };

  return (
    <div
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden shadow-sm transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Content */}
      <div className="relative aspect-[3/4] bg-muted">
        {/* Video/Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt="Post thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mb-2">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
                <p className="text-sm text-white/80">
                  {getPlatformIcon(post.platform)} {post.platform}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Platform Badge */}
        <div className="absolute top-2 left-2">
          <div className="px-2 py-1 bg-black/50 rounded-md text-xs text-white font-medium">
            {getPlatformIcon(post.platform)} {post.platform.toUpperCase()}
          </div>
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-3 transition-opacity duration-200">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSave}
              className="bg-background/90 hover:bg-background"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleViewDetails}
              className="bg-background/90 hover:bg-background"
            >
              View Details
            </Button>
          </div>
        )}
      </div>

      {/* Post Info */}
      <div className="p-3 space-y-2">
        {/* Profile */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs">
              {post.profile.handle[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <span className="text-sm font-medium truncate">
            @{post.profile.handle}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{formatMetric(post.metrics.views)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>{formatMetric(post.metrics.likes)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>{formatMetric(post.metrics.comments)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Share className="w-3 h-3" />
            <span>{formatMetric(post.metrics.shares)}</span>
          </div>
        </div>

        {/* Date and Save Button */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatPostDate(post.datePosted)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-6 px-2 text-xs"
          >
            <Bookmark className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
