"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MessageCircle,
  ExternalLink,
  Calendar,
  Grid,
  List,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatNumber, formatDate } from "@/lib/utils/format";
import { getAllUserSavedPosts } from "@/app/actions/posts";

interface SavedPostsContentProps {
  userId: string;
}

interface SavedPost {
  id: string;
  embed_url: string;
  caption: string;
  thumbnail_url: string;
  platform: "tiktok" | "instagram";
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  date_posted: string;
  profiles: {
    handle: string;
    display_name: string;
    avatar_url: string;
    verified: boolean;
  };
}

export function SavedPostsContent({ userId }: SavedPostsContentProps) {
  // Note: userId prop is passed from server component but not used directly here
  // Authentication is handled by server actions (getAllUserSavedPosts, etc.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
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
        icon={<Grid className="w-12 h-12" />}
        title="No saved posts yet"
        description="Posts you save to boards will appear here. Start by discovering content and saving posts to your boards."
        action={
          <Button asChild>
            <a href="/discovery">Discover Content</a>
          </Button>
        }
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {posts.map(post => (
            <div
              key={post.id}
              className="group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Post Thumbnail */}
              <div className="relative aspect-[3/4] bg-muted">
                <Image
                  src={post.thumbnail_url}
                  alt={post.caption || "Post"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                
                {/* Platform Badge */}
                <div className="absolute top-2 left-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    post.platform === "tiktok" 
                      ? "bg-black/80 text-white" 
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  )}>
                    {post.platform === "tiktok" ? "TikTok" : "Instagram"}
                  </span>
                </div>

                {/* Post Metrics Overlay */}
                <div className="absolute bottom-2 left-2 right-2 text-white text-xs space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{formatNumber(post.metrics.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatNumber(post.metrics.comments)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={post.profiles.avatar_url || "/placeholder-avatar.jpg"}
                    alt={post.profiles.handle}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="text-sm font-medium truncate">
                    @{post.profiles.handle}
                  </span>
                  {post.profiles.verified && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {post.caption || "No caption"}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.date_posted)}</span>
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
                  src={post.thumbnail_url}
                  alt={post.caption || "Post"}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={post.profiles.avatar_url || "/placeholder-avatar.jpg"}
                    alt={post.profiles.handle}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="font-medium">@{post.profiles.handle}</span>
                  {post.profiles.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    post.platform === "tiktok" 
                      ? "bg-black text-white" 
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  )}>
                    {post.platform === "tiktok" ? "TikTok" : "Instagram"}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.caption || "No caption"}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{formatNumber(post.metrics.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatNumber(post.metrics.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.date_posted)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 