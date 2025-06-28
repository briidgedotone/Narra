"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

import {
  getBoardById,
  getPublicBoard,
  updateBoard,
} from "@/app/actions/folders";
import {
  getPostsInBoard,
  getPublicBoardPosts,
  removePostFromBoard,
} from "@/app/actions/posts";
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
  Heart,
  MessageCircle,
  Trash2,
  Share,
  Eye,
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

interface BoardPageContentProps {
  boardId: string;
  isSharedView?: boolean;
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

// Add interface for transcript
interface VideoTranscript {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export function BoardPageContent({
  boardId,
  isSharedView = false,
}: BoardPageContentProps) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Post detail modal state
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transcript">(
    "overview"
  );
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const loadBoardData = useCallback(async () => {
    setIsLoadingBoard(true);
    try {
      const result = isSharedView
        ? await getPublicBoard(boardId)
        : await getBoardById(boardId);
      if (result.success && result.data) {
        setBoard(result.data);
      } else {
        toast.error("Board not found");
        redirect("/");
      }
    } catch (error) {
      console.error("Failed to load board:", error);
      toast.error("Failed to load board");
    } finally {
      setIsLoadingBoard(false);
    }
  }, [boardId, isSharedView]);

  const loadBoardPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const result = isSharedView
        ? await getPublicBoardPosts(boardId)
        : await getPostsInBoard(boardId, 50, 0);
      if (result.success && result.data) {
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
  }, [boardId, isSharedView]);

  useEffect(() => {
    loadBoardData();
    loadBoardPosts();
  }, [loadBoardData, loadBoardPosts]);

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
      const result = await removePostFromBoard(postId, boardId);
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

  // Post detail modal handlers
  const handlePostClick = (post: SavedPost) => {
    setSelectedPost(post);
    setActiveTab("overview");
    // Reset transcript state when opening new post
    setTranscript(null);
    setTranscriptError(null);
    setIsLoadingTranscript(false);
  };

  const handleTabChange = (tab: "overview" | "transcript") => {
    setActiveTab(tab);

    // Load transcript when transcript tab is opened and we don't have it yet
    if (
      tab === "transcript" &&
      selectedPost &&
      selectedPost.platform === "tiktok" &&
      !transcript &&
      !isLoadingTranscript
    ) {
      loadTranscript(selectedPost);
    }
  };

  const loadTranscript = async (post: SavedPost) => {
    if (post.platform !== "tiktok") return;

    setIsLoadingTranscript(true);
    setTranscriptError(null);

    try {
      // Create TikTok URL from handle and post data
      const tiktokUrl = `https://www.tiktok.com/@${post.profiles.handle}/video/${post.id}`;

      const response = await fetch("/api/test-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tiktokUrl }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setTranscript({
          text: result.data.transcript || "No transcript available",
          segments: result.data.segments || [],
        });
      } else {
        setTranscriptError(result.error || "Failed to load transcript");
      }
    } catch (error) {
      console.error("Error loading transcript:", error);
      setTranscriptError("Failed to load transcript");
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleCopyTranscript = async () => {
    if (!transcript?.text) return;

    try {
      await navigator.clipboard.writeText(transcript.text);
      toast.success("Transcript copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy transcript:", error);
      toast.error("Failed to copy transcript");
    }
  };

  const proxyImage = (
    url: string,
    platform: "tiktok" | "instagram",
    isAvatar = false
  ) => {
    if (!url) {
      return isAvatar ? "/placeholder-avatar.jpg" : "/placeholder-post.jpg";
    }
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;

    // Both TikTok and Instagram images need to be proxied
    if (platform === "tiktok" || platform === "instagram") {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return url;
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
    return <BoardContentSkeleton />;
  }

  if (!board) {
    return (
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
    );
  }

  return (
    <>
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
                className="group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
                onClick={() => handlePostClick(post)}
              >
                {/* Post Thumbnail */}
                <div className="relative aspect-[3/4] bg-muted">
                  <Image
                    src={proxyImage(post.thumbnail_url, post.platform)}
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
                      onClick={e => {
                        e.stopPropagation(); // Prevent triggering post click
                        handleRemovePost(post.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Post Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        post.profiles.avatar_url
                          ? proxyImage(
                              post.profiles.avatar_url,
                              post.platform,
                              true
                            )
                          : "/placeholder-avatar.jpg"
                      }
                      alt={post.profiles.handle || "Profile picture"}
                      width={20}
                      height={20}
                      className="rounded-full"
                      onError={e => {
                        // Fallback to placeholder if avatar fails to load
                        e.currentTarget.src = "/placeholder-avatar.jpg";
                      }}
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

                  {/* Post Metrics */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-sm">
                        {formatNumber(post.metrics.likes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">
                        {formatNumber(post.metrics.comments)}
                      </span>
                    </div>
                    {post.metrics.views && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">
                          {formatNumber(post.metrics.views)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {selectedPost.platform === "tiktok" ? "TikTok" : "Instagram"}{" "}
                Post
              </h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Left: Video/Image */}
              <div className="space-y-4">
                <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  <video
                    src={proxyImage(
                      selectedPost.embed_url,
                      selectedPost.platform
                    )}
                    poster={proxyImage(
                      selectedPost.thumbnail_url,
                      selectedPost.platform
                    )}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    onError={e => {
                      // Fallback to image if video fails
                      const img = document.createElement("img");
                      img.src = proxyImage(
                        selectedPost.thumbnail_url,
                        selectedPost.platform
                      );
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
                      {/* Profile Info */}
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            selectedPost.profiles.avatar_url
                              ? proxyImage(
                                  selectedPost.profiles.avatar_url,
                                  selectedPost.platform,
                                  true
                                )
                              : "/placeholder-avatar.jpg"
                          }
                          alt={selectedPost.profiles.handle}
                          width={40}
                          height={40}
                          className="rounded-full"
                          onError={e => {
                            // Fallback to placeholder if avatar fails to load
                            e.currentTarget.src = "/placeholder-avatar.jpg";
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              @{selectedPost.profiles.handle}
                            </span>
                            {selectedPost.profiles.verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {selectedPost.profiles.display_name}
                          </p>
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <h3 className="font-semibold mb-2">Caption</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedPost.caption || "No caption available"}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div>
                        <h3 className="font-semibold mb-3">Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedPost.metrics.views && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatNumber(selectedPost.metrics.views)}
                              </div>
                              <div className="text-sm text-gray-500">Views</div>
                            </div>
                          )}
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatNumber(selectedPost.metrics.likes)}
                            </div>
                            <div className="text-sm text-gray-500">Likes</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatNumber(selectedPost.metrics.comments)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Comments
                            </div>
                          </div>
                          {selectedPost.metrics.shares && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatNumber(selectedPost.metrics.shares)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Shares
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <h3 className="font-semibold mb-2">Posted</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(selectedPost.date_posted)}
                        </p>
                      </div>
                    </>
                  )}

                  {activeTab === "transcript" && (
                    <div className="space-y-4">
                      {selectedPost.platform === "instagram" ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Transcripts are only available for TikTok videos
                          </p>
                        </div>
                      ) : isLoadingTranscript ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span className="text-sm text-muted-foreground">
                              Loading transcript...
                            </span>
                          </div>
                        </div>
                      ) : transcriptError ? (
                        <div className="text-center py-8">
                          <p className="text-red-500 mb-2">{transcriptError}</p>
                          <Button
                            onClick={() => loadTranscript(selectedPost)}
                            variant="outline"
                            size="sm"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : transcript ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Video Transcript</h3>
                            <Button
                              onClick={handleCopyTranscript}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Share className="w-4 h-4" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {transcript.text}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            No transcript available for this video
                          </p>
                          <Button
                            onClick={() => loadTranscript(selectedPost)}
                            variant="outline"
                            size="sm"
                          >
                            Try Loading Transcript
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
