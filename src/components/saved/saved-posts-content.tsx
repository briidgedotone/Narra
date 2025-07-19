"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";

import { getAllUserSavedPosts, removePostFromAllUserBoards } from "@/app/actions/posts";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Folder,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  Bookmark,
  SearchList,
  TikTok,
  Instagram,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { parseWebVTT } from "@/lib/utils/format";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { SavedPost } from "@/types/board";
import type { SavePostData, SortOption, DateFilter } from "@/types/discovery";

import { SavedPostGrid } from "./SavedPostGrid";
import { SavedPostsSkeleton } from "./saved-posts-skeleton";

// Lazy load the SavePostModal component to reduce initial bundle size
const SavePostModal = React.lazy(() =>
  import("@/components/shared/save-post-modal").then(module => ({
    default: module.SavePostModal,
  }))
);

interface SavedPostsContentProps {
  userId: string;
}

export function SavedPostsContent({}: SavedPostsContentProps) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<"all" | "tiktok" | "instagram">("all");
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");
  const [dateFilter, setDateFilter] = useState<DateFilter>("last-30-days");

  // Save post modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [postToRemove, setPostToRemove] = useState<SavedPost | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Post modal state - database-only approach for saved posts
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transcript">("overview");

  // Database-only transcript for saved posts
  const displayTranscript = React.useMemo(() => {
    if (!selectedPost?.transcript) return null;

    return {
      text: parseWebVTT(selectedPost.transcript),
      id: selectedPost.id,
    };
  }, [selectedPost?.transcript, selectedPost?.id]);

  // Database-only handlers
  const handlePostClick = React.useCallback((post: SavedPost) => {
    setSelectedPost(post);
    setActiveTab("overview");
  }, []);

  const handleTabChange = React.useCallback((tab: "overview" | "transcript") => {
    setActiveTab(tab);
  }, []);

  const closeModal = React.useCallback(() => {
    setSelectedPost(null);
  }, []);

  // Memoized filter counts
  const filterCounts = React.useMemo(() => {
    const tiktokCount = posts.filter(p => p.platform === "tiktok").length;
    const instagramCount = posts.filter(p => p.platform === "instagram").length;

    return {
      all: posts.length,
      tiktok: tiktokCount,
      instagram: instagramCount,
    };
  }, [posts]);

  // Memoized filter click handler
  const handleFilterClick = React.useCallback((filter: string) => {
    setActiveFilter(filter as typeof activeFilter);
  }, []);

  // Memoized filter button configuration
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

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllUserSavedPosts(50, 0);
      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        setError(result.error || "Failed to load saved posts");
      }
    } catch (err) {
      console.error("Failed to load saved posts:", err);
      setError("Failed to load saved posts");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRemovePost = React.useCallback(
    (post: SavedPost) => {
      setPostToRemove(post);
      setShowConfirmModal(true);
    },
    []
  );

  const confirmRemovePost = React.useCallback(
    async () => {
      if (!postToRemove) return;

      setIsRemoving(true);
      try {
        const result = await removePostFromAllUserBoards(postToRemove.id);
        
        if (result.success) {
          // Remove post from local state to update UI immediately
          setPosts(prevPosts => prevPosts.filter(p => p.id !== postToRemove.id));
          toast.success(result.message || 'Post removed from all boards');
          setShowConfirmModal(false);
          setPostToRemove(null);
        } else {
          toast.error(result.error || 'Failed to remove post');
        }
      } catch (error) {
        console.error('Failed to remove post:', error);
        toast.error('Failed to remove post');
      } finally {
        setIsRemoving(false);
      }
    },
    [postToRemove]
  );

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOption(value);
  }, []);

  const handleDateFilterChange = useCallback((value: DateFilter) => {
    setDateFilter(value);
  }, []);

  // Filter and sort posts based on selected options
  const filteredAndSortedPosts = useMemo(() => {
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

    // Then apply sorting
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

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadSavedPosts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <SavedPostsSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icons={[Folder]}
        title="No saved posts yet"
        description="Posts you save to boards will appear here. Start by discovering content and saving posts to your boards."
        action={{
          label: "Discover Content",
          onClick: () => (window.location.href = "/discovery"),
        }}
      />
    );
  }

  if (filteredAndSortedPosts.length === 0) {
    const getEmptyMessage = () => {
      if (activeFilter === "all") {
        return "No posts found for the selected date range.";
      }
      return `No ${activeFilter} posts found for the selected date range.`;
    };

    return (
      <div className="space-y-6">
        {/* Filters Section - All filters aligned horizontally */}
        <div className="flex items-center justify-between flex-wrap gap-4">
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

          {/* Date and Sort Filters */}
          <div className="flex items-center gap-4">
            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={handleDateFilterChange}>
              <SelectTrigger className="w-[180px] h-10">
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
              <SelectTrigger className="w-[180px] h-10">
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
        </div>

        <EmptyState
          icons={[SearchList]}
          title="No posts found"
          description={getEmptyMessage()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section - All filters aligned horizontally */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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

        {/* Date and Sort Filters */}
        <div className="flex items-center gap-4">
          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-[180px] h-10">
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
            <SelectTrigger className="w-[180px] h-10">
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
      </div>

      {/* Posts Grid */}
      <SavedPostGrid
        posts={filteredAndSortedPosts}
        isLoading={isLoading}
        onPostClick={handlePostClick}
        onSavePost={handleSavePost}
        onRemovePost={handleRemovePost}
      />

      {/* Post detail modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          {selectedPost && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Left: Embed Component */}
                <div className="space-y-4">
                  <div className="w-fit mx-auto lg:mx-0">
                    {selectedPost.platform === "tiktok" ? (
                      <TikTokEmbed
                        url={selectedPost.originalUrl || selectedPost.embedUrl}
                      />
                    ) : (
                      <InstagramEmbed
                        url={selectedPost.originalUrl || selectedPost.embedUrl}
                      />
                    )}
                  </div>
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

                        {/* Save to Another Board Button */}
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
                            Save to Another Board
                          </Button>
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
                            onClick={() => {
                              if (displayTranscript?.text) {
                                navigator.clipboard.writeText(
                                  displayTranscript.text
                                );
                              }
                            }}
                            disabled={
                              !displayTranscript?.text ||
                              selectedPost.platform !== "tiktok"
                            }
                          >
                            Copy Transcript
                          </Button>
                        </div>
                        {!displayTranscript?.text ? (
                          <div className="text-sm text-muted-foreground">
                            {selectedPost.platform === "tiktok" ||
                            (selectedPost.platform === "instagram" &&
                              selectedPost.isVideo)
                              ? "No transcript available for this content."
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

      {/* Save Post Modal */}
      {postToSave && (
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPostToRemove(null);
        }}
        onConfirm={confirmRemovePost}
        title="Remove Post"
        description="Are you sure you want to remove this post from all your boards? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isRemoving}
      />
    </div>
  );
}
