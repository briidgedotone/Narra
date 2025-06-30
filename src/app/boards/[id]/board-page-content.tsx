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
  ChevronLeft,
  ChevronRight,
  Folder,
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
  embedUrl: string;
  caption: string;
  thumbnail: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  platform: "instagram" | "tiktok";
  profile: {
    handle: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
}

interface CarouselMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  isVideo: boolean;
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

  // Add carousel state and handlers
  const [postCarouselStates, setPostCarouselStates] = useState<
    Record<string, number>
  >({});

  // Add currentTranscriptPostId to track which post the transcript belongs to
  const [currentTranscriptPostId, setCurrentTranscriptPostId] = useState<
    string | null
  >(null);

  const getPostCarouselIndex = (postId: string) => {
    return postCarouselStates[postId] || 0;
  };

  const handlePostCarouselNext = (postId: string, maxIndex: number) => {
    setPostCarouselStates(prev => ({
      ...prev,
      [postId]: Math.min((prev[postId] || 0) + 1, maxIndex - 1),
    }));
  };

  const handlePostCarouselPrev = (postId: string) => {
    setPostCarouselStates(prev => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 0) - 1, 0),
    }));
  };

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
    setCurrentTranscriptPostId(null);
  };

  const handleTabChange = (tab: "overview" | "transcript") => {
    setActiveTab(tab);

    // Load transcript when transcript tab is opened and either:
    // 1. We don't have a transcript for this post yet, or
    // 2. The transcript we have is for a different post
    if (
      tab === "transcript" &&
      selectedPost &&
      selectedPost.platform === "tiktok" &&
      !isLoadingTranscript &&
      currentTranscriptPostId !== selectedPost.id
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
      const tiktokUrl = `https://www.tiktok.com/@${post.profile.handle}/video/${post.id}`;

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
        setCurrentTranscriptPostId(post.id);
      } else {
        setTranscriptError(result.error || "Failed to load transcript");
        setCurrentTranscriptPostId(null);
      }
    } catch (error) {
      console.error("Error loading transcript:", error);
      setTranscriptError("Failed to load transcript");
      setCurrentTranscriptPostId(null);
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
    url: string | undefined,
    platform: "tiktok" | "instagram",
    isAvatar = false
  ) => {
    // Return appropriate fallback for undefined URLs
    if (!url) {
      return isAvatar ? "/placeholder-avatar.jpg" : "/placeholder-post.jpg";
    }

    // Don't proxy local URLs or data URLs
    if (
      url.startsWith("/") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return url;
    }

    // For TikTok videos, don't proxy the URL (contains expiring signatures)
    if (platform === "tiktok" && url.includes("video")) {
      return url;
    }

    // For Instagram images and TikTok thumbnails, proxy through our API
    return `/api/proxy-image?url=${encodeURIComponent(url)}&platform=${platform}`;
  };

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
        {isLoadingPosts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[9/16] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div
            className={cn(
              "grid gap-4",
              isSharedView
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
            )}
          >
            {posts.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                onClick={() => handlePostClick(post)}
                className={cn(
                  "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                )}
              >
                <div className={cn("relative aspect-[9/16]")}>
                  {/* Display current carousel media or single media */}
                  <div className="relative w-full h-full overflow-hidden">
                    {post.isCarousel &&
                    post.carouselMedia &&
                    post.carouselMedia.length > 0 ? (
                      // Carousel Media Display with Sliding Animation
                      <div
                        className="flex w-full h-full transition-transform duration-300 ease-in-out"
                        style={{
                          transform: `translateX(-${getPostCarouselIndex(post.id) * 100}%)`,
                        }}
                      >
                        {post.carouselMedia.map((media, index) => (
                          <div
                            key={media.id || index}
                            className="w-full h-full flex-shrink-0"
                          >
                            {media.isVideo ? (
                              <video
                                src={proxyImage(media.url, post.platform)}
                                poster={proxyImage(
                                  media.thumbnail,
                                  post.platform
                                )}
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                playsInline
                                onMouseEnter={e => {
                                  e.currentTarget.play();
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.pause();
                                  e.currentTarget.currentTime = 0;
                                }}
                                onError={e => {
                                  // Fallback to image if video fails
                                  const img = document.createElement("img");
                                  img.src = proxyImage(
                                    media.thumbnail,
                                    post.platform
                                  );
                                  img.className = "w-full h-full object-cover";
                                  img.alt = "Post media";
                                  if (e.currentTarget.parentNode) {
                                    e.currentTarget.parentNode.replaceChild(
                                      img,
                                      e.currentTarget
                                    );
                                  }
                                }}
                              />
                            ) : (
                              <img
                                src={proxyImage(media.url, post.platform)}
                                alt="Post media"
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={e => {
                                  e.currentTarget.src = "/placeholder-post.jpg";
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Single Media Display
                      <div className="w-full h-full">
                        {post.isVideo ? (
                          <video
                            src={
                              post.platform === "tiktok"
                                ? post.embedUrl
                                : proxyImage(post.embedUrl, post.platform)
                            }
                            poster={proxyImage(post.thumbnail, post.platform)}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            playsInline
                            onMouseEnter={e => {
                              if (post.platform === "tiktok") {
                                e.currentTarget.play().catch(() => {
                                  // Handle autoplay failure silently
                                });
                              }
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                            onError={e => {
                              // Fallback to thumbnail if video fails
                              const img = document.createElement("img");
                              img.src = proxyImage(
                                post.thumbnail,
                                post.platform
                              );
                              img.className =
                                "absolute inset-0 w-full h-full object-cover";
                              img.alt = "Post thumbnail";
                              if (e.currentTarget.parentNode) {
                                e.currentTarget.parentNode.replaceChild(
                                  img,
                                  e.currentTarget
                                );
                              }
                            }}
                          />
                        ) : (
                          <img
                            src={proxyImage(post.thumbnail, post.platform)}
                            alt="Post thumbnail"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => {
                              e.currentTarget.src = "/placeholder-post.jpg";
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Carousel Navigation Arrows */}
                  {post.isCarousel &&
                    post.carouselMedia &&
                    post.carouselMedia.length > 1 && (
                      <>
                        {/* Previous Arrow */}
                        {getPostCarouselIndex(post.id) > 0 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handlePostCarouselPrev(post.id);
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}

                        {/* Next Arrow */}
                        {getPostCarouselIndex(post.id) <
                          post.carouselMedia.length - 1 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handlePostCarouselNext(
                                post.id,
                                post.carouselMedia!.length
                              );
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}

                  {/* Carousel Indicator Dots */}
                  {post.isCarousel &&
                    post.carouselCount &&
                    post.carouselCount > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {Array.from({
                          length: Math.min(post.carouselCount, 5),
                        }).map((_, index) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full ${
                              index === getPostCarouselIndex(post.id)
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                  {/* Remove Button */}
                  {!isSharedView && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemovePost(post.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className={cn("p-4 space-y-3")}>
                  <p className="text-sm line-clamp-2">{post.caption}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-sm">
                        {formatNumber(post.metrics.likes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">
                        {formatNumber(post.metrics.comments)}
                      </span>
                    </div>
                    {post.isVideo && post.metrics.views && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-green-500" />
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
        ) : (
          <EmptyState
            icons={[Folder]}
            title="No posts yet"
            description="Save some posts to this board to get started."
          />
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
                      selectedPost.embedUrl,
                      selectedPost.platform
                    )}
                    poster={proxyImage(
                      selectedPost.thumbnail,
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
                        selectedPost.thumbnail,
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
                            selectedPost.profile.avatarUrl
                              ? proxyImage(
                                  selectedPost.profile.avatarUrl,
                                  selectedPost.platform,
                                  true
                                )
                              : "/placeholder-avatar.jpg"
                          }
                          alt={selectedPost.profile.handle}
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
                              @{selectedPost.profile.handle}
                            </span>
                            {selectedPost.profile.verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {selectedPost.profile.displayName}
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
                          {formatDate(selectedPost.datePosted)}
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
    </div>
  );
}
