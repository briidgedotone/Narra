"use client";

import { Search01Icon, InstagramIcon, TiktokIcon } from "hugeicons-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import { SavePostModal } from "@/components/shared/save-post-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Grid,
  List,
  ExternalLink,
  Heart,
  MessageCircle,
  Calendar,
  Bookmark,
  UserPlus,
  Search,
  FileQuestion,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber, formatDate } from "@/lib/utils/format";
import { parseWebVTT, copyToClipboard } from "@/lib/utils/format";
import { proxyInstagramImage } from "@/lib/utils/image-proxy";
import { VideoTranscript } from "@/types/content";

interface DiscoveryContentProps {
  userId: string;
}

interface Profile {
  id: string;
  handle: string;
  displayName: string;
  platform: "instagram" | "tiktok";
  followers: number;
  following: number;
  posts: number;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isFollowing?: boolean;
}

interface Post {
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
  tiktokUrl?: string;
}

interface TikTokVideoData {
  aweme_id: string;
  desc: string;
  video?: {
    play_addr?: {
      url_list?: string[];
    };
    download_addr?: {
      url_list?: string[];
    };
    origin_cover?: {
      url_list?: string[];
    };
    dynamic_cover?: {
      url_list?: string[];
    };
  };
  statistics?: {
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    share_count?: number;
  };
  create_time: number;
}

interface InstagramPostData {
  id: string;
  video_url?: string;
  display_url?: string;
  thumbnail_src?: string;
  edge_media_to_caption?: {
    edges?: Array<{
      node?: {
        text?: string;
      };
    }>;
  };
  edge_media_preview_like?: {
    count?: number;
  };
  edge_media_to_comment?: {
    count?: number;
  };
  video_view_count?: number;
  taken_at_timestamp: number;
}

interface SavePostData {
  id: string;
  platformPostId: string;
  platform: "instagram" | "tiktok";
  embedUrl: string;
  caption?: string;
  thumbnail: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  handle: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
}

export function DiscoveryContent({}: DiscoveryContentProps) {
  // Note: userId prop is passed from server component but not used directly here
  // Authentication is handled by server actions (savePostToBoard, etc.)
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "instagram" | "tiktok"
  >("tiktok");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transcript">(
    "overview"
  );
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Handle URL parameters (from following page navigation)
  useEffect(() => {
    const handleParam = searchParams.get("handle");
    const platformParam = searchParams.get("platform") as
      | "tiktok"
      | "instagram"
      | null;

    if (handleParam) {
      setSearchQuery(handleParam);
      if (
        platformParam &&
        (platformParam === "tiktok" || platformParam === "instagram")
      ) {
        setSelectedPlatform(platformParam);
      }
    }
  }, [searchParams]);

  const loadPosts = useCallback(async () => {
    if (!searchResults) return;

    setIsLoadingPosts(true);
    try {
      // Get the handle from search results
      const handle = searchResults.handle;
      const platform = searchResults.platform;

      // Call our API to get real posts
      const endpoint =
        platform === "tiktok" ? "tiktok-videos" : "instagram-posts";
      const response = await fetch(
        `/api/test-scrapecreators?test=${endpoint}&handle=${encodeURIComponent(handle)}&count=12`
      );
      const result = await response.json();

      if (result.success && result.data) {
        // Handle different possible response structures
        let videosArray = result.data;

        // Use our transformer functions for consistent data processing
        if (platform === "tiktok") {
          // TikTok API returns videos in aweme_list
          if (result.data.aweme_list) {
            videosArray = result.data.aweme_list;
          } else if (result.data.videos) {
            videosArray = result.data.videos;
          } else if (result.data.data) {
            videosArray = result.data.data;
          } else if (!Array.isArray(result.data)) {
            console.log("TikTok API response structure:", result.data);
            videosArray = [];
          }
        } else {
          // Instagram API returns posts in items array - use our client-safe transformer
          const { transformers } = await import("@/lib/transformers");
          const transformedPosts = transformers.instagram.postsToAppFormat(
            result.data,
            handle
          );

          // Convert to our Post interface format
          const realPosts: Post[] = transformedPosts.map(post => ({
            id: post.id,
            embedUrl: post.embedUrl,
            caption: post.caption || "",
            thumbnail: post.thumbnail,
            metrics: {
              likes: post.metrics.likes,
              comments: post.metrics.comments,
              views: post.metrics.views,
            },
            datePosted: post.datePosted,
            platform: "instagram" as const,
          }));

          setPosts(realPosts);
          return; // Exit early since we've already processed Instagram posts
        }

        // Transform the API response to our Post interface
        const realPosts: Post[] = Array.isArray(videosArray)
          ? videosArray.map(
              (
                item: TikTokVideoData | InstagramPostData,
                index: number
              ): Post => {
                if (platform === "tiktok") {
                  // Transform TikTok video data
                  const tiktokItem = item as TikTokVideoData;

                  // Try to get the best thumbnail URL (prefer non-HEIC formats)
                  const originCover =
                    tiktokItem.video?.origin_cover?.url_list?.[0] || "";
                  const dynamicCover =
                    tiktokItem.video?.dynamic_cover?.url_list?.[0] || "";

                  // Prefer dynamic cover or try to convert HEIC to a more compatible format
                  let thumbnailUrl = dynamicCover || originCover;

                  // If we have a HEIC URL, try to convert it to JPEG by changing the file extension
                  if (thumbnailUrl && thumbnailUrl.includes(".heic")) {
                    thumbnailUrl = thumbnailUrl.replace(".heic", ".jpeg");
                  }

                  return {
                    id: tiktokItem.aweme_id || `tiktok-${index}`,
                    embedUrl:
                      tiktokItem.video?.play_addr?.url_list?.[0] ||
                      tiktokItem.video?.download_addr?.url_list?.[0] ||
                      "",
                    caption: tiktokItem.desc || "No caption available",
                    thumbnail: thumbnailUrl,
                    metrics: {
                      views: tiktokItem.statistics?.play_count || 0,
                      likes: tiktokItem.statistics?.digg_count || 0,
                      comments: tiktokItem.statistics?.comment_count || 0,
                      shares: tiktokItem.statistics?.share_count || 0,
                    },
                    datePosted: new Date(
                      tiktokItem.create_time * 1000
                    ).toISOString(),
                    platform: "tiktok" as const,
                    tiktokUrl: `https://www.tiktok.com/@${handle}/video/${tiktokItem.aweme_id}`,
                  };
                } else {
                  // Transform Instagram post data
                  const instagramItem = item as any; // Use any for now since API structure may vary

                  // Handle different possible Instagram API response structures
                  const postId =
                    instagramItem.id ||
                    instagramItem.pk ||
                    `instagram-${index}`;
                  const caption =
                    instagramItem.caption?.text ||
                    instagramItem.edge_media_to_caption?.edges?.[0]?.node
                      ?.text ||
                    "No caption available";

                  // Handle different image/video URL structures
                  const mediaUrl =
                    instagramItem.video_url ||
                    instagramItem.display_url ||
                    instagramItem.image_versions2?.candidates?.[0]?.url ||
                    instagramItem.carousel_media?.[0]?.image_versions2
                      ?.candidates?.[0]?.url ||
                    "";

                  const thumbnailUrl = proxyInstagramImage(
                    instagramItem.display_url ||
                      instagramItem.thumbnail_src ||
                      instagramItem.image_versions2?.candidates?.[0]?.url ||
                      mediaUrl ||
                      ""
                  );

                  // Handle different metrics structures
                  const likes =
                    instagramItem.like_count ||
                    instagramItem.edge_media_preview_like?.count ||
                    0;
                  const comments =
                    instagramItem.comment_count ||
                    instagramItem.edge_media_to_comment?.count ||
                    0;
                  const views =
                    instagramItem.view_count ||
                    instagramItem.video_view_count ||
                    instagramItem.play_count;

                  // Handle timestamp
                  const timestamp =
                    instagramItem.taken_at ||
                    instagramItem.taken_at_timestamp ||
                    Date.now() / 1000;

                  return {
                    id: postId,
                    embedUrl: mediaUrl,
                    caption: caption,
                    thumbnail: thumbnailUrl,
                    metrics: {
                      likes: likes,
                      comments: comments,
                      ...(views !== undefined && { views: views }),
                    },
                    datePosted: new Date(timestamp * 1000).toISOString(),
                    platform: "instagram" as const,
                  };
                }
              }
            )
          : [];

        setPosts(realPosts);
      } else {
        // Fallback to empty array if API fails
        console.error("Failed to load posts:", result.error);
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      // Set empty array on error
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [searchResults]);

  // Auto-load posts when search results change
  useEffect(() => {
    if (searchResults) {
      loadPosts();
    }
  }, [searchResults, loadPosts]);

  // Check follow status when search results change
  useEffect(() => {
    if (searchResults) {
      const checkFollowStatus = async () => {
        try {
          const { checkFollowStatus: checkStatus } = await import(
            "@/app/actions/discovery"
          );
          const result = await checkStatus(
            searchResults.handle,
            searchResults.platform
          );

          if (result.success) {
            setSearchResults(prev =>
              prev
                ? {
                    ...prev,
                    isFollowing: result.data,
                  }
                : null
            );
          }
        } catch (error) {
          console.error("Failed to check follow status:", error);
        }
      };

      checkFollowStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults?.handle, searchResults?.platform]);

  const loadTranscript = useCallback(async (videoUrl: string) => {
    if (!videoUrl) return;

    setIsLoadingTranscript(true);
    setTranscriptError(null);

    try {
      const response = await fetch(
        `/api/test-transcript?url=${encodeURIComponent(videoUrl)}&language=en`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setTranscript(result.data);
      } else {
        setTranscriptError(result.error || "Failed to load transcript");
      }
    } catch (error) {
      console.error("Failed to load transcript:", error);
      setTranscriptError("Failed to load transcript. Please try again.");
    } finally {
      setIsLoadingTranscript(false);
    }
  }, []);

  const handleCopyTranscript = async () => {
    if (!transcript?.transcript) return;

    const cleanText = parseWebVTT(transcript.transcript);
    const success = await copyToClipboard(cleanText);

    if (success) {
      // You can add a toast notification here
      console.log("Transcript copied to clipboard");
    } else {
      console.error("Failed to copy transcript");
    }
  };

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setIsSearching(true);
      setSearchResults(null);
      setPosts([]);
      setSearchError(null);
      setHasSearched(true);

      try {
        // Clean the handle - remove @ and whitespace
        const cleanHandle = query.replace(/[@\s]/g, "");

        // Call our discovery API (using test endpoint for now)
        const response = await fetch(
          `/api/test-discovery?handle=${encodeURIComponent(cleanHandle)}&platform=${selectedPlatform}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const profile: Profile = {
            ...result.data,
            isFollowing: false,
          };

          setSearchResults(profile);
          // Don't call loadPosts() here - let useEffect handle it when searchResults updates
        } else {
          setSearchError(
            result.error ||
              "Profile not found. Please check the handle and try again."
          );
        }
      } catch (error) {
        console.error("Search failed:", error);
        setSearchError("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    },
    [selectedPlatform]
  );

  // Auto-search when coming from following page
  useEffect(() => {
    const handleParam = searchParams.get("handle");
    if (
      handleParam &&
      searchQuery === handleParam &&
      !searchResults &&
      !isSearching
    ) {
      // Only trigger search if we have the handle in query but no results yet
      handleSearch(handleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, searchQuery, isSearching, handleSearch]);

  const handleFollowProfile = async () => {
    if (!searchResults) return;

    try {
      const { createAndFollowProfile, unfollowProfileByHandle } = await import(
        "@/app/actions/discovery"
      );

      if (searchResults.isFollowing) {
        // Unfollow
        const result = await unfollowProfileByHandle(
          searchResults.handle,
          searchResults.platform
        );
        if (result.success) {
          setSearchResults({
            ...searchResults,
            isFollowing: false,
          });
          toast.success(`Unfollowed @${searchResults.handle}`);
        } else {
          console.error("Failed to unfollow:", result.error);
          toast.error("Failed to unfollow creator");
        }
      } else {
        // Follow - create profile if needed and follow
        const result = await createAndFollowProfile({
          handle: searchResults.handle,
          platform: searchResults.platform,
          displayName: searchResults.displayName,
          bio: searchResults.bio,
          followers: searchResults.followers,
          following: searchResults.following,
          posts: searchResults.posts,
          avatarUrl: searchResults.avatarUrl,
          verified: searchResults.verified,
        });

        if (result.success) {
          setSearchResults({
            ...searchResults,
            isFollowing: true,
          });
          toast.success(`Now following @${searchResults.handle}!`);
        } else {
          console.error("Failed to follow:", result.error);
          toast.error("Failed to follow creator");
        }
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  const handleSavePost = (post: Post) => {
    // Transform post data for the modal

    setPostToSave({
      id: post.id,
      platformPostId: post.id, // Use the same ID for now
      platform: post.platform,
      embedUrl: post.embedUrl,
      caption: post.caption,
      thumbnail: post.thumbnail,
      metrics: post.metrics,
      datePosted: post.datePosted,
      handle: searchResults?.handle || "",
      displayName: searchResults?.displayName,
      bio: searchResults?.bio,
      followers: searchResults?.followers,
      avatarUrl: searchResults?.avatarUrl,
      verified: searchResults?.verified,
    } as SavePostData);
    setShowSaveModal(true);
  };

  const handlePostClick = (post: Post) => {
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
      selectedPost.tiktokUrl &&
      !transcript &&
      !isLoadingTranscript
    ) {
      loadTranscript(selectedPost.tiktokUrl);
    }
  };

  return (
    <div className="  space-y-6">
      {/* Header */}
      <div className="relative flex items-center">
        <h1 className="text-base font-semibold text-[#171717]">
          Discover Content
        </h1>

        {/* Search Bar - Centered on entire screen */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="relative w-[600px]">
            <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                selectedPlatform === "instagram"
                  ? "Search Instagram creators (e.g., @mrbeast, @cristiano)"
                  : "Search TikTok creators (e.g., @iamsydneythomas, @khaby.lame)"
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10 w-[600px] h-[36px] bg-[#F3F3F3] border-[#DBDBDB] shadow-none text-[#707070] placeholder:text-[#707070]"
            />
            {searchQuery && (
              <Button
                onClick={() => handleSearch(searchQuery)}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-3 text-xs"
              >
                Search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Results */}
      {searchResults && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src={proxyInstagramImage(searchResults.avatarUrl)}
                    alt={
                      searchResults.displayName ||
                      `${searchResults.platform} profile picture`
                    }
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={e => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = "/placeholder-avatar.jpg";
                    }}
                    unoptimized
                  />
                  {searchResults.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">
                      {searchResults.displayName}
                    </h2>
                    <Badge variant="secondary" className="capitalize">
                      {searchResults.platform}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    @{searchResults.handle}
                  </p>
                  <p className="text-sm mt-2">{searchResults.bio}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatNumber(searchResults.followers)}
                    </div>
                    <div className="text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatNumber(searchResults.following)}
                    </div>
                    <div className="text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatNumber(searchResults.posts)}
                    </div>
                    <div className="text-muted-foreground">Posts</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleFollowProfile}
                    variant={searchResults.isFollowing ? "outline" : "default"}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {searchResults.isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Section */}
      {searchResults && (
        <div className="space-y-4">
          {/* Posts Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Recent Posts ({posts.length})
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Posts Grid */}
          {isLoadingPosts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse"
                >
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              )}
            >
              {posts.map(post => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className={cn(
                    "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                    viewMode === "list" && "flex flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "relative",
                      viewMode === "grid" ? "aspect-[3/4]" : "w-48 aspect-[3/4]"
                    )}
                  >
                    {/* Video that plays on hover */}
                    <video
                      src={post.embedUrl}
                      poster={proxyInstagramImage(post.thumbnail)}
                      className="w-full h-full object-cover"
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
                        img.src = proxyInstagramImage(post.thumbnail);
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
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={e => {
                          e.stopPropagation();
                          handleSavePost(post);
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "p-4 space-y-3",
                      viewMode === "list" && "flex-1"
                    )}
                  >
                    <p className="text-sm line-clamp-2">{post.caption}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(post.metrics.likes)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {formatNumber(post.metrics.comments)}
                        </div>
                        {post.metrics.views && (
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-current opacity-60" />
                            {formatNumber(post.metrics.views)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.datePosted)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no search */}
      {!searchResults && !isSearching && !hasSearched && (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center space-y-8 max-w-2xl">
            {/* Platform Selection */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Start Your Content Discovery
              </h2>
              <p className="text-muted-foreground">
                Choose a platform and search for creators to explore their
                latest posts and find inspiration for your content strategy.
              </p>
            </div>

            {/* Platform Buttons */}
            <div className="flex justify-center gap-6">
              <Button
                variant={selectedPlatform === "tiktok" ? "default" : "outline"}
                onClick={() => setSelectedPlatform("tiktok")}
                className={cn(
                  "flex items-center gap-4 px-12 py-6 text-lg font-semibold w-48 justify-center",
                  selectedPlatform === "tiktok"
                    ? "bg-black text-white border-0 shadow-lg hover:bg-gray-800"
                    : "border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                )}
              >
                <TiktokIcon className="w-7 h-7" />
                TikTok ✨
              </Button>
              <Button
                variant={
                  selectedPlatform === "instagram" ? "default" : "outline"
                }
                onClick={() => setSelectedPlatform("instagram")}
                className={cn(
                  "flex items-center gap-4 px-12 py-6 text-lg font-semibold w-48 justify-center",
                  selectedPlatform === "instagram"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg"
                    : "border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                )}
              >
                <InstagramIcon className="w-7 h-7" />
                Instagram ✨
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state during search */}
      {isSearching && (
        <div className="space-y-6">
          {/* Profile Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Avatar Skeleton */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Skeleton className="w-20 h-20 rounded-full" />
                  </div>
                </div>

                {/* Profile Info Skeleton */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Stats Skeleton */}
                  <div className="flex gap-6">
                    <div className="text-center">
                      <Skeleton className="h-5 w-12 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-5 w-12 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-5 w-12 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>

                  {/* Actions Skeleton */}
                  <div className="flex gap-3">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section Skeleton */}
          <div className="space-y-4">
            {/* Posts Header Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            {/* Posts Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state when search fails or no results */}
      {!searchResults && !isSearching && hasSearched && searchError && (
        <div className="flex justify-center items-center min-h-[60vh]">
          <EmptyState
            title="No Results Found"
            description={`We couldn't find a creator with the handle "${searchQuery}". Try checking the spelling or searching for a different creator.`}
            icons={[Search, FileQuestion]}
            action={{
              label: "Try Another Search",
              onClick: () => {
                setSearchQuery("");
                setHasSearched(false);
                setSearchError(null);
              },
            }}
          />
        </div>
      )}

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {selectedPost.platform === "tiktok" ? "TikTok" : "Instagram"}{" "}
                  Post
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Video/Image */}
                <div className="space-y-4">
                  <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <video
                      src={selectedPost.embedUrl}
                      poster={selectedPost.thumbnail}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      onError={e => {
                        // Fallback to image if video fails
                        const img = document.createElement("img");
                        img.src = selectedPost.thumbnail;
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
                        {/* Caption */}
                        <div>
                          <h3 className="font-semibold mb-2">Caption</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedPost.caption}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div>
                          <h3 className="font-semibold mb-3">Performance</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedPost.metrics.views && (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                <div>
                                  <div className="text-sm font-medium">
                                    {formatNumber(selectedPost.metrics.views)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Views
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <div>
                                <div className="text-sm font-medium">
                                  {formatNumber(selectedPost.metrics.likes)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Likes
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="text-sm font-medium">
                                  {formatNumber(selectedPost.metrics.comments)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Comments
                                </div>
                              </div>
                            </div>
                            {selectedPost.metrics.shares && (
                              <div className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-green-500" />
                                <div>
                                  <div className="text-sm font-medium">
                                    {formatNumber(selectedPost.metrics.shares)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Shares
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Post Date */}
                        <div>
                          <h3 className="font-semibold mb-2">Posted</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedPost.datePosted)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            className="flex-1"
                            onClick={() => handleSavePost(selectedPost)}
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save to Board
                          </Button>
                          <Button variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </>
                    )}

                    {activeTab === "transcript" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Transcript</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyTranscript}
                            disabled={
                              !transcript?.transcript ||
                              isLoadingTranscript ||
                              selectedPost?.platform !== "tiktok"
                            }
                          >
                            Copy Transcript
                          </Button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          {selectedPost?.platform !== "tiktok" ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Transcripts are only available for TikTok videos
                              </p>
                            </div>
                          ) : isLoadingTranscript ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-5/6" />
                            </div>
                          ) : transcriptError ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-red-600 mb-2">
                                {transcriptError}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  selectedPost &&
                                  selectedPost.tiktokUrl &&
                                  loadTranscript(selectedPost.tiktokUrl)
                                }
                              >
                                Try Again
                              </Button>
                            </div>
                          ) : transcript?.transcript ? (
                            <p className="text-sm leading-relaxed">
                              {parseWebVTT(transcript.transcript)}
                            </p>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Click to load transcript
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  selectedPost &&
                                  selectedPost.tiktokUrl &&
                                  loadTranscript(selectedPost.tiktokUrl)
                                }
                              >
                                Load Transcript
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                          {selectedPost?.platform !== "tiktok"
                            ? "Transcript feature is TikTok exclusive"
                            : isLoadingTranscript
                              ? "Loading..."
                              : "Transcript generated automatically. Accuracy may vary."}
                        </div>
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
        <SavePostModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setPostToSave(null);
          }}
          post={postToSave}
        />
      )}
    </div>
  );
}
