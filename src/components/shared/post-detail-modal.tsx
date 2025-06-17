"use client";

import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  X,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Clipboard,
  ExternalLink,
  Calendar,
  Eye,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    embedUrl: string;
    caption: string;
    thumbnail: string;
    transcript?: string;
    metrics: {
      views?: number;
      likes: number;
      comments: number;
      shares?: number;
    };
    datePosted: string;
    platform: "instagram" | "tiktok";
    profile: {
      handle: string;
      displayName: string;
      avatarUrl: string;
      verified: boolean;
      followers: number;
    };
  };
  onSavePost: (postId: string) => void;
  onFollowProfile: (handle: string) => void;
}

type TabType = "overview" | "transcript";

export function PostDetailModal({
  isOpen,
  onClose,
  post,
  onSavePost,
  onFollowProfile,
}: PostDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [transcriptCopied, setTranscriptCopied] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleCopyTranscript = async () => {
    if (!post.transcript) return;

    try {
      await navigator.clipboard.writeText(post.transcript);
      setTranscriptCopied(true);
      setTimeout(() => setTranscriptCopied(false), 2000);
    } catch {
      console.error("Failed to copy transcript");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${post.profile.displayName} - ${post.platform} Post`,
        text: post.caption,
        url: post.embedUrl,
      });
    } catch {
      // Fallback to copying URL
      navigator.clipboard.writeText(post.embedUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Side - Video/Embed */}
          <div className="flex-1 bg-black relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-[400px] max-h-[600px]">
                <Image
                  src={post.thumbnail}
                  alt="Post preview"
                  fill
                  className="object-cover rounded-l-lg"
                  onError={e => {
                    e.currentTarget.src = "/placeholder-post.jpg";
                  }}
                  unoptimized
                />
                {/* Custom overlay for embed player */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => window.open(post.embedUrl, "_blank")}
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    View Original Post
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="w-[500px] flex flex-col bg-white">
            {/* Header */}
            <DialogHeader className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={post.profile.avatarUrl}
                    alt={post.profile.displayName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={e => {
                      e.currentTarget.src = "/placeholder-avatar.jpg";
                    }}
                    unoptimized
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">
                        {post.profile.displayName}
                      </h3>
                      {post.profile.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {post.platform}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      @{post.profile.handle} •{" "}
                      {formatNumber(post.profile.followers)} followers
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={cn(
                    "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "overview"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={cn(
                    "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "transcript"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  Transcript
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === "overview" && (
                <div className="p-4 space-y-4">
                  {/* Caption */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Caption</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div>
                    <h4 className="font-medium text-sm mb-3">Performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {post.metrics.views && (
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {formatNumber(post.metrics.views)}
                          </span>
                          <span className="text-gray-500">views</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatNumber(post.metrics.likes)}
                        </span>
                        <span className="text-gray-500">likes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatNumber(post.metrics.comments)}
                        </span>
                        <span className="text-gray-500">comments</span>
                      </div>
                      {post.metrics.shares && (
                        <div className="flex items-center gap-2 text-sm">
                          <Share className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {formatNumber(post.metrics.shares)}
                          </span>
                          <span className="text-gray-500">shares</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {formatDate(post.datePosted)}</span>
                  </div>
                </div>
              )}

              {activeTab === "transcript" && (
                <div className="p-4">
                  {post.transcript ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          Video Transcript
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyTranscript}
                          className="text-xs"
                        >
                          <Clipboard className="h-3 w-3 mr-1" />
                          {transcriptCopied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed max-h-80 overflow-auto">
                        {post.transcript}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        Transcript not available for this post
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => onSavePost(post.id)}
                  className="flex-1"
                  size="sm"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save to Board
                </Button>
                <Button
                  onClick={() => onFollowProfile(post.profile.handle)}
                  variant="outline"
                  size="sm"
                >
                  Follow
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
