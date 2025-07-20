"use client";

import { redirect } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";

import { PostGrid } from "@/components/boards";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { BoardContentSkeleton } from "@/components/shared/board-content-skeleton";
import { BoardHeader } from "@/components/shared/board-header";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAdmin } from "@/hooks/useAdmin";
import { isBoardFeatured } from "@/app/actions/folders";
import {
  Clipboard,
  SearchList,
  TikTok,
  Instagram,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  Bookmark,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoard } from "@/hooks/useBoard";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber, parseWebVTT } from "@/lib/utils/format";
import type { BoardPageContentProps, SavedPost } from "@/types/board";
import type { SavePostData, SortOption, DateFilter } from "@/types/discovery";

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
    "all" | "tiktok" | "instagram"
  >("all");

  // Sort and date filter states
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");
  const [dateFilter, setDateFilter] = useState<DateFilter>("last-365-days");

  // Save post modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [postToRemove, setPostToRemove] = useState<SavedPost | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Admin status checking
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [isFeaturedBoard, setIsFeaturedBoard] = useState(false);
  const [isFeaturedBoardLoading, setIsFeaturedBoardLoading] = useState(true);

  // Custom hooks for board management
  const {
    board,
    posts,
    isLoading,
    isUpdating,
    isLoadingMore,
    hasMorePosts,
    textareaRef,
    handleNameChange,
    handleDescriptionChange,
    handleRemovePost,
    handleLoadMore,
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


  /**
   * Memoized filter counts to prevent recalculation on every render
   * Calculates post counts for each filter category
   */
  const filterCounts = React.useMemo(() => {
    const tiktokCount = posts.filter(p => p.platform === "tiktok").length;
    const instagramCount = posts.filter(p => p.platform === "instagram").length;

    return {
      all: posts.length,
      tiktok: tiktokCount,
      instagram: instagramCount,
    };
  }, [posts]);

  /**
   * Memoized filter click handler to prevent unnecessary re-renders
   */
  const handleFilterClick = React.useCallback((filter: string) => {
    setActiveFilter(filter as typeof activeFilter);
  }, []);

  const handleSortChange = React.useCallback((value: SortOption) => {
    setSortOption(value);
  }, []);

  const handleDateFilterChange = React.useCallback((value: DateFilter) => {
    setDateFilter(value);
  }, []);

  // Check if board is featured
  useEffect(() => {
    const checkIfFeatured = async () => {
      setIsFeaturedBoardLoading(true);
      try {
        const result = await isBoardFeatured(boardId);
        if (result.success) {
          setIsFeaturedBoard(result.data || false);
        }
      } catch (error) {
        console.error("Error checking if board is featured:", error);
        // On error, assume it's not featured for safety
        setIsFeaturedBoard(false);
      } finally {
        setIsFeaturedBoardLoading(false);
      }
    };

    checkIfFeatured();
  }, [boardId]);

  // Filter and sort posts based on selected options
  const filteredAndSortedPosts = React.useMemo(() => {
    // First apply platform filter
    let filteredPosts = [...posts];

    if (activeFilter !== "all") {
      if (activeFilter === "tiktok") {
        filteredPosts = filteredPosts.filter(p => p.platform === "tiktok");
      } else if (activeFilter === "instagram") {
        filteredPosts = filteredPosts.filter(p => p.platform === "instagram");
      }
    }

    // Then apply date filter
    const now = new Date();
    let daysToFilter = 30; // default

    switch (dateFilter) {
      case "last-30-days":
        daysToFilter = 30;
        break;
      case "last-60-days":
        daysToFilter = 60;
        break;
      case "last-90-days":
        daysToFilter = 90;
        break;
      case "last-180-days":
        daysToFilter = 180;
        break;
      case "last-365-days":
        daysToFilter = 365;
        break;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToFilter);

    filteredPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.datePosted);
      return postDate >= cutoffDate;
    });

    // Finally apply sorting
    switch (sortOption) {
      case "most-recent":
        return filteredPosts.sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );
      case "most-viewed":
        return filteredPosts.sort(
          (a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0)
        );
      case "most-liked":
        return filteredPosts.sort(
          (a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0)
        );
      case "most-commented":
        return filteredPosts.sort(
          (a, b) => (b.metrics?.comments || 0) - (a.metrics?.comments || 0)
        );
      default:
        return filteredPosts;
    }
  }, [posts, activeFilter, sortOption, dateFilter]);

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
        bio: "",
        followers: 0,
        avatarUrl: post.profile?.avatarUrl || "",
        verified: post.profile?.verified || false,
        // Instagram-specific fields
        ...(post.thumbnail && { thumbnail: post.thumbnail }),
        ...(post.isVideo !== undefined && { isVideo: post.isVideo }),
        ...(post.isCarousel !== undefined && { isCarousel: post.isCarousel }),
        carouselMedia: post.carouselMedia || [],
        carouselCount: post.carouselCount || 0,
        ...(post.videoUrl && { videoUrl: post.videoUrl }),
        ...(post.displayUrl && { displayUrl: post.displayUrl }),
        ...(post.shortcode && { shortcode: post.shortcode }),
        ...(post.dimensions && { dimensions: post.dimensions }),
        ...(post.transcript && { transcript: post.transcript }),
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

  const handleRemovePostFromBoard = React.useCallback(
    (post: SavedPost) => {
      setPostToRemove(post);
      setShowConfirmModal(true);
    },
    []
  );

  // Stable callback references for PostGrid to prevent unnecessary re-renders
  const stableHandlePostClick = React.useCallback(
    (post: SavedPost) => {
      handlePostClick(post);
    },
    [handlePostClick]
  );

  const stableHandleSavePost = React.useCallback(
    (post: SavedPost) => {
      handleSavePost(post);
    },
    [handleSavePost]
  );

  const stableHandleRemovePost = React.useCallback(
    (post: SavedPost) => {
      handleRemovePostFromBoard(post);
    },
    [handleRemovePostFromBoard]
  );

  // Conditional remove handler - only allow remove if user is admin on featured boards
  const shouldShowRemoveButton = React.useMemo(() => {
    // Conservative approach: wait for all async data before showing remove buttons
    if (isAdminLoading || isFeaturedBoardLoading) return false;
    if (isSharedView) return false; // Never show remove on public shared views
    if (!isFeaturedBoard) return true; // Always show remove on non-featured boards (user's own boards)
    return isAdmin; // Only show remove on featured boards if user is admin
  }, [isSharedView, isFeaturedBoard, isAdmin, isAdminLoading, isFeaturedBoardLoading]);

  // Debug logging
  React.useEffect(() => {
    console.log('Board Page Debug:', {
      boardId,
      isSharedView,
      isFeaturedBoard,
      isFeaturedBoardLoading,
      isAdmin,
      isAdminLoading,
      shouldShowRemoveButton
    });
  }, [boardId, isSharedView, isFeaturedBoard, isFeaturedBoardLoading, isAdmin, isAdminLoading, shouldShowRemoveButton]);

  // Conditional remove handler - only pass remove handler if user should be able to remove
  const conditionalRemoveHandler = React.useMemo(() => {
    return shouldShowRemoveButton ? stableHandleRemovePost : undefined;
  }, [shouldShowRemoveButton, stableHandleRemovePost]);

  const confirmRemovePost = React.useCallback(
    async () => {
      if (!postToRemove) return;

      setIsRemoving(true);
      try {
        await handleRemovePost(postToRemove.id);
        setShowConfirmModal(false);
        setPostToRemove(null);
      } catch (error) {
        console.error('Failed to remove post:', error);
      } finally {
        setIsRemoving(false);
      }
    },
    [postToRemove, handleRemovePost]
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

        {/* Filters Section */}
        <div className="flex items-center justify-between">
          {/* Platform Filter buttons */}
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

          {/* Date and Sort Filters on the right */}
          {!isSharedView && (
            <div className="flex items-center gap-4">
              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue placeholder="Filter by date" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-60-days">Last 60 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="last-180-days">Last 180 Days</SelectItem>
                  <SelectItem value="last-365-days">Last 365 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-recent">Most Recent</SelectItem>
                  <SelectItem value="most-viewed">Most Viewed</SelectItem>
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                  <SelectItem value="most-commented">Most Commented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Posts grid */}
        <PostGrid
          posts={filteredAndSortedPosts}
          isLoading={false}
          activeFilter={activeFilter}
          onPostClick={stableHandlePostClick}
          onSavePost={stableHandleSavePost}
          {...(conditionalRemoveHandler && { onRemovePost: conditionalRemoveHandler })}
        />

        {/* Load More Button */}
        {hasMorePosts && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
            >
              {isLoadingMore ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Loading...
                </>
              ) : (
                "Load More Posts"
              )}
            </Button>
          </div>
        )}
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

      {/* Confirmation Modal - Only for non-shared views */}
      {!isSharedView && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setPostToRemove(null);
          }}
          onConfirm={confirmRemovePost}
          title="Remove Post"
          description="Are you sure you want to remove this post from this board? This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isRemoving}
        />
      )}
    </div>
  );
}
