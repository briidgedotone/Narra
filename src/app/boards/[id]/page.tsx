"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

import { DashboardLayout } from "@/components/layout";
import { BoardHeader } from "@/components/shared/board-header";
import { Clipboard, Grid, Calendar, Heart } from "@/components/ui/icons";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { userId } = useAuth();
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setBoardDescription(
      "Curated collection of inspiring content and ideas for your creative projects."
    );
  }, [id, userId]);

  // Auto-resize textarea on initial load and when description changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [boardDescription]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardName(e.target.value);
    // TODO: Update in database and sync with sidebar
    updateSidebarBoardName(id, e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setBoardDescription(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    // TODO: Update in database
  };

  // Function to update sidebar board name in localStorage
  const updateSidebarBoardName = (boardId: string, newName: string) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("narra-folders");
      if (saved) {
        const folders = JSON.parse(saved);
        const updatedFolders = folders.map(
          (folder: {
            id: number;
            name: string;
            boards: { id: number; name: string; href: string }[];
          }) => ({
            ...folder,
            boards: folder.boards.map(
              (board: { id: number; name: string; href: string }) =>
                board.href === `/boards/${boardId}`
                  ? { ...board, name: newName }
                  : board
            ),
          })
        );
        localStorage.setItem("narra-folders", JSON.stringify(updatedFolders));

        // Trigger a storage event to update sidebar
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "narra-folders",
            newValue: JSON.stringify(updatedFolders),
          })
        );
      }
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
              <div className="w-8 h-8 flex items-center justify-center">
                <Clipboard className="w-6 h-6" style={{ color: "#3C82F6" }} />
              </div>
              <input
                type="text"
                value={boardName}
                onChange={handleNameChange}
                className="text-2xl font-semibold text-foreground bg-transparent focus:outline-none"
                autoFocus
              />
            </div>
            <textarea
              value={boardDescription}
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
            <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium whitespace-nowrap">
              <Grid className="w-4 h-4" />
              All Posts
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DBDBDB] text-foreground rounded-md text-sm font-medium whitespace-nowrap hover:bg-[#F8F8F8] cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-2.84v.44a4.83 4.83 0 01-3.77 4.25A4.83 4.83 0 015.44 11v.44H2.6v2.84h2.84V14.72a4.83 4.83 0 013.77 4.25V19.4h2.84v-.44a4.83 4.83 0 013.77-4.25A4.83 4.83 0 0118.56 11v-.44h2.84V7.72h-2.84V6.69z" />
              </svg>
              TikTok
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DBDBDB] text-foreground rounded-md text-sm font-medium whitespace-nowrap hover:bg-[#F8F8F8] cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DBDBDB] text-foreground rounded-md text-sm font-medium whitespace-nowrap hover:bg-[#F8F8F8] cursor-pointer">
              <Calendar className="w-4 h-4" />
              Recent
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DBDBDB] text-foreground rounded-md text-sm font-medium whitespace-nowrap hover:bg-[#F8F8F8] cursor-pointer">
              <Heart className="w-4 h-4" />
              Most Liked
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DBDBDB] text-foreground rounded-md text-sm font-medium whitespace-nowrap hover:bg-[#F8F8F8] cursor-pointer">
              <Calendar className="w-4 h-4" />
              This Week
            </div>
          </div>
        </div>

        {/* Section 3: Saved Posts */}
        <div className="space-y-6">
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
