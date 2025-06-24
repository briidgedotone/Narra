"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

import { getBoardById, updateBoard } from "@/app/actions/folders";
import { getPostsInBoard, removePostFromBoard } from "@/app/actions/posts";
import { DashboardLayout } from "@/components/layout";
import { BoardContentSkeleton } from "@/components/shared/board-content-skeleton";
import { BoardHeader } from "@/components/shared/board-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Clipboard,
  SearchList,
  TikTok,
  Instagram,
  TimeQuarter,
  Calendar03,
  Heart,
  MessageCircle,
  Trash2,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber, formatDate } from "@/lib/utils/format";

// Add timeout declarations at the top of the file
declare global {
  interface Window {
    boardNameTimeout?: NodeJS.Timeout;
    boardDescTimeout?: NodeJS.Timeout;
  }
}

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface BoardData {
  id: string;
  name: string;
  description: string | null;
  folder_id: string;
  is_shared: boolean;
  public_id: string | null;
  created_at: string;
  updated_at: string;
  folders: {
    name: string;
  };
}

interface SavedPost {
  id: string;
  embed_url: string;
  caption: string;
  thumbnail_url: string;
  platform: "tiktok" | "instagram";
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  date_posted: string;
  profiles: {
    handle: string;
    display_name: string;
    avatar_url: string;
    verified: boolean;
  };
}

export default function BoardPage({ params }: BoardPageProps) {
  const { userId } = useAuth();
  const [board, setBoard] = useState<BoardData | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // This will be replaced with proper async handling
  const { id } = React.use(params);

  const loadBoardData = useCallback(async () => {
    setIsLoadingBoard(true);
    try {
      const result = await getBoardById(id);
      if (result.success && result.data) {
        setBoard(result.data);
      } else {
        toast.error("Board not found");
        redirect("/dashboard");
      }
    } catch (error) {
      console.error("Failed to load board:", error);
      toast.error("Failed to load board");
    } finally {
      setIsLoadingBoard(false);
    }
  }, [id]);

  const loadBoardPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const result = await getPostsInBoard(id, 50, 0);
      if (result.success && result.data) {
        // The data structure should be an array of post objects with nested profiles
        setPosts(result.data as unknown as SavedPost[]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load board posts:", error);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [id]);

  useEffect(() => {
    if (!userId) {
      redirect("/sign-in");
      return;
    }

    loadBoardData();
    loadBoardPosts();
  }, [userId, loadBoardData, loadBoardPosts]);

  // Auto-resize textarea when description changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [board?.description]);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!board) return;

    const newName = e.target.value;
    setBoard({ ...board, name: newName });

    // Debounced update to database
    clearTimeout(window.boardNameTimeout);
    window.boardNameTimeout = setTimeout(async () => {
      await updateBoardInDatabase({ name: newName });
    }, 1000);
  };

  const handleDescriptionChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!board) return;

    const newDescription = e.target.value;
    setBoard({ ...board, description: newDescription });

    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";

    // Debounced update to database
    clearTimeout(window.boardDescTimeout);
    window.boardDescTimeout = setTimeout(async () => {
      await updateBoardInDatabase({ description: newDescription });
    }, 1000);
  };

  const updateBoardInDatabase = async (updates: {
    name?: string;
    description?: string;
  }) => {
    if (!board || isUpdating) return;

    setIsUpdating(true);
    try {
      const result = await updateBoard(board.id, updates);
      if (result.success) {
        // Board updated successfully - the sidebar will update via revalidation
      } else {
        toast.error("Failed to update board");
      }
    } catch (error) {
      console.error("Failed to update board:", error);
      toast.error("Failed to update board");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemovePost = async (postId: string) => {
    try {
      const result = await removePostFromBoard(postId, id);
      if (result.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        toast.success("Post removed from board");
      } else {
        toast.error("Failed to remove post");
      }
    } catch (error) {
      console.error("Failed to remove post:", error);
      toast.error("Failed to remove post");
    }
  };

  // Filter posts based on active filter
  const filteredPosts = posts.filter(post => {
    if (activeFilter === "all") return true;
    if (activeFilter === "tiktok") return post.platform === "tiktok";
    if (activeFilter === "instagram") return post.platform === "instagram";
    if (activeFilter === "recent") {
      const postDate = new Date(post.date_posted);
      const daysSincePost =
        (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSincePost <= 7; // Last 7 days
    }
    return true;
  });

  if (isLoadingBoard) {
    return (
      <DashboardLayout>
        <BoardContentSkeleton />
      </DashboardLayout>
    );
  }

  if (!board) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      header={<BoardHeader boardName={board.name} boardId={id} />}
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
                value={board.name}
                onChange={handleNameChange}
                className="text-2xl font-semibold text-foreground bg-transparent focus:outline-none"
                placeholder="Board name..."
              />
              {isUpdating && (
                <div className="text-sm text-muted-foreground">Saving...</div>
              )}
            </div>
            <textarea
              value={board.description || ""}
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
        {isLoadingPosts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icons={[Clipboard]}
            title="No posts in this board yet"
            description="Start adding posts to this board by saving content from the Discovery page."
            action={{
              label: "Discover Content",
              onClick: () => (window.location.href = "/discovery"),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow relative"
              >
                {/* Post Thumbnail */}
                <div className="relative aspect-[3/4] bg-muted">
                  <Image
                    src={post.thumbnail_url}
                    alt={post.caption || "Post"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  {/* Platform Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        post.platform === "tiktok"
                          ? "bg-black/80 text-white"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      )}
                    >
                      {post.platform === "tiktok" ? "TikTok" : "Instagram"}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemovePost(post.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Post Metrics Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{formatNumber(post.metrics.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{formatNumber(post.metrics.comments)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        post.profiles.avatar_url || "/placeholder-avatar.jpg"
                      }
                      alt={post.profiles.handle || "Profile picture"}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium truncate">
                      @{post.profiles.handle}
                    </span>
                    {post.profiles.verified && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.caption || "No caption"}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar03 className="w-3 h-3" />
                    <span>{formatDate(post.date_posted)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
