"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { toast } from "sonner";

import {
  getFollowedProfiles,
  getFollowedPosts,
  getLastRefreshTime,
} from "@/app/actions/following";
import { FollowingContent } from "@/components/following";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  Bookmark,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber, parseWebVTT } from "@/lib/utils/format";
import type { SavedPost } from "@/types/board";
import type { SortOption, DateFilter, SavePostData } from "@/types/discovery";

// Lazy load the SavePostModal component to reduce initial bundle size
const SavePostModal = React.lazy(() =>
  import("@/components/shared/save-post-modal").then(module => ({
    default: module.SavePostModal,
  }))
);

interface FollowedProfile {
  id: string;
  handle: string;
  platform: "tiktok" | "instagram";
  display_name?: string;
  bio?: string;
  followers_count?: number;
  avatar_url?: string;
  verified?: boolean;
  created_at: string;
  last_updated: string;
}

interface FollowedPost {
  id: string;
  embed_url: string;
  caption?: string;
  transcript?: string;
  thumbnail_url?: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  date_posted: string;
  platform: "tiktok" | "instagram";
  profiles: {
    handle: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface FollowingPageContentProps {
  userId: string;
}

export function FollowingPageContent({}: FollowingPageContentProps) {
  const [profiles, setProfiles] = useState<FollowedProfile[]>([]);
  const [posts, setPosts] = useState<FollowedPost[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");
  const [dateFilter, setDateFilter] = useState<DateFilter>("last-30-days");

  // Save post modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  // Post modal functionality
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

  const loadFollowedProfiles = useCallback(async () => {
    try {
      setIsLoadingProfiles(true);
      const result = await getFollowedProfiles();

      if (result.success && result.data) {
        // Transform the data to match our interface
        const transformedProfiles = result.data.map((profile: any) => ({
          id: profile.id,
          handle: profile.handle,
          platform: profile.platform,
          display_name: profile.display_name || undefined,
          bio: profile.bio || undefined,
          followers_count: profile.followers_count || undefined,
          avatar_url: profile.avatar_url || undefined,
          verified: profile.verified || false,
          created_at: profile.created_at,
          last_updated: profile.last_updated,
        }));

        setProfiles(transformedProfiles);
      } else {
        console.error("Failed to load followed profiles:", result.error);
        toast.error("Failed to load followed creators");
      }
    } catch (error) {
      console.error("Error loading followed profiles:", error);
      toast.error("Failed to load followed creators");
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  const loadFollowedPosts = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) {
        setIsLoadingPosts(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await getFollowedPosts(50, offset);

      if (result.success && result.data) {
        const newPosts = result.data;

        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        // Check if we have more posts
        setHasMorePosts(newPosts.length === 50);
      } else {
        console.error("Failed to load followed posts:", result.error);
        if (offset === 0) {
          toast.error("Failed to load posts");
        }
      }
    } catch (error) {
      console.error("Error loading followed posts:", error);
      if (offset === 0) {
        toast.error("Failed to load posts");
      }
    } finally {
      setIsLoadingPosts(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadLastRefreshTime = useCallback(async () => {
    try {
      const result = await getLastRefreshTime();
      if (result.success && result.data) {
        setLastRefreshTime(result.data);
      }
    } catch (error) {
      console.error("Error loading last refresh time:", error);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePosts) {
      loadFollowedPosts(posts.length, true);
    }
  }, [isLoadingMore, hasMorePosts, posts.length, loadFollowedPosts]);

  // Transform FollowedPost to SavedPost for modal compatibility
  const transformPostForModal = useCallback((post: FollowedPost): SavedPost => {
    return {
      id: post.id,
      platform: post.platform,
      platformPostId: post.id,
      embedUrl: post.embed_url,
      originalUrl: post.embed_url, // Use embed_url as fallback
      caption: post.caption || "",
      transcript: post.transcript || "",
      metrics: {
        views: post.metrics?.views || 0,
        likes: post.metrics?.likes || 0,
        comments: post.metrics?.comments || 0,
        shares: post.metrics?.shares || 0,
      },
      datePosted: post.date_posted,
      profile: {
        handle: post.profiles.handle,
        displayName: post.profiles.display_name || post.profiles.handle,
        avatarUrl: post.profiles.avatar_url || "",
        verified: false, // Not available in FollowedPost
      },
      // Instagram-specific fields
      thumbnail: post.thumbnail_url || "",
      isVideo: post.platform === "instagram" ? true : false, // Assume Instagram posts could be videos
      isCarousel: false, // Not available in FollowedPost
      carouselMedia: [], // Not available in FollowedPost
      carouselCount: 0, // Not available in FollowedPost
    };
  }, []);

  const handleFollowingPostClick = useCallback(
    (post: FollowedPost) => {
      const transformedPost = transformPostForModal(post);
      handlePostClick(transformedPost);
    },
    [transformPostForModal, handlePostClick]
  );

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOption(value);
  }, []);

  const handleDateFilterChange = useCallback((value: DateFilter) => {
    setDateFilter(value);
  }, []);

  // Transform FollowedPost to SavePostData for saving functionality
  const transformPostForSaving = useCallback(
    (post: FollowedPost): SavePostData => {
      return {
        id: post.id,
        platformPostId: post.id, // Use the post id as platform post id
        platform: post.platform,
        embedUrl: post.embed_url,
        ...(post.caption && { caption: post.caption }),
        originalUrl: post.embed_url, // Use embed_url as fallback for originalUrl
        metrics: {
          views: post.metrics?.views || 0,
          likes: post.metrics?.likes || 0,
          comments: post.metrics?.comments || 0,
          shares: post.metrics?.shares || 0,
        },
        datePosted: post.date_posted,
        handle: post.profiles.handle,
        displayName: post.profiles.display_name || post.profiles.handle,
        bio: "", // Not available in FollowedPost
        followers: 0, // Not available in FollowedPost
        avatarUrl: post.profiles.avatar_url || "",
        verified: false, // Not available in FollowedPost
        // Instagram-specific fields
        ...(post.thumbnail_url && { thumbnail: post.thumbnail_url }),
        isVideo: post.platform === "instagram" ? true : false, // Assume Instagram posts could be videos
        isCarousel: false, // Not available in FollowedPost
        carouselMedia: [], // Not available in FollowedPost
        carouselCount: 0, // Not available in FollowedPost
        ...(post.transcript && { transcript: post.transcript }),
      };
    },
    []
  );

  const handleSavePost = useCallback(
    (post: FollowedPost) => {
      const savePostData = transformPostForSaving(post);
      setPostToSave(savePostData);
      setShowSaveModal(true);
    },
    [transformPostForSaving]
  );

  // Filter and sort posts based on selected options
  const filteredAndSortedPosts = useMemo(() => {
    // First apply date filter
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

    const filteredPosts = posts.filter(post => {
      const postDate = new Date(post.date_posted);
      return postDate >= cutoffDate;
    });

    // Then apply sorting
    const sortedPosts = [...filteredPosts];

    switch (sortOption) {
      case "most-recent":
        return sortedPosts.sort(
          (a, b) =>
            new Date(b.date_posted).getTime() -
            new Date(a.date_posted).getTime()
        );
      case "most-viewed":
        return sortedPosts.sort(
          (a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0)
        );
      case "most-liked":
        return sortedPosts.sort(
          (a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0)
        );
      case "most-commented":
        return sortedPosts.sort(
          (a, b) => (b.metrics?.comments || 0) - (a.metrics?.comments || 0)
        );
      default:
        return sortedPosts;
    }
  }, [posts, sortOption, dateFilter]);

  // Load followed profiles on mount
  useEffect(() => {
    loadFollowedProfiles();
  }, [loadFollowedProfiles]);

  // Load followed posts and refresh time on mount
  useEffect(() => {
    loadFollowedPosts();
    loadLastRefreshTime();
  }, [loadFollowedPosts, loadLastRefreshTime]);

  // Memoized embed component to prevent reloading on tab switches
  const embedComponent = React.useMemo(() => {
    if (!selectedPost) return null;

    return selectedPost.platform === "tiktok" ? (
      <TikTokEmbed url={selectedPost.originalUrl || selectedPost.embedUrl} />
    ) : (
      <InstagramEmbed url={selectedPost.originalUrl || selectedPost.embedUrl} />
    );
  }, [selectedPost]);

  return (
    <>
      <FollowingContent
        profiles={profiles}
        posts={filteredAndSortedPosts}
        lastRefreshTime={lastRefreshTime}
        isLoadingProfiles={isLoadingProfiles}
        isLoadingPosts={isLoadingPosts}
        isLoadingMore={isLoadingMore}
        hasMorePosts={hasMorePosts}
        sortOption={sortOption}
        dateFilter={dateFilter}
        onLoadMore={handleLoadMore}
        onPostClick={handleFollowingPostClick}
        onSavePost={handleSavePost}
        onSortChange={handleSortChange}
        onDateFilterChange={handleDateFilterChange}
      />

      <Dialog open={!!selectedPost} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          {selectedPost && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Left: Embed Component - Memoized to prevent reloading */}
                <div className="space-y-4">
                  <div className="w-fit mx-auto lg:mx-0">{embedComponent}</div>
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

                        {/* Save to Board Button */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              // Find the original FollowedPost to pass to handleSavePost
                              const originalPost = posts.find(
                                p => p.id === selectedPost.id
                              );
                              if (originalPost) {
                                handleSavePost(originalPost);
                              }
                            }}
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save to Board
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
                            onClick={handleCopyTranscript}
                            disabled={
                              !transcript?.text ||
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
                        ) : !transcript?.text ? (
                          <div className="text-sm text-muted-foreground">
                            {selectedPost.platform === "tiktok" ||
                            (selectedPost.platform === "instagram" &&
                              selectedPost.isVideo)
                              ? "Loading transcript..."
                              : "Transcript not available for this content."}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-2">
                            {parseWebVTT(transcript.text)}
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
    </>
  );
}
