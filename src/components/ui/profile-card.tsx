"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/ui/post-grid";
import { cn } from "@/lib/utils";

// Profile data interface
export interface ProfileData {
  id: string;
  handle: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  platform: "tiktok" | "instagram";
  metrics: {
    followers: number;
    following: number;
    posts: number;
  };
  verified?: boolean;
  isFollowing?: boolean;
}

// Main Profile Card Component
interface ProfileCardProps {
  profile: ProfileData;
  onFollow?: (profile: ProfileData) => void;
  onUnfollow?: (profile: ProfileData) => void;
  onViewProfile?: (profile: ProfileData) => void;
  variant?: "default" | "compact";
  className?: string;
  showFollowButton?: boolean;
  loading?: boolean;
}

export function ProfileCard({
  profile,
  onFollow,
  onUnfollow,
  onViewProfile,
  variant = "default",
  className,
  showFollowButton = true,
  loading = false,
}: ProfileCardProps) {
  const [isFollowHovered, setIsFollowHovered] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);

  const handleFollowClick = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await onUnfollow?.(profile);
      } else {
        await onFollow?.(profile);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return <ProfileCardSkeleton variant={variant} className={className} />;
  }

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-background border border-border hover:shadow-sm transition-all duration-200",
          className
        )}
      >
        <ProfileAvatar profile={profile} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-sm truncate">
              {profile.displayName || profile.handle}
            </h3>
            {profile.verified && <VerifiedBadge size="sm" />}
            <PlatformBadge platform={profile.platform} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatNumber(profile.metrics.followers)} followers
          </p>
        </div>

        {showFollowButton && (
          <Button
            size="sm"
            variant={profile.isFollowing ? "outline" : "default"}
            onClick={handleFollowClick}
            disabled={followLoading}
            className="shrink-0"
          >
            {followLoading
              ? "..."
              : profile.isFollowing
                ? "Following"
                : "Follow"}
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "bg-background border border-border rounded-lg p-4 space-y-3 hover:shadow-md transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={() => onViewProfile?.(profile)}
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <ProfileAvatar profile={profile} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium truncate">
              {profile.displayName || profile.handle}
            </h3>
            {profile.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {profile.handle}
          </p>
        </div>
        <PlatformBadge platform={profile.platform} />
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {profile.bio}
        </p>
      )}

      {/* Metrics */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-4 text-sm">
          <span>
            <span className="font-medium">
              {formatNumber(profile.metrics.followers)}
            </span>{" "}
            followers
          </span>
          <span>
            <span className="font-medium">
              {formatNumber(profile.metrics.posts)}
            </span>{" "}
            posts
          </span>
        </div>

        {showFollowButton && (
          <Button
            size="sm"
            variant={profile.isFollowing ? "outline" : "default"}
            onClick={e => {
              e.stopPropagation();
              handleFollowClick();
            }}
            disabled={followLoading}
            onMouseEnter={() => setIsFollowHovered(true)}
            onMouseLeave={() => setIsFollowHovered(false)}
            className={cn(
              "shrink-0 transition-all duration-200",
              profile.isFollowing &&
                isFollowHovered &&
                "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            )}
          >
            {followLoading
              ? "..."
              : profile.isFollowing
                ? isFollowHovered
                  ? "Unfollow"
                  : "Following"
                : "Follow"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Profile Avatar Component
interface ProfileAvatarProps {
  profile: ProfileData;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfileAvatar({
  profile,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  const initials = (profile.displayName || profile.handle)
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {profile.avatar && !imageError ? (
        <img
          src={profile.avatar}
          alt={`${profile.handle} avatar`}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
          <span className={cn("font-medium text-primary", textSizes[size])}>
            {initials}
          </span>
        </div>
      )}

      {/* Platform indicator */}
      <div className="absolute -bottom-1 -right-1">
        <div
          className={cn(
            "rounded-full border-2 border-background",
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6",
            profile.platform === "tiktok"
              ? "bg-black"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          )}
        >
          <div className="w-full h-full flex items-center justify-center">
            {profile.platform === "tiktok" ? (
              <TikTokIcon className={size === "sm" ? "w-2 h-2" : "w-3 h-3"} />
            ) : (
              <InstagramIcon
                className={size === "sm" ? "w-2 h-2" : "w-3 h-3"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Verified Badge Component
interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function VerifiedBadge({ size = "md", className }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  return (
    <div className={cn("text-blue-500", className)}>
      <VerifiedIcon className={sizeClasses[size]} />
    </div>
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton({
  variant = "default",
  className,
}: {
  variant?: ProfileCardProps["variant"];
  className?: string | undefined;
}) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-background border border-border",
          className
        )}
      >
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="w-24 h-3 bg-muted rounded animate-pulse" />
          <div className="w-16 h-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-16 h-6 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-background border border-border rounded-lg p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="w-24 h-3 bg-muted rounded animate-pulse" />
          <div className="w-20 h-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-12 h-5 bg-muted rounded animate-pulse" />
      </div>
      <div className="w-full h-8 bg-muted rounded animate-pulse" />
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="w-32 h-3 bg-muted rounded animate-pulse" />
        <div className="w-16 h-6 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

// Icons
const VerifiedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C13.09 2 14 2.91 14 4V8.5L16.5 11L14 13.5V18C14 19.09 13.09 20 12 20S10 19.09 10 20V13.5L7.5 11L10 8.5V4C10 2.91 10.91 2 12 2M12 6C10.9 6 10 6.9 10 8S10.9 10 12 10 14 9.1 14 8 13.1 6 12 6Z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="white" viewBox="0 0 24 24">
    <path d="M9 12a4 4 0 1 0 4 4V4a5.5 5.5 0 0 0 11 0V2a3.5 3.5 0 0 0-7 0v8a6 6 0 1 1-8-6V2a1 1 0 0 0-2 0v10Z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="white" viewBox="0 0 24 24">
    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z" />
  </svg>
);
