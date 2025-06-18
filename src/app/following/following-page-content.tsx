"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { getFollowedProfiles, unfollowProfile } from "@/app/actions/following";
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

interface FollowingPageContentProps {
  userId: string;
}

export function FollowingPageContent({}: FollowingPageContentProps) {
  const [profiles, setProfiles] = useState<FollowedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFollowedProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getFollowedProfiles();

      if (result.success && result.data) {
        // Transform the data to match our interface
        const transformedProfiles = result.data.map(profile => ({
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
      setIsLoading(false);
    }
  }, []);

  const handleUnfollow = useCallback(async (profileId: string) => {
    try {
      const result = await unfollowProfile(profileId);

      if (result.success) {
        // Remove the profile from the list immediately for optimistic UI
        setProfiles(prev => prev.filter(p => p.id !== profileId));
        toast.success("Unfollowed creator successfully");
      } else {
        toast.error(result.error || "Failed to unfollow creator");
      }
    } catch (error) {
      console.error("Error unfollowing profile:", error);
      toast.error("Failed to unfollow creator");
    }
  }, []);

  // Load followed profiles on mount
  useEffect(() => {
    loadFollowedProfiles();
  }, [loadFollowedProfiles]);

  // Refresh when coming back to the page (after following someone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again, refresh data
        loadFollowedProfiles();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadFollowedProfiles]);

  return (
    <FollowingContent
      profiles={profiles}
      isLoading={isLoading}
      onUnfollow={handleUnfollow}
    />
  );
}
