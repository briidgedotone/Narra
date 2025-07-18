"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";

import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ExternalLink,
  Users,
  TikTok,
  Instagram,
  Calendar,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption, DateFilter } from "@/types/discovery";

import { FollowingSkeleton } from "./following-skeleton";

interface FollowedProfile {
  id: string;
  handle: string;
  platform: "tiktok" | "instagram";
  display_name?: string;
  avatar_url?: string;
}

interface FollowedPost {
  id: string;
  embed_url: string;
  caption?: string;
  transcript?: string;
  thumbnail_url?: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  date_posted: string;
  platform: "tiktok" | "instagram";
  profiles: {
    handle: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface FollowingContentProps {
  profiles: FollowedProfile[];
  posts: FollowedPost[];
  lastRefreshTime?: string | null;
  isLoadingProfiles?: boolean;
  isLoadingPosts?: boolean;
  isLoadingMore?: boolean;
  hasMorePosts?: boolean;
  sortOption?: SortOption;
  dateFilter?: DateFilter;
  onLoadMore?: () => void;
  onPostClick?: (post: FollowedPost) => void;
  onSavePost?: (post: FollowedPost) => void;
  onSortChange?: (value: SortOption) => void;
  onDateFilterChange?: (value: DateFilter) => void;
}

export function FollowingContent({
  profiles,
  posts,
  lastRefreshTime,
  isLoadingProfiles = false,
  isLoadingPosts = false,
  isLoadingMore = false,
  hasMorePosts = false,
  sortOption = "most-recent",
  dateFilter = "last-30-days",
  onLoadMore,
  onPostClick,
  onSavePost,
  onSortChange,
  onDateFilterChange,
}: FollowingContentProps) {
  const router = useRouter();

  // Masonry breakpoints - matches our responsive grid
  const breakpointColumnsObj = {
    default: 4, // xl:columns-4
    1280: 4, // xl
    1024: 3, // lg:columns-3
    640: 2, // sm:columns-2
    0: 1, // columns-1
  };

  if (isLoadingProfiles) {
    return <FollowingSkeleton />;
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        icons={[Users]}
        title="No Followed Creators"
        description="You haven't followed any creators yet. Discover and follow creators to see them here."
        action={{
          label: "Discover Creators",
          onClick: () => router.push("/discovery"),
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Following</h1>
          <p className="text-muted-foreground">
            {profiles.length} creator{profiles.length !== 1 ? "s" : ""}{" "}
            you&apos;re following
          </p>
        </div>
        <Link href="/discovery">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Discover More
          </Button>
        </Link>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
        {profiles.map(profile => (
          <Link
            key={profile.id}
            href={`/discovery?handle=${profile.handle}&platform=${profile.platform}`}
            className="group relative flex flex-col items-center text-center p-2 rounded-lg transition-colors hover:bg-muted/50"
          >
            <div className="relative mb-3">
              <AvatarWithFallback
                profile={profile}
                width={80}
                height={80}
                className="rounded-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute -bottom-1 -right-1">
                {profile.platform === "tiktok" ? (
                  <TikTok className="h-5 w-5 text-black" />
                ) : (
                  <Instagram className="h-5 w-5 text-pink-500" />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-sm truncate group-hover:text-primary">
                {profile.display_name || profile.handle}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs truncate w-full">
              @{profile.handle}
            </p>
          </Link>
        ))}
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Latest Posts</h2>
            {lastRefreshTime && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(lastRefreshTime).toLocaleString()}
              </p>
            )}
          </div>

          {(onSortChange || onDateFilterChange) && (
            <div className="flex items-center gap-4">
              {/* Date Filter */}
              {onDateFilterChange && (
                <Select value={dateFilter} onValueChange={onDateFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <SelectValue placeholder="Filter by date" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-60-days">Last 60 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                    <SelectItem value="last-180-days">Last 180 Days</SelectItem>
                    <SelectItem value="last-365-days">Last 365 Days</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Sort Filter */}
              {onSortChange && (
                <Select value={sortOption} onValueChange={onSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-recent">Most Recent</SelectItem>
                    <SelectItem value="most-viewed">Most Viewed</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                    <SelectItem value="most-commented">
                      Most Commented
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {isLoadingPosts ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <LoadingSpinner className="h-8 w-8 mx-auto" />
              <p className="text-sm text-muted-foreground">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icons={[Users]}
            title="No Posts Yet"
            description="Posts from your followed creators will appear here once they're available."
            action={{
              label: "Discover More Creators",
              onClick: () => router.push("/discovery"),
            }}
          />
        ) : (
          <>
            {/* Posts Masonry */}
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex w-auto -ml-4"
              columnClassName="pl-4 bg-clip-padding"
            >
              {posts.map(post => (
                <div key={post.id} className="mb-4 flex justify-center">
                  {post.platform === "instagram" ? (
                    <InstagramEmbed
                      url={post.embed_url}
                      {...(post.caption ? { caption: post.caption } : {})}
                      metrics={{
                        ...(post.metrics?.views !== undefined
                          ? { views: post.metrics.views }
                          : {}),
                        ...(post.metrics?.likes !== undefined
                          ? { likes: post.metrics.likes }
                          : {}),
                        ...(post.metrics?.comments !== undefined
                          ? { comments: post.metrics.comments }
                          : {}),
                        ...(post.metrics?.shares !== undefined
                          ? { shares: post.metrics.shares }
                          : {}),
                      }}
                      showMetrics={true}
                      onDetailsClick={() => onPostClick?.(post)}
                      onSaveClick={() => onSavePost?.(post)}
                    />
                  ) : (
                    <TikTokEmbed
                      url={post.embed_url}
                      {...(post.caption ? { caption: post.caption } : {})}
                      metrics={{
                        ...(post.metrics?.views !== undefined
                          ? { views: post.metrics.views }
                          : {}),
                        ...(post.metrics?.likes !== undefined
                          ? { likes: post.metrics.likes }
                          : {}),
                        ...(post.metrics?.comments !== undefined
                          ? { comments: post.metrics.comments }
                          : {}),
                        ...(post.metrics?.shares !== undefined
                          ? { shares: post.metrics.shares }
                          : {}),
                      }}
                      showMetrics={true}
                      onDetailsClick={() => onPostClick?.(post)}
                      onSaveClick={() => onSavePost?.(post)}
                    />
                  )}
                </div>
              ))}
            </Masonry>

            {/* Load More Button */}
            {hasMorePosts && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMore ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
