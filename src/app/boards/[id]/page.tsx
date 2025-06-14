"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React, { useState, useEffect } from "react";

import { DashboardLayout } from "@/components/layout";
import { BoardHeader } from "@/components/shared/board-header";
import { Clipboard } from "@/components/ui/icons";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { userId } = useAuth();
  const [boardName, setBoardName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  // This will be replaced with proper async handling
  const { id } = React.use(params);

  useEffect(() => {
    if (!userId) {
      redirect("/sign-in");
      return;
    }

    // Mock board names for display
    const boardNames: Record<string, string> = {
      "1": "Social Media",
      "2": "Email Campaigns",
      "3": "UI/UX",
      "4": "Branding",
    };

    // Check if it's a dynamically created board (timestamp-based ID)
    const isNewBoard = !boardNames[id] && !isNaN(Number(id));
    const initialName =
      boardNames[id] || (isNewBoard ? "Untitled Board" : `Board ${id}`);

    setBoardName(initialName);
    setTempName(initialName);
  }, [id, userId]);

  const handleEditStart = () => {
    setIsEditing(true);
    setTempName(boardName);
  };

  const handleEditSave = () => {
    if (tempName.trim()) {
      setBoardName(tempName.trim());
      setIsEditing(false);
      // TODO: Update in database and sync with sidebar
    }
  };

  const handleEditCancel = () => {
    setTempName(boardName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  return (
    <DashboardLayout
      header={<BoardHeader boardName={boardName} boardId={id} />}
    >
      <div className="px-[76px] py-[56px] space-y-8">
        {/* Section 1: Board Title and Description */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clipboard className="w-5 h-5 text-primary" />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyDown}
                  className="text-2xl font-semibold text-foreground bg-transparent border-b-2 border-primary focus:outline-none"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={handleEditStart}
                >
                  {boardName}
                </h1>
              )}
            </div>
            <p className="text-muted-foreground text-base">
              Curated collection of inspiring content and ideas for your
              creative projects.
            </p>
          </div>
        </div>

        {/* Section 2: Horizontal Filters */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Filters</h2>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium whitespace-nowrap">
              All Posts
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap hover:bg-muted/80 cursor-pointer">
              TikTok
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap hover:bg-muted/80 cursor-pointer">
              Instagram
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap hover:bg-muted/80 cursor-pointer">
              Recent
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap hover:bg-muted/80 cursor-pointer">
              Most Liked
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap hover:bg-muted/80 cursor-pointer">
              This Week
            </div>
          </div>
        </div>

        {/* Section 3: Saved Posts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Saved Posts</h2>
            <p className="text-sm text-muted-foreground">0 posts</p>
          </div>

          {/* Empty State */}
          <div className="bg-card rounded-lg border p-12">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No posts saved yet</h3>
              <p className="text-base mb-4">
                Start discovering content and save posts to this board to see
                them here.
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                Discover Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
