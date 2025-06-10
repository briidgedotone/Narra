"use client";

import { UserPlus, UserCheck, Users, Hash } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMetric, getPlatformIcon } from "@/lib/utils/format";
import type { Profile } from "@/types/content";

interface ProfileCardProps {
  profile: Profile;
  onFollow?: (profile: Profile) => void;
  onUnfollow?: (profile: Profile) => void;
  onViewProfile?: (profile: Profile) => void;
  variant?: "discovery" | "following" | "compact";
  className?: string;
}

export function ProfileCard({
  profile,
  onFollow,
  onUnfollow,
  onViewProfile,
  variant = "discovery",
  className,
}: ProfileCardProps) {
  const [isFollowed, setIsFollowed] = useState(profile.isFollowed || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);

    try {
      if (isFollowed) {
        await onUnfollow?.(profile);
        setIsFollowed(false);
      } else {
        await onFollow?.(profile);
        setIsFollowed(true);
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = () => {
    onViewProfile?.(profile);
  };

  // Compact variant for smaller spaces
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 bg-card rounded-lg border",
          "hover:shadow-sm transition-shadow",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {profile.handle[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">@{profile.handle}</span>
              <span className="text-xs">
                {getPlatformIcon(profile.platform)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatMetric(profile.followers)} followers
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isFollowed ? "outline" : "default"}
          onClick={handleFollowToggle}
          disabled={isLoading}
          className="min-w-20"
        >
          {isLoading ? (
            "..."
          ) : isFollowed ? (
            <>
              <UserCheck className="w-3 h-3 mr-1" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3 mr-1" />
              Follow
            </>
          )}
        </Button>
      </div>
    );
  }

  // Full profile card for discovery and following pages
  return (
    <div
      className={cn(
        "bg-card rounded-lg border overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02]",
        variant === "discovery" && "cursor-pointer",
        className
      )}
    >
      {/* Header with Platform Badge */}
      <div className="relative h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 bg-black/50 rounded-md text-xs text-white font-medium">
            {getPlatformIcon(profile.platform)} {profile.platform.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-3">
        {/* Avatar and Basic Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center -mt-8 border-2 border-background">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`@${profile.handle}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium">
                  {profile.handle[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="pt-2">
              <h3 className="font-semibold">@{profile.handle}</h3>
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatMetric(profile.followers)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatMetric(profile.following)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatMetric(profile.postsCount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {variant === "discovery" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
              className="flex-1"
            >
              View Profile
            </Button>
          )}
          <Button
            size="sm"
            variant={isFollowed ? "outline" : "default"}
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={cn(variant === "discovery" ? "flex-1" : "w-full")}
          >
            {isLoading ? (
              "..."
            ) : isFollowed ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
