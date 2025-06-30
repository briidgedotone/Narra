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

// Add timeout declarations at the top of the file
declare global {
  interface Window {
    boardNameTimeout?: NodeJS.Timeout;
    boardDescTimeout?: NodeJS.Timeout;
  }
}

export function BoardPageContent({
  boardId,
  isSharedView = false,
}: BoardPageContentProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Custom hooks
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

  const {
    getPostCarouselIndex,
    handlePostCarouselNext,
    handlePostCarouselPrev,
  } = useCarousel();

  if (isLoadingBoard) {
    return (
      <div className={cn("min-h-screen", isSharedView && "p-6 md:p-8 lg:p-10")}>
        <BoardContentSkeleton />
      </div>
    );
  }

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

  return (
    <div className={cn("min-h-screen", isSharedView && "p-6 md:p-8 lg:p-10")}>
      <BoardHeader boardName={board.name} boardId={boardId} />
      <div className="space-y-8">
        {/* Section 1: Board Title and Description */}
        <div className="space-y-4">
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
              />
              {isUpdating && (
                <div className="text-sm text-muted-foreground">Saving...</div>
              )}
            </div>
            <textarea
              value={board?.description || ""}
              onChange={handleDescriptionChange}
              placeholder="Type the description for this board"
              className="text-muted-foreground text-base bg-transparent focus:outline-none resize-none w-full"
              ref={textareaRef}
            />
          </div>
        </div>

        {/* Section 2: Horizontal Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                activeFilter === "all"
                  ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                  : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
              }`}
              style={{ fontSize: "14px" }}
            >
              <SearchList className="w-4 h-4" style={{ color: "#8F8F8F" }} />
              All Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveFilter("tiktok")}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                activeFilter === "tiktok"
                  ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                  : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
              }`}
              style={{ fontSize: "14px" }}
            >
              <TikTok className="w-4 h-4" style={{ color: "#8F8F8F" }} />
              TikTok ({posts.filter(p => p.platform === "tiktok").length})
            </button>
            <button
              onClick={() => setActiveFilter("instagram")}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                activeFilter === "instagram"
                  ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                  : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
              }`}
              style={{ fontSize: "14px" }}
            >
              <Instagram className="w-4 h-4" style={{ color: "#8F8F8F" }} />
              Instagram ({posts.filter(p => p.platform === "instagram").length})
            </button>
            <button
              onClick={() => setActiveFilter("recent")}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                activeFilter === "recent"
                  ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                  : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
              }`}
              style={{ fontSize: "14px" }}
            >
              <TimeQuarter className="w-4 h-4" style={{ color: "#8F8F8F" }} />
              Recent
            </button>
          </div>
        </div>

        {/* Section 3: Posts Grid */}
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
      </div>

      {/* Post Detail Modal */}
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
