"use client";

import Image from "next/image";
import React from "react";

import { Button } from "@/components/ui/button";
import { UserPlus } from "@/components/ui/icons";
import { TikTok, Instagram } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { proxyImage } from "@/lib/utils/image-proxy";
import { Profile } from "@/types/discovery";

interface ProfileCardProps {
  profile: Profile;
  onFollowToggle: () => void;
}

export function ProfileCard({ profile, onFollowToggle }: ProfileCardProps) {
  return (
    <div className="rounded-lg">
      <div>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Profile Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Image
                src={proxyImage(profile.avatarUrl, profile.platform)}
                alt={
                  profile.displayName || `${profile.platform} profile picture`
                }
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
                onError={e => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = "/placeholder-avatar.jpg";
                }}
                unoptimized
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {profile.displayName}
                  </h2>
                  {profile.platform === "tiktok" && (
                    <TikTok className="h-6 w-6 text-black" />
                  )}
                  {profile.platform === "instagram" && (
                    <Instagram className="h-6 w-6" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500">@{profile.handle}</p>
              <p className="text-sm mt-2">{profile.bio}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold">
                  {formatNumber(profile.followers)}
                </div>
                <div className="text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {formatNumber(profile.following)}
                </div>
                <div className="text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {formatNumber(profile.posts)}
                </div>
                <div className="text-muted-foreground">Posts</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onFollowToggle}
                className={cn(
                  "w-full sm:w-auto relative group",
                  profile.isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200"
                    : "bg-[#2463EB] hover:bg-[#2463EB]/90 text-white"
                )}
              >
                {profile.isFollowing ? (
                  <>
                    <span className="flex items-center group-hover:hidden">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Following
                    </span>
                    <span className="hidden group-hover:flex items-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Unfollow
                    </span>
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
