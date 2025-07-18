"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import {
  getFollowedProfiles,
  getFollowedPosts,
  getLastRefreshTime,
} from "@/app/actions/following";
import { FollowingContent } from "@/components/following";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { SortOption } from "@/types/discovery";

interface FollowedProfile {
  id: string;
  handle: string;
  platform: "tiktok" | "instagram";
  display_name?: string;
  bio?: string;
  followers_count?: number;
  avatar_url?: string;
  verified?: boolean;
  created_at: string;
  last_updated: string;
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

interface FollowingPageContentProps {
  userId: string;
}

export function FollowingPageContent({}: FollowingPageContentProps) {
  const [profiles, setProfiles] = useState<FollowedProfile[]>([]);
  const [posts, setPosts] = useState<FollowedPost[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState<FollowedPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");

  const loadFollowedProfiles = useCallback(async () => {
    try {
      setIsLoadingProfiles(true);
      const result = await getFollowedProfiles();

      if (result.success && result.data) {
        // Transform the data to match our interface
        const transformedProfiles = result.data.map((profile: any) => ({
          id: profile.id,
          handle: profile.handle,
          platform: profile.platform,
          display_name: profile.display_name || undefined,
          bio: profile.bio || undefined,
          followers_count: profile.followers_count || undefined,
          avatar_url: profile.avatar_url || undefined,
          verified: profile.verified || false,
          created_at: profile.created_at,
          last_updated: profile.last_updated,
        }));

        setProfiles(transformedProfiles);
      } else {
        console.error("Failed to load followed profiles:", result.error);
        toast.error("Failed to load followed creators");
      }
    } catch (error) {
      console.error("Error loading followed profiles:", error);
      toast.error("Failed to load followed creators");
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  const loadFollowedPosts = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) {
        setIsLoadingPosts(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await getFollowedPosts(50, offset);

      if (result.success && result.data) {
        const newPosts = result.data;

        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        // Check if we have more posts
        setHasMorePosts(newPosts.length === 50);
      } else {
        console.error("Failed to load followed posts:", result.error);
        if (offset === 0) {
          toast.error("Failed to load posts");
        }
      }
    } catch (error) {
      console.error("Error loading followed posts:", error);
      if (offset === 0) {
        toast.error("Failed to load posts");
      }
    } finally {
      setIsLoadingPosts(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadLastRefreshTime = useCallback(async () => {
    try {
      const result = await getLastRefreshTime();
      if (result.success && result.data) {
        setLastRefreshTime(result.data);
      }
    } catch (error) {
      console.error("Error loading last refresh time:", error);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePosts) {
      loadFollowedPosts(posts.length, true);
    }
  }, [isLoadingMore, hasMorePosts, posts.length, loadFollowedPosts]);

  const handlePostClick = useCallback((post: FollowedPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPost(null);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOption(value);
  }, []);

  // Sort posts based on selected option
  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];

    switch (sortOption) {
      case "most-recent":
        return postsCopy.sort(
          (a, b) =>
            new Date(b.date_posted).getTime() -
            new Date(a.date_posted).getTime()
        );
      case "most-viewed":
        return postsCopy.sort(
          (a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0)
        );
      case "most-liked":
        return postsCopy.sort(
          (a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0)
        );
      case "most-commented":
        return postsCopy.sort(
          (a, b) => (b.metrics?.comments || 0) - (a.metrics?.comments || 0)
        );
      default:
        return postsCopy;
    }
  }, [posts, sortOption]);

  // Load followed profiles on mount
  useEffect(() => {
    loadFollowedProfiles();
  }, [loadFollowedProfiles]);

  // Load followed posts and refresh time on mount
  useEffect(() => {
    loadFollowedPosts();
    loadLastRefreshTime();
  }, [loadFollowedPosts, loadLastRefreshTime]);

  return (
    <>
      <FollowingContent
        profiles={profiles}
        posts={sortedPosts}
        lastRefreshTime={lastRefreshTime}
        isLoadingProfiles={isLoadingProfiles}
        isLoadingPosts={isLoadingPosts}
        isLoadingMore={isLoadingMore}
        hasMorePosts={hasMorePosts}
        sortOption={sortOption}
        onLoadMore={handleLoadMore}
        onPostClick={handlePostClick}
        onSortChange={handleSortChange}
      />

      <Dialog open={isModalOpen} onOpenChange={() => handleCloseModal()}>
        <DialogContent className="w-fit max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          {selectedPost && (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Left: Embed Component */}
              <div className="space-y-4">
                <div className="w-fit mx-auto lg:mx-0">
                  {selectedPost.platform === "tiktok" ? (
                    <TikTokEmbed url={selectedPost.embed_url} />
                  ) : (
                    <InstagramEmbed url={selectedPost.embed_url} />
                  )}
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-4 flex-1 min-w-0">
                {/* Caption */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Caption</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedPost.caption}
                  </p>
                </div>

                {/* Metrics */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Performance</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedPost.metrics?.views && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="font-semibold text-base text-green-800">
                          {selectedPost.metrics.views} views
                        </span>
                      </div>
                    )}
                    {selectedPost.metrics?.likes && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <span className="font-semibold text-base text-red-800">
                          {selectedPost.metrics.likes} likes
                        </span>
                      </div>
                    )}
                    {selectedPost.metrics?.comments && (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <span className="font-semibold text-base text-blue-800">
                          {selectedPost.metrics.comments} comments
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
