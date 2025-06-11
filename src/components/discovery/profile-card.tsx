import { CheckCircle, Instagram, Music } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMetric } from "@/lib/utils/format";
import type { InstagramProfileData, TikTokProfileData } from "@/types/api";

interface ProfileCardProps {
  profile: InstagramProfileData | TikTokProfileData;
  platform: "instagram" | "tiktok";
}

export function ProfileCard({ profile, platform }: ProfileCardProps) {
  const isInstagram = platform === "instagram";
  const userData = profile.user;

  // Extract common fields based on platform
  const username = isInstagram
    ? (userData as InstagramProfileData["user"]).username
    : (userData as TikTokProfileData["user"]).unique_id;

  const displayName = isInstagram
    ? (userData as InstagramProfileData["user"]).full_name
    : (userData as TikTokProfileData["user"]).nickname;

  const bio = isInstagram
    ? (userData as InstagramProfileData["user"]).biography
    : (userData as TikTokProfileData["user"]).signature;

  const avatar = isInstagram
    ? (userData as InstagramProfileData["user"]).profile_pic_url
    : (userData as TikTokProfileData["user"]).avatar_url;

  const isVerified = isInstagram
    ? (userData as InstagramProfileData["user"]).is_verified
    : (userData as TikTokProfileData["user"]).verified;

  const followers = isInstagram
    ? (userData as InstagramProfileData["user"]).edge_followed_by?.count
    : (userData as TikTokProfileData["user"]).follower_count;

  const following = isInstagram
    ? (userData as InstagramProfileData["user"]).edge_follow?.count
    : (userData as TikTokProfileData["user"]).following_count;

  const posts = isInstagram
    ? (userData as InstagramProfileData["user"]).edge_owner_to_timeline_media
        ?.count
    : (userData as TikTokProfileData["user"]).video_count;

  return (
    <Card
      className={`mb-6 ${isInstagram ? "border-pink-200" : "border-gray-300"}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={`${username} avatar`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                {isInstagram ? <Instagram size={24} /> : <Music size={24} />}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate">@{username}</h3>
              {isVerified && (
                <CheckCircle
                  size={16}
                  className="text-blue-500 flex-shrink-0"
                />
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                {isInstagram ? <Instagram size={12} /> : <Music size={12} />}
                {platform}
              </Badge>
            </div>

            {displayName && (
              <p className="text-muted-foreground font-medium mb-2">
                {displayName}
              </p>
            )}

            {bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              {followers !== undefined && (
                <div>
                  <span className="font-semibold">
                    {formatMetric(followers)}
                  </span>
                  <span className="text-muted-foreground ml-1">followers</span>
                </div>
              )}
              {following !== undefined && (
                <div>
                  <span className="font-semibold">
                    {formatMetric(following)}
                  </span>
                  <span className="text-muted-foreground ml-1">following</span>
                </div>
              )}
              {posts !== undefined && (
                <div>
                  <span className="font-semibold">{formatMetric(posts)}</span>
                  <span className="text-muted-foreground ml-1">posts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
