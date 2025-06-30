import React from "react";

import { Button } from "@/components/ui/button";
import {
  Clipboard,
  Eye,
  Heart,
  Instagram,
  MessageCircle,
  Share,
  TikTok,
  TimeQuarter,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { proxyImage } from "@/lib/utils/image-proxy";
import type { SavedPost, VideoTranscript } from "@/types/board";

interface PostModalProps {
  selectedPost: SavedPost | null;
  activeTab: "overview" | "transcript";
  transcript: VideoTranscript | null;
  isLoadingTranscript: boolean;
  transcriptError: string | null;
  onTabChange: (tab: "overview" | "transcript") => void;
  onCopyTranscript: () => void;
  onClose: () => void;
}

export function PostModal({
  selectedPost,
  activeTab,
  transcript,
  isLoadingTranscript,
  transcriptError,
  onTabChange,
  onCopyTranscript,
  onClose,
}: PostModalProps) {
  if (!selectedPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left side - Media */}
          <div className="lg:w-1/2 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[600px]">
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedPost.platform === "tiktok" ? (
                <iframe
                  src={selectedPost.embedUrl}
                  className="w-full h-full max-w-[325px] max-h-[578px]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="TikTok video"
                />
              ) : (
                <img
                  src={proxyImage(
                    selectedPost.thumbnail,
                    selectedPost.platform
                  )}
                  alt={selectedPost.caption}
                  className="max-w-full max-h-full object-contain"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-post.jpg";
                  }}
                />
              )}
            </div>
          </div>

          {/* Right side - Details */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Post Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => onTabChange("overview")}
                className={cn(
                  "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                  activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                Overview
              </button>
              {selectedPost.platform === "tiktok" && (
                <button
                  onClick={() => onTabChange("transcript")}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                    activeTab === "transcript"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Transcript
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "overview" ? (
                <div className="p-6 space-y-6">
                  {/* Profile Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={proxyImage(
                        selectedPost.profile.avatarUrl,
                        selectedPost.platform,
                        true
                      )}
                      alt={selectedPost.profile.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-avatar.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {selectedPost.profile.displayName}
                        </h3>
                        {selectedPost.profile.verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        <div className="ml-2">
                          {selectedPost.platform === "tiktok" ? (
                            <TikTok className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Instagram className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-500">
                        @{selectedPost.profile.handle}
                      </p>
                    </div>
                  </div>

                  {/* Caption */}
                  {selectedPost.caption && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Caption
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedPost.caption}
                      </p>
                    </div>
                  )}

                  {/* Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Engagement
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPost.metrics.views && (
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatNumber(selectedPost.metrics.views)} views
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatNumber(selectedPost.metrics.likes)} likes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatNumber(selectedPost.metrics.comments)} comments
                        </span>
                      </div>
                      {selectedPost.metrics.shares && (
                        <div className="flex items-center gap-2">
                          <Share className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatNumber(selectedPost.metrics.shares)} shares
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <TimeQuarter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Posted {formatDate(selectedPost.datePosted)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Transcript</h4>
                    {transcript && (
                      <Button
                        onClick={onCopyTranscript}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Clipboard className="w-4 h-4" />
                        Copy
                      </Button>
                    )}
                  </div>

                  {isLoadingTranscript ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/6" />
                    </div>
                  ) : transcriptError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2">
                        Failed to load transcript
                      </p>
                      <p className="text-sm text-gray-500">{transcriptError}</p>
                    </div>
                  ) : transcript ? (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {transcript.text}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No transcript available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
