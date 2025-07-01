"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { getFollowedProfiles, getFollowedPosts } from "@/app/actions/following";
import { FollowingContent } from "@/components/following";

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
  metrics: any;
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
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

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

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePosts) {
      loadFollowedPosts(posts.length, true);
    }
  }, [isLoadingMore, hasMorePosts, posts.length, loadFollowedPosts]);

  // Load followed profiles on mount
  useEffect(() => {
    loadFollowedProfiles();
  }, [loadFollowedProfiles]);

  // Load followed posts on mount
  useEffect(() => {
    loadFollowedPosts();
  }, [loadFollowedPosts]);

  // Refresh when coming back to the page (after following someone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again, refresh data
        loadFollowedProfiles();
        loadFollowedPosts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadFollowedProfiles, loadFollowedPosts]);

  return (
    <FollowingContent
      profiles={profiles}
      posts={posts}
      isLoadingProfiles={isLoadingProfiles}
      isLoadingPosts={isLoadingPosts}
      isLoadingMore={isLoadingMore}
      hasMorePosts={hasMorePosts}
      onLoadMore={handleLoadMore}
    />
  );
}
