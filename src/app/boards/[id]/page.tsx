"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

import { DashboardLayout } from "@/components/layout";
import { BoardHeader } from "@/components/shared/board-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Clipboard,
  SearchList,
  TikTok,
  Instagram,
  TimeQuarter,
  FavouriteCircle,
  Calendar03,
  LaptopVideo,
} from "@/components/ui/icons";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { userId } = useAuth();
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
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
              All Posts
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
              TikTok
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
              Instagram
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
            <button
              onClick={() => setActiveFilter("liked")}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                activeFilter === "liked"
                  ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                  : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
              }`}
              style={{ fontSize: "14px" }}
            >
              <FavouriteCircle
                className="w-4 h-4"
                style={{ color: "#8F8F8F" }}
              />
              Most Liked
            </button>
            <button
              onClick={() => setActiveFilter("week")}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md font-medium whitespace-nowrap border ${
                activeFilter === "week"
                  ? "bg-[#F6F6F6] text-foreground border-[#DBDBDB]"
                  : "bg-white border-[#DBDBDB] text-foreground hover:bg-[#F8F8F8]"
              }`}
              style={{ fontSize: "14px" }}
            >
              <Calendar03 className="w-4 h-4" style={{ color: "#8F8F8F" }} />
              This Week
            </button>
          </div>
        </div>

        {/* Section 3: Saved Posts */}
        <div className="space-y-6">
          {/* Empty State */}
          <div className="flex justify-center">
            <EmptyState
              title="No posts saved yet"
              description="Start discovering content and save posts to this board to see them here."
              icons={[Instagram, LaptopVideo, TikTok]}
              action={{
                label: "Discover Content",
                onClick: () => {
                  // TODO: Navigate to discovery page
                  console.log("Navigate to discovery page");
                },
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
