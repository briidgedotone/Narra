"use client";

import { redirect } from "next/navigation";
import React, { useState } from "react";

import { PostGrid, PostModal } from "@/components/boards";
import { BoardContentSkeleton } from "@/components/shared/board-content-skeleton";
import { BoardHeader } from "@/components/shared/board-header";
import { Button } from "@/components/ui/button";
import {
  Clipboard,
  SearchList,
  TikTok,
  Instagram,
  TimeQuarter,
} from "@/components/ui/icons";
import { useBoard } from "@/hooks/useBoard";
import { useCarousel } from "@/hooks/useCarousel";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import type { BoardPageContentProps } from "@/types/board";

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
 * - Post detail modal with tabbed interface
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

  // Custom hooks for board management
  const {
    board,
    posts,
    isLoadingBoard,
    isLoadingPosts,
    isUpdating,
    textareaRef,
    handleNameChange,
    handleDescriptionChange,
    handleRemovePost,
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
    handleCopyTranscript,
    closeModal,
  } = usePostModal();

  // Custom hooks for carousel navigation
  const {
    getPostCarouselIndex,
    handlePostCarouselNext,
    handlePostCarouselPrev,
  } = useCarousel();

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

  // Loading state
  if (isLoadingBoard) {
    return (
      <div className={cn("min-h-screen", isSharedView && "p-6 md:p-8 lg:p-10")}>
        <BoardContentSkeleton />
      </div>
    );
  }

  // Error state - board not found
  if (!board) {
    return (
      <div className={cn("min-h-screen", isSharedView && "p-6 md:p-8 lg:p-10")}>
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
    <div className={cn("min-h-screen", isSharedView && "p-6 md:p-8 lg:p-10")}>
      {/* Board header with navigation */}
      <BoardHeader boardName={board.name} boardId={boardId} />

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
                value={board?.name}
                onChange={handleNameChange}
                className="text-2xl font-semibold text-foreground bg-transparent focus:outline-none"
                placeholder="Board name..."
                aria-label="Board name"
              />
              {isUpdating && (
                <div
                  className="text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Saving...
                </div>
              )}
            </div>
            <textarea
              value={board?.description || ""}
              onChange={handleDescriptionChange}
              placeholder="Type the description for this board"
              className="text-muted-foreground text-base bg-transparent focus:outline-none resize-none w-full"
              ref={textareaRef}
              aria-label="Board description"
            />
          </div>
        </section>

        {/* Post filtering section */}
        <section className="space-y-4" aria-labelledby="post-filters">
          <div
            className="flex items-center gap-3 overflow-x-auto pb-2"
            role="tablist"
          >
            {filterButtons.map(({ key, icon: Icon, label, filter }) => (
              <button
                key={key}
                onClick={() => handleFilterClick(filter)}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                  activeFilter === filter
                    ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                    : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
                }`}
                style={{ fontSize: "14px" }}
                role="tab"
                aria-selected={activeFilter === filter}
                aria-label={`Filter by ${label}`}
              >
                <Icon className="w-4 h-4" style={{ color: "#8F8F8F" }} />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Posts grid section */}
        <section aria-labelledby="posts-grid">
          <PostGrid
            posts={posts}
            isLoading={isLoadingPosts}
            isSharedView={isSharedView}
            activeFilter={activeFilter}
            onPostClick={handlePostClick}
            onRemovePost={!isSharedView ? handleRemovePost : undefined}
            getCarouselIndex={getPostCarouselIndex}
            onCarouselNext={handlePostCarouselNext}
            onCarouselPrev={handlePostCarouselPrev}
          />
        </section>
      </div>

      {/* Post detail modal */}
      <PostModal
        selectedPost={selectedPost}
        activeTab={activeTab}
        transcript={transcript}
        isLoadingTranscript={isLoadingTranscript}
        transcriptError={transcriptError}
        onTabChange={handleTabChange}
        onCopyTranscript={handleCopyTranscript}
        onClose={closeModal}
      />
    </div>
  );
}
