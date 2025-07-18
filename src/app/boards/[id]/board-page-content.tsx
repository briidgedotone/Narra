"use client";

import { redirect } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";

import { PostGrid } from "@/components/boards";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { BoardContentSkeleton } from "@/components/shared/board-content-skeleton";
import { BoardHeader } from "@/components/shared/board-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Clipboard,
  SearchList,
  TikTok,
  Instagram,
  TimeQuarter,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  Bookmark,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import { useBoard } from "@/hooks/useBoard";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber, parseWebVTT } from "@/lib/utils/format";
import type { BoardPageContentProps, SavedPost } from "@/types/board";
import type { SavePostData } from "@/types/discovery";

// Lazy load the SavePostModal component to reduce initial bundle size
const SavePostModal = React.lazy(() =>
  import("@/components/shared/save-post-modal").then(module => ({
    default: module.SavePostModal,
  }))
);

// Global timeout declarations for board name and description auto-save
declare global {
  interface Window {
    boardNameTimeout?: NodeJS.Timeout;
    boardDescTimeout?: NodeJS.Timeout;
  }
}

/**
 * BoardPageContent - Main component for displaying and managing board content
 *
 * This component handles:
 * - Board title and description editing with auto-save
 * - Post filtering (All, TikTok, Instagram, Recent)
 * - Post grid display with Pinterest-style layout
 * - Post detail modal with tabbed interface (lazy-loaded)
 * - Carousel navigation for multi-image posts
 * - Performance optimizations with memoized calculations
 *
 * @param boardId - The unique identifier for the board
 * @param isSharedView - Whether this is a public shared view (read-only)
 */
export function BoardPageContent({
  boardId,
  isSharedView = false,
}: BoardPageContentProps) {
  // Local state for active filter
  const [activeFilter, setActiveFilter] = useState<
    "all" | "tiktok" | "instagram" | "recent"
  >("all");

  // Save post modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  // Custom hooks for board management
  const {
    board,
    posts,
    isLoading,
    isUpdating,
    textareaRef,
    handleNameChange,
    handleDescriptionChange,
  } = useBoard(boardId, isSharedView);

  // Custom hooks for post modal management
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

  // Override transcript with database value for boards posts
  const displayTranscript = React.useMemo(() => {
    if (!selectedPost) return transcript;

    // For boards posts, check if we have transcript in the post data
    const boardPost = selectedPost;
    if (boardPost.transcript) {
      return {
        text: parseWebVTT(boardPost.transcript),
        id: boardPost.id,
      };
    }

    // Fallback to API transcript from usePostModal
    return transcript;
  }, [selectedPost, transcript]);

  // Override loading state for boards posts with database transcripts
  const displayIsLoadingTranscript = React.useMemo(() => {
    if (!selectedPost) return isLoadingTranscript;

    const boardPost = selectedPost;
    // If we have database transcript, don't show loading
    if (boardPost.transcript) {
      return false;
    }

    // Otherwise use the API loading state
    return isLoadingTranscript;
  }, [selectedPost, isLoadingTranscript]);

  // Centralized Instagram script loading and processing for board pages
  useEffect(() => {
    const instagramPosts = posts.filter(p => p.platform === "instagram");
    const hasInstagramPosts = instagramPosts.length > 0;

    if (hasInstagramPosts && posts.length > 0) {
      const loadAndProcessInstagram = () => {
        // Load Instagram embed script if not already loaded
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
          console.log("Board page: Loading Instagram embed script...");
          const script = document.createElement("script");
          script.src = "https://www.instagram.com/embed.js";
          script.async = true;
          script.onload = () => {
            console.log(
              "Board page: Instagram script loaded, processing embeds..."
            );
            // Process all embeds on the page after script loads
            setTimeout(() => {
              if (window.instgrm && window.instgrm.Embeds) {
                console.log("Board page: Processing all Instagram embeds...");
                window.instgrm.Embeds.process();
              }
            }, 300);
          };
          script.onerror = () => {
            console.error("Board page: Failed to load Instagram embed script");
          };
          document.head.appendChild(script);
        } else {
          // If script is already loaded, process embeds
          console.log(
            "Board page: Instagram script already loaded, processing embeds..."
          );
          setTimeout(() => {
            if (window.instgrm && window.instgrm.Embeds) {
              console.log(
                "Board page: Processing existing Instagram embeds..."
              );
              window.instgrm.Embeds.process();
            }
          }, 300);
        }
      };

      // Wait for posts to be rendered, then load and process Instagram embeds
      // Use a longer timeout to ensure all DOM elements are ready
      setTimeout(loadAndProcessInstagram, 500);
    }
  }, [posts]);

  /**
   * Memoized filter counts to prevent recalculation on every render
   * Calculates post counts for each filter category
   */
  const filterCounts = React.useMemo(() => {
    const tiktokCount = posts.filter(p => p.platform === "tiktok").length;
    const instagramCount = posts.filter(p => p.platform === "instagram").length;

    // Recent posts are from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = posts.filter(
      p => new Date(p.datePosted) >= thirtyDaysAgo
    ).length;

    return {
      all: posts.length,
      tiktok: tiktokCount,
      instagram: instagramCount,
      recent: recentCount,
    };
  }, [posts]);

  /**
   * Memoized filter click handler to prevent unnecessary re-renders
   */
  const handleFilterClick = React.useCallback((filter: string) => {
    setActiveFilter(filter as typeof activeFilter);
  }, []);

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

  /**
   * Memoized filter button configuration to prevent recreation
   * Creates button data with icons, labels, and counts
   */
  const filterButtons = React.useMemo(
    () => [
      {
        key: "all",
        icon: SearchList,
        label: `All Posts (${filterCounts.all})`,
        filter: "all",
      },
      {
        key: "tiktok",
        icon: TikTok,
        label: `TikTok (${filterCounts.tiktok})`,
        filter: "tiktok",
      },
      {
        key: "instagram",
        icon: Instagram,
        label: `Instagram (${filterCounts.instagram})`,
        filter: "instagram",
      },
      {
        key: "recent",
        icon: TimeQuarter,
        label: `Recent (${filterCounts.recent})`,
        filter: "recent",
      },
    ],
    [filterCounts]
  );

  /**
   * Memoized embed component to prevent reloading on tab switches
   */
  const embedComponent = React.useMemo(() => {
    if (!selectedPost) return null;

    return selectedPost.platform === "tiktok" ? (
      <TikTokEmbed url={selectedPost.originalUrl || selectedPost.embedUrl} />
    ) : (
      <InstagramEmbed url={selectedPost.originalUrl || selectedPost.embedUrl} />
    );
  }, [selectedPost]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("min-h-screen", isSharedView && "p-4 sm:p-6")}>
        <BoardContentSkeleton />
      </div>
    );
  }

  // Error state - board not found
  if (!board) {
    return (
      <div className={cn("min-h-screen", isSharedView && "p-4 sm:p-6")}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Board not found</h3>
            <p className="text-muted-foreground mb-4">
              The board you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
            <Button onClick={() => redirect("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen">
      {/* Board header with navigation */}
      <BoardHeader
        boardName={board.name}
        boardId={boardId}
        isSharedView={isSharedView}
        {...(isSharedView && boardId ? { publicId: boardId } : {})}
      />

      <div className="space-y-8">
        {/* Board title and description editing section */}
        <section className="space-y-4" aria-labelledby="board-info">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <Clipboard className="w-6 h-6" style={{ color: "#3C82F6" }} />
              </div>
              <input
                type="text"
                value={board.name}
                onChange={handleNameChange}
                className={cn(
                  "text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full",
                  isUpdating && "opacity-50 cursor-wait"
                )}
                placeholder="Board Name"
                disabled={isSharedView || isUpdating}
              />
            </div>
            <textarea
              ref={textareaRef}
              value={board.description || ""}
              onChange={handleDescriptionChange}
              className={cn(
                "w-full bg-transparent border-none focus:outline-none focus:ring-0 text-muted-foreground resize-none",
                isUpdating && "opacity-50 cursor-wait"
              )}
              placeholder="Add a description..."
              disabled={isSharedView || isUpdating}
            />
          </div>
        </section>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ key, icon: Icon, label, filter }) => (
            <Button
              key={key}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => handleFilterClick(filter)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Posts grid */}
        <PostGrid
          posts={posts}
          isLoading={false}
          activeFilter={activeFilter}
          onPostClick={handlePostClick}
          onSavePost={handleSavePost}
        />
      </div>

      {/* Post detail modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          {selectedPost && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Left: Embed Component - Memoized to prevent reloading */}
                <div className="space-y-4">
                  <div className="w-fit mx-auto lg:mx-0">{embedComponent}</div>
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

                        {/* Copy to Board Button - Only show for non-shared views */}
                        {!isSharedView && (
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
                              Copy to Board
                            </Button>
                          </div>
                        )}
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

      {/* Save Post Modal - Only for non-shared views */}
      {!isSharedView && postToSave && (
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
