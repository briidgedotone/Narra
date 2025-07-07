"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useState } from "react";

import { PostGrid } from "@/components/boards";
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
  ChevronDown,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
} from "@/components/ui/icons";
import { useBoard } from "@/hooks/useBoard";
import { useCarousel } from "@/hooks/useCarousel";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { proxyInstagramImage } from "@/lib/utils/image-proxy";
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

  // Custom hooks for board management
  const {
    board,
    posts,
    isLoading,
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
    setPostCarouselIndex,
  } = useCarousel();

  // Get current carousel index for selected post
  const currentCarouselIndex = selectedPost
    ? getPostCarouselIndex(selectedPost.id)
    : 0;

  // Carousel navigation handlers
  const handlePrevClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedPost) {
        handlePostCarouselPrev(selectedPost.id);
      }
    },
    [handlePostCarouselPrev, selectedPost]
  );

  const handleNextClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedPost) {
        handlePostCarouselNext(
          selectedPost.id,
          selectedPost.carouselMedia?.length || 1
        );
      }
    },
    [handlePostCarouselNext, selectedPost]
  );

  const handleIndicatorClick = React.useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      if (selectedPost) {
        setPostCarouselIndex(selectedPost.id, index);
      }
    },
    [selectedPost, setPostCarouselIndex]
  );

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
  if (isLoading) {
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
          isSharedView={isSharedView}
          activeFilter={activeFilter}
          onPostClick={handlePostClick}
          onRemovePost={isSharedView ? undefined : handleRemovePost}
          getCarouselIndex={getPostCarouselIndex}
          onCarouselNext={handlePostCarouselNext}
          onCarouselPrev={handlePostCarouselPrev}
        />
      </div>

      {/* Post detail modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Video/Image with Carousel Support */}
                <div className="space-y-4">
                  <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    {selectedPost.isCarousel && selectedPost.carouselMedia ? (
                      // Carousel Media Display
                      <>
                        {selectedPost.carouselMedia[currentCarouselIndex]
                          ?.isVideo ? (
                          selectedPost.platform === "tiktok" ? (
                            <TikTokModalEmbed
                              key={
                                selectedPost.carouselMedia[currentCarouselIndex]
                                  .id
                              }
                              tiktokUrl={
                                selectedPost.carouselMedia[currentCarouselIndex]
                                  .url
                              }
                              className="w-full h-full"
                            />
                          ) : (
                            <video
                              key={
                                selectedPost.carouselMedia[currentCarouselIndex]
                                  .id
                              }
                              src={`/api/proxy-image?url=${encodeURIComponent(selectedPost.carouselMedia[currentCarouselIndex].url)}`}
                              poster={proxyInstagramImage(
                                selectedPost.carouselMedia[currentCarouselIndex]
                                  .thumbnail
                              )}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              controls
                            />
                          )
                        ) : (
                          <Image
                            key={
                              selectedPost.carouselMedia?.[currentCarouselIndex]
                                ?.id || currentCarouselIndex
                            }
                            src={
                              selectedPost.platform === "instagram"
                                ? proxyInstagramImage(
                                    selectedPost.carouselMedia?.[
                                      currentCarouselIndex
                                    ]?.url || ""
                                  )
                                : selectedPost.carouselMedia?.[
                                    currentCarouselIndex
                                  ]?.url || ""
                            }
                            alt="Carousel item"
                            fill
                            className="object-cover"
                          />
                        )}

                        {/* Carousel Navigation */}
                        {selectedPost.carouselMedia.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevClick}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4 transform rotate-90" />
                            </button>
                            <button
                              onClick={handleNextClick}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4 transform -rotate-90" />
                            </button>

                            {/* Carousel Indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {selectedPost.carouselMedia.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={e => handleIndicatorClick(e, index)}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentCarouselIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/70"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : // Single Media Display - Use iframe for TikTok, video for Instagram
                    selectedPost.platform === "tiktok" ? (
                      <TikTokModalEmbed
                        tiktokUrl={
                          selectedPost.originalUrl || selectedPost.embedUrl
                        }
                        className="w-full h-full"
                      />
                    ) : (
                      <video
                        src={`/api/proxy-image?url=${encodeURIComponent(selectedPost.embedUrl)}`}
                        poster={proxyInstagramImage(selectedPost.thumbnail)}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        onError={e => {
                          // Fallback to image if video fails
                          const img = document.createElement("img");
                          img.src = proxyInstagramImage(selectedPost.thumbnail);
                          img.className = "w-full h-full object-cover";
                          img.alt = "Post thumbnail";
                          if (e.currentTarget.parentNode) {
                            e.currentTarget.parentNode.replaceChild(
                              img,
                              e.currentTarget
                            );
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Right: Tabbed Content */}
                <div className="space-y-4">
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
                      </>
                    )}

                    {activeTab === "transcript" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium">Transcript</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyTranscript}
                            disabled={
                              !transcript?.transcript ||
                              isLoadingTranscript ||
                              selectedPost.platform !== "tiktok"
                            }
                          >
                            Copy Transcript
                          </Button>
                        </div>
                        {isLoadingTranscript ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                          </div>
                        ) : transcriptError ? (
                          <div className="text-sm text-red-600">
                            {transcriptError}
                          </div>
                        ) : !transcript?.transcript ? (
                          <div className="text-sm text-muted-foreground">
                            {selectedPost.platform === "tiktok"
                              ? "Loading transcript..."
                              : "Transcript not available for Instagram posts."}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {transcript.transcript}
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
    </div>
  );
}

/**
 * TikTokModalEmbed - Component for displaying TikTok iframe embeds in modal
 * Reuses the same logic as PostCard but adapted for modal context
 */
function TikTokModalEmbed({
  tiktokUrl,
  className,
}: {
  tiktokUrl: string;
  className?: string;
}) {
  const [embedLoading, setEmbedLoading] = React.useState(false);
  const [embedError, setEmbedError] = React.useState(false);
  const [tiktokEmbed, setTiktokEmbed] = React.useState<string | null>(null);

  // Fetch TikTok iframe embed
  React.useEffect(() => {
    if (tiktokUrl && !tiktokEmbed && !embedLoading && !embedError) {
      setEmbedLoading(true);

      fetch("/api/test-tiktok-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tiktokUrl }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.html) {
            setTiktokEmbed(data.data.html);
          } else {
            setEmbedError(true);
          }
        })
        .catch(() => setEmbedError(true))
        .finally(() => setEmbedLoading(false));
    }
  }, [tiktokUrl, tiktokEmbed, embedLoading, embedError]);

  if (embedLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100",
          className
        )}
      >
        <div className="text-sm text-gray-500">Loading TikTok...</div>
      </div>
    );
  }

  if (embedError || !tiktokEmbed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500 text-white",
          className
        )}
      >
        <TikTok className="w-16 h-16 mb-3" />
        <p className="text-lg font-bold">TikTok</p>
        <p className="text-xs opacity-70 mt-2">Failed to load</p>
      </div>
    );
  }

  return (
    <div
      className={cn("bg-transparent border-none overflow-hidden", className)}
      style={{
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{ __html: tiktokEmbed }}
    />
  );
}
