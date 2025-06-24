"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ExternalLink,
  Users,
  Check,
  Eye,
  UserPlus,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import { formatNumber, formatDate } from "@/lib/utils/format";

import { FollowingSkeleton } from "./following-skeleton";

interface FollowedProfile {
  id: string;
  handle: string;
  platform: "tiktok" | "instagram";
  display_name?: string;
  bio?: string;
  followers_count?: number;
  avatar_url?: string;
  verified?: boolean;
  created_at: string; // when user followed this profile
  last_updated: string; // when profile data was last fetched
}

interface FollowingContentProps {
  profiles: FollowedProfile[];
  isLoading?: boolean;
  onUnfollow: (profileId: string) => Promise<void>;
}

export function FollowingContent({
  profiles,
  isLoading = false,
  onUnfollow,
}: FollowingContentProps) {
  const router = useRouter();
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set());

  const handleViewPosts = (profile: FollowedProfile) => {
    // Navigate to discovery page with pre-filled handle
    router.push(
      `/discovery?handle=${profile.handle}&platform=${profile.platform}`
    );
  };

  const handleUnfollow = async (profile: FollowedProfile) => {
    setUnfollowingIds(prev => new Set(prev).add(profile.id));

    try {
      await onUnfollow(profile.id);
    } catch (error) {
      console.error("Failed to unfollow:", error);
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(profile.id);
        return newSet;
      });
    }
  };

  const getPlatformColor = (platform: string) => {
    return platform === "tiktok"
      ? "bg-black text-white"
      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
  };

  const getPlatformIcon = (platform: string) => {
    return platform === "tiktok" ? "🎵" : "📷";
  };

  if (isLoading) {
    return <FollowingSkeleton />;
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12 text-muted-foreground" />}
        title="No Followed Creators"
        description="You haven't followed any creators yet. Discover and follow creators to see them here."
        action={
          <Link href="/discovery">
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Discover Creators
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <Card
            key={profile.id}
            className="p-6 hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Image
                    src={profile.avatar_url || `/placeholder-avatar.jpg`}
                    alt={profile.display_name || profile.handle}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    <Badge
                      variant="secondary"
                      className={`text-xs px-1.5 py-0.5 ${getPlatformColor(profile.platform)}`}
                    >
                      {getPlatformIcon(profile.platform)}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-sm truncate">
                      {profile.display_name || profile.handle}
                    </h3>
                    {profile.verified && (
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    @{profile.handle}
                  </p>

                  {profile.followers_count && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(profile.followers_count)} followers
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>
              )}

              {/* Follow Info */}
              <div className="text-xs text-muted-foreground">
                <p>Followed {formatDate(profile.created_at)}</p>
                <p>Updated {formatDate(profile.last_updated)}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewPosts(profile)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Posts
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnfollow(profile)}
                  disabled={unfollowingIds.has(profile.id)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  {unfollowingIds.has(profile.id) ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cost-saving notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 text-sm">💡</div>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Smart Following</p>
            <p>
              Posts are loaded fresh when you click View Posts - no background
              refreshes, no API costs, always current content!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
