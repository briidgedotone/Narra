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
import { PostImage, AvatarImage } from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { proxyImage } from "@/lib/utils/image-proxy";
import type { SavedPost, VideoTranscript } from "@/types/board";

interface PostModalProps {
  /** The currently selected post to display in modal */
  selectedPost: SavedPost | null;
  /** Active tab in the modal ("overview" | "transcript") */
  activeTab: "overview" | "transcript";
  /** Transcript data for TikTok videos */
  transcript: VideoTranscript | null;
  /** Whether transcript is currently loading */
  isLoadingTranscript: boolean;
  /** Transcript loading error message */
  transcriptError: string | null;
  /** Callback to change active tab */
  onTabChange: (tab: "overview" | "transcript") => void;
  /** Callback to copy transcript to clipboard */
  onCopyTranscript: () => void;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * PostModal - Full-screen modal for detailed post viewing
 *
 * Features:
 * - Two-panel layout: media on left, details on right
 * - Tabbed interface: Overview and Transcript tabs
 * - TikTok video embedding with iframe
 * - Instagram image display with zoom
 * - Profile information with verification badges
 * - Engagement metrics display
 * - Transcript viewing and copying for TikTok videos
 * - Responsive design for mobile and desktop
 * - Keyboard navigation support
 * - Optimized with React.memo for performance
 *
 * Layout:
 * - Desktop: Side-by-side panels (50/50 split)
 * - Mobile: Stacked panels (media on top)
 *
 * Performance optimizations:
 * - Memoized event handlers
 * - Memoized platform icon rendering
 * - Memoized transcript content rendering
 * - Lazy image loading
 */
export const PostModal = React.memo<PostModalProps>(function PostModal({
  selectedPost,
  activeTab,
  transcript,
  isLoadingTranscript,
  transcriptError,
  onTabChange,
  onCopyTranscript,
  onClose,
}) {
  /**
   * Memoized event handlers to prevent unnecessary re-renders
   */
  const handleOverviewClick = React.useCallback(() => {
    onTabChange("overview");
  }, [onTabChange]);

  const handleTranscriptClick = React.useCallback(() => {
    onTabChange("transcript");
  }, [onTabChange]);

  const handleBackdropClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Memoized platform icon to prevent recreation
   */
  const platformIcon = React.useMemo(() => {
    if (!selectedPost) return null;
    return selectedPost.platform === "tiktok" ? (
      <TikTok className="w-5 h-5 text-gray-600" />
    ) : (
      <Instagram className="w-5 h-5 text-gray-600" />
    );
  }, [selectedPost]);

  /**
   * Memoized transcript content to prevent unnecessary re-renders
   * Handles loading, error, and success states
   */
  const transcriptContent = React.useMemo(() => {
    if (isLoadingTranscript) {
      return (
        <div
          className="space-y-3"
          role="status"
          aria-label="Loading transcript"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      );
    }

    if (transcriptError) {
      return (
        <div className="text-center py-8" role="alert">
          <p className="text-red-500 mb-2">Failed to load transcript</p>
          <p className="text-gray-500 text-sm">{transcriptError}</p>
        </div>
      );
    }

    if (
      !transcript ||
      !transcript.segments ||
      transcript.segments.length === 0
    ) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No transcript available for this video
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Video Transcript</h4>
          <Button
            onClick={onCopyTranscript}
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Copy transcript to clipboard"
          >
            <Clipboard className="w-4 h-4" />
            Copy Transcript
          </Button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {transcript.segments.map((segment, index) => (
              <p key={index} className="text-sm text-gray-700 leading-relaxed">
                {segment.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }, [isLoadingTranscript, transcriptError, transcript, onCopyTranscript]);

  // Don't render if no post is selected
  if (!selectedPost) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-label="Close modal"
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Media panel */}
          <div className="lg:w-1/2 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[600px]">
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedPost.platform === "tiktok" ? (
                <iframe
                  src={selectedPost.embedUrl}
                  className="w-full h-full max-w-[325px] max-h-[578px]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`TikTok video by ${selectedPost.profile.displayName}`}
                />
              ) : (
                <PostImage
                  src={proxyImage(
                    selectedPost.thumbnail,
                    selectedPost.platform
                  )}
                  alt={selectedPost.caption || "Instagram post"}
                  className="object-contain"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-post.jpg";
                  }}
                />
              )}
            </div>
          </div>

          {/* Details panel */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                Post Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
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
            </header>

            {/* Tab navigation */}
            <nav className="flex border-b border-gray-200" role="tablist">
              <button
                onClick={handleOverviewClick}
                className={cn(
                  "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                  activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                role="tab"
                aria-selected={activeTab === "overview"}
                aria-controls="overview-panel"
              >
                Overview
              </button>
              {selectedPost.platform === "tiktok" && (
                <button
                  onClick={handleTranscriptClick}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                    activeTab === "transcript"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                  role="tab"
                  aria-selected={activeTab === "transcript"}
                  aria-controls="transcript-panel"
                >
                  Transcript
                </button>
              )}
            </nav>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "overview" ? (
                <div
                  id="overview-panel"
                  className="p-6 space-y-6"
                  role="tabpanel"
                  aria-labelledby="overview-tab"
                >
                  {/* Profile information */}
                  <section aria-labelledby="profile-info">
                    <div className="flex items-center gap-4">
                      <AvatarImage
                        src={proxyImage(
                          selectedPost.profile.avatarUrl,
                          selectedPost.platform,
                          true
                        )}
                        alt={`${selectedPost.profile.displayName} profile picture`}
                        size={48}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {selectedPost.profile.displayName}
                          </h3>
                          {selectedPost.profile.verified && (
                            <div
                              className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                              title="Verified account"
                              aria-label="Verified account"
                            >
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          <div className="ml-2">{platformIcon}</div>
                        </div>
                        <p className="text-gray-500">
                          @{selectedPost.profile.handle}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Post caption */}
                  {selectedPost.caption && (
                    <section aria-labelledby="caption-heading">
                      <h4
                        id="caption-heading"
                        className="font-medium text-gray-900 mb-2"
                      >
                        Caption
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedPost.caption}
                      </p>
                    </section>
                  )}

                  {/* Engagement metrics */}
                  <section aria-labelledby="metrics-heading">
                    <h4
                      id="metrics-heading"
                      className="font-medium text-gray-900 mb-3"
                    >
                      Engagement
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPost.metrics.views && (
                        <div
                          className="flex items-center gap-2"
                          title={`${formatNumber(selectedPost.metrics.views)} views`}
                        >
                          <Eye className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatNumber(selectedPost.metrics.views)} views
                          </span>
                        </div>
                      )}
                      <div
                        className="flex items-center gap-2"
                        title={`${formatNumber(selectedPost.metrics.likes)} likes`}
                      >
                        <Heart className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatNumber(selectedPost.metrics.likes)} likes
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        title={`${formatNumber(selectedPost.metrics.comments)} comments`}
                      >
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatNumber(selectedPost.metrics.comments)} comments
                        </span>
                      </div>
                      {selectedPost.metrics.shares && (
                        <div
                          className="flex items-center gap-2"
                          title={`${formatNumber(selectedPost.metrics.shares)} shares`}
                        >
                          <Share className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatNumber(selectedPost.metrics.shares)} shares
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Post date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TimeQuarter className="w-4 h-4" />
                    <span>Posted {formatDate(selectedPost.datePosted)}</span>
                  </div>
                </div>
              ) : (
                <div
                  id="transcript-panel"
                  className="p-6"
                  role="tabpanel"
                  aria-labelledby="transcript-tab"
                >
                  {transcriptContent}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
