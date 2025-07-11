"use client";

import { useState, useEffect } from "react";

import { refreshProfile } from "@/app/actions/profiles";

interface AvatarWithFallbackProps {
  profile: {
    id: string;
    avatar_url?: string | null;
    display_name?: string | null;
    handle: string;
  };
  width: number;
  height: number;
  className: string;
}

export function AvatarWithFallback({
  profile,
  ...props
}: AvatarWithFallbackProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset error state if the profile changes
    setError(false);
  }, [profile.avatar_url]);

  const handleImageError = () => {
    if (!error) {
      setError(true);
      console.log(
        `Image failed to load for ${profile.handle}. Triggering refresh.`
      );
      refreshProfile(profile.id).catch(err => {
        console.error("Failed to refresh profile in background:", err);
      });
    }
  };

  const imageUrl = profile.avatar_url
    ? `/api/proxy-image?url=${encodeURIComponent(profile.avatar_url)}&platform=instagram`
    : "";

  if (error || !profile.avatar_url) {
    return (
      <div
        className={`${props.className} flex items-center justify-center bg-muted text-muted-foreground`}
        style={{ width: props.width, height: props.height }}
      >
        <span className="text-2xl font-bold">
          {profile.display_name?.charAt(0) || profile.handle.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img
      key={profile.avatar_url} // Re-mount if URL changes
      src={imageUrl}
      alt={profile.display_name || profile.handle}
      onError={handleImageError}
      {...props}
    />
  );
}
