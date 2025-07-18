"use client";

import React, { useState, useEffect, Suspense } from "react";

import { getAllUserSavedPosts } from "@/app/actions/posts";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Folder,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  Bookmark,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import { parseWebVTT } from "@/lib/utils/format";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { SavedPost } from "@/types/board";
import type { SavePostData } from "@/types/discovery";

import { SavedPostGrid } from "./SavedPostGrid";

// Lazy load the SavePostModal component to reduce initial bundle size
const SavePostModal = React.lazy(() =>
  import("@/components/shared/save-post-modal").then(module => ({
    default: module.SavePostModal,
  }))
);

interface SavedPostsContentProps {
  userId: string;
}

export function SavedPostsContent({}: SavedPostsContentProps) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save post modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  // Custom hooks for post modal management with database-first transcript loading
  const {
    selectedPost,
    activeTab,
    transcript,
    isLoadingTranscript,
    transcriptError,
    handlePostClick,
    handleTabChange,
    closeModal,
  } = usePostModal();

  // Override transcript with database value for saved posts
  const displayTranscript = React.useMemo(() => {
    if (!selectedPost) return transcript;

    // For saved posts, check if we have transcript in the post data
    const savedPost = selectedPost as SavedPost;
    if (savedPost.transcript) {
      return {
        text: parseWebVTT(savedPost.transcript),
        id: savedPost.id,
      };
    }

    // Fallback to API transcript from usePostModal
    return transcript;
  }, [selectedPost, transcript]);

  // Override loading state for saved posts with database transcripts
  const displayIsLoadingTranscript = React.useMemo(() => {
    if (!selectedPost) return isLoadingTranscript;

    const savedPost = selectedPost as SavedPost;
    // If we have database transcript, don't show loading
    if (savedPost.transcript) {
      return false;
    }

    // Otherwise use the API loading state
    return isLoadingTranscript;
  }, [selectedPost, isLoadingTranscript]);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllUserSavedPosts(50, 0);
      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        setError(result.error || "Failed to load saved posts");
      }
    } catch (err) {
      console.error("Failed to load saved posts:", err);
      setError("Failed to load saved posts");
    } finally {
      setIsLoading(false);
    }
  };

  // Transform SavedPost to SavePostData for saving functionality
  const transformPostForSaving = React.useCallback(
    (post: SavedPost): SavePostData => {
      return {
        id: post.id,
        platformPostId: post.platformPostId || post.id, // Use platformPostId if available
        platform: post.platform,
        embedUrl: post.embedUrl,
        caption: post.caption,
        originalUrl: post.originalUrl || post.embedUrl,
        metrics: {
          views: post.metrics?.views || 0,
          likes: post.metrics?.likes || 0,
          comments: post.metrics?.comments || 0,
          shares: post.metrics?.shares || 0,
        },
        datePosted: post.datePosted,
        handle: post.profile?.handle || "",
        displayName: post.profile?.displayName || post.profile?.handle || "",
        bio: post.profile?.bio || "",
        followers: post.profile?.followers || 0,
        avatarUrl: post.profile?.avatarUrl || "",
        verified: post.profile?.verified || false,
        // Instagram-specific fields
        thumbnail: post.thumbnail,
        isVideo: post.isVideo,
        isCarousel: post.isCarousel,
        carouselMedia: post.carouselMedia || [],
        carouselCount: post.carouselCount || 0,
        videoUrl: post.videoUrl,
        displayUrl: post.displayUrl,
        shortcode: post.shortcode,
        dimensions: post.dimensions,
        transcript: post.transcript,
      };
    },
    []
  );

  const handleSavePost = React.useCallback(
    (post: SavedPost) => {
      const savePostData = transformPostForSaving(post);
      setPostToSave(savePostData);
      setShowSaveModal(true);
    },
    [transformPostForSaving]
  );

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadSavedPosts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icons={[Folder]}
        title="No saved posts yet"
        description="Posts you save to boards will appear here. Start by discovering content and saving posts to your boards."
        action={{
          label: "Discover Content",
          onClick: () => (window.location.href = "/discovery"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts Count */}
      <div className="text-sm text-muted-foreground">
        {posts.length} saved posts
      </div>

      {/* Posts Grid */}
      <SavedPostGrid
        posts={posts}
        isLoading={isLoading}
        onPostClick={handlePostClick}
        onSavePost={handleSavePost}
      />

      {/* Post detail modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          {selectedPost && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Left: Embed Component */}
                <div className="space-y-4">
                  <div className="w-fit mx-auto lg:mx-0">
                    {selectedPost.platform === "tiktok" ? (
                      <TikTokEmbed
                        url={selectedPost.originalUrl || selectedPost.embedUrl}
                      />
                    ) : (
                      <InstagramEmbed
                        url={selectedPost.originalUrl || selectedPost.embedUrl}
                      />
                    )}
                  </div>
                </div>

                {/* Right: Tabbed Content */}
                <div className="space-y-4 flex-1 min-w-0">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => handleTabChange("overview")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "overview"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => handleTabChange("transcript")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "transcript"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Transcript
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === "overview" && (
                      <>
                        {/* Caption */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Caption</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedPost.caption}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div>
                          <h3 className="text-sm font-medium mb-3">
                            Performance
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            {selectedPost.metrics.views && (
                              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <Eye className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-base text-green-800">
                                  {formatNumber(selectedPost.metrics.views)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                              <Heart className="h-4 w-4 text-red-600" />
                              <span className="font-semibold text-base text-red-800">
                                {formatNumber(selectedPost.metrics.likes)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                              <MessageCircle className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-base text-blue-800">
                                {formatNumber(selectedPost.metrics.comments)}
                              </span>
                            </div>
                            {selectedPost.metrics.shares && (
                              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                                <Share className="h-4 w-4 text-purple-600" />
                                <span className="font-semibold text-base text-purple-800">
                                  {formatNumber(selectedPost.metrics.shares)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Post Date */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Posted</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedPost.datePosted)}
                          </div>
                        </div>

                        {/* Save to Another Board Button */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              // Find the original SavedPost to pass to handleSavePost
                              const originalPost = posts.find(
                                p => p.id === selectedPost.id
                              );
                              if (originalPost) {
                                handleSavePost(originalPost);
                              }
                            }}
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save to Another Board
                          </Button>
                        </div>
                      </>
                    )}

                    {activeTab === "transcript" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium">Transcript</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (displayTranscript?.text) {
                                navigator.clipboard.writeText(
                                  displayTranscript.text
                                );
                              }
                            }}
                            disabled={
                              !displayTranscript?.text ||
                              displayIsLoadingTranscript ||
                              selectedPost.platform !== "tiktok"
                            }
                          >
                            Copy Transcript
                          </Button>
                        </div>
                        {displayIsLoadingTranscript ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                          </div>
                        ) : transcriptError ? (
                          <div className="text-sm text-red-600">
                            {transcriptError}
                          </div>
                        ) : !displayTranscript?.text ? (
                          <div className="text-sm text-muted-foreground">
                            {selectedPost.platform === "tiktok" ||
                            (selectedPost.platform === "instagram" &&
                              selectedPost.isVideo)
                              ? "Loading transcript..."
                              : "Transcript not available for this content."}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-2">
                            {displayTranscript.text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Post Modal */}
      {postToSave && (
        <Suspense fallback={<LoadingSpinner />}>
          <SavePostModal
            isOpen={showSaveModal}
            onClose={() => {
              setShowSaveModal(false);
              setPostToSave(null);
            }}
            post={postToSave}
          />
        </Suspense>
      )}
    </div>
  );
}
