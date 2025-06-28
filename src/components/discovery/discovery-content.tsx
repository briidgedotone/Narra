"use client";

import { Search01Icon, InstagramIcon, TiktokIcon } from "hugeicons-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { SavePostModal } from "@/components/shared/save-post-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Calendar,
  Bookmark,
  UserPlus,
  Search,
  FileQuestion,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "@/components/ui/icons";
import { TikTok, Instagram } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber, formatDate } from "@/lib/utils/format";
import { parseWebVTT, copyToClipboard } from "@/lib/utils/format";
import { proxyInstagramImage, proxyImage } from "@/lib/utils/image-proxy";
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

interface CarouselMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  isVideo: boolean;
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
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
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
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [sortOption, setSortOption] = useState("most-recent");
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
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [postCarouselIndices, setPostCarouselIndices] = useState<
    Record<string, number>
  >({});

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
    // Clear existing posts when loading new ones
    setPosts([]);
    try {
      // Get the handle from search results
      const handle = searchResults.handle;
      const platform = searchResults.platform;

      // Call our API to get real posts
      const endpoint =
        platform === "tiktok" ? "tiktok-videos" : "instagram-posts";
      const response = await fetch(
        `/api/test-scrapecreators?test=${endpoint}&handle=${encodeURIComponent(handle)}&count=50`
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

          // Set pagination metadata for Instagram
          setHasMorePosts(result.data.more_available || false);
          setNextMaxId(result.data.next_max_id || null);

          // Convert to our Post interface format
          const newPosts: Post[] = transformedPosts.map((post: any) => ({
            id: post.id,
            embedUrl: post.embedUrl,
            caption: post.caption || "",
            thumbnail: post.thumbnail,
            metrics: {
              views: post.metrics?.views || 0,
              likes: post.metrics?.likes || 0,
              comments: post.metrics?.comments || 0,
              shares: post.metrics?.shares || 0,
            },
            datePosted: post.datePosted,
            platform: post.platform,
          }));

          // Set the posts directly since we cleared the array at the start
          setPosts(newPosts);
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

  const loadMorePosts = useCallback(async () => {
    if (!searchResults || !hasMorePosts || !nextMaxId || isLoadingMorePosts)
      return;

    setIsLoadingMorePosts(true);
    try {
      const handle = searchResults.handle;
      const platform = searchResults.platform;

      if (platform === "instagram") {
        // Call Instagram API with pagination
        const response = await fetch(
          `/api/test-scrapecreators?test=instagram-posts&handle=${encodeURIComponent(handle)}&count=50&next_max_id=${nextMaxId}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const { transformers } = await import("@/lib/transformers");
          const transformedPosts = transformers.instagram.postsToAppFormat(
            result.data,
            handle
          );

          // Update pagination metadata
          setHasMorePosts(result.data.more_available || false);
          setNextMaxId(result.data.next_max_id || null);

          // Convert to our Post interface format and append to existing posts
          const newPosts: Post[] = transformedPosts.map((post: any) => ({
            id: post.id,
            embedUrl: post.embedUrl,
            caption: post.caption || "",
            thumbnail: post.thumbnail,
            metrics: {
              views: post.metrics?.views || 0,
              likes: post.metrics?.likes || 0,
              comments: post.metrics?.comments || 0,
              shares: post.metrics?.shares || 0,
            },
            datePosted: post.datePosted,
            platform: post.platform,
          }));

          // Append new posts to existing posts
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoadingMorePosts(false);
    }
  }, [searchResults, hasMorePosts, nextMaxId, isLoadingMorePosts]);

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

        // Update URL with search parameters
        router.push(
          `/discovery?handle=${encodeURIComponent(cleanHandle)}&platform=${selectedPlatform}`,
          { scroll: false }
        );

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
    [selectedPlatform, router]
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
    setPostToSave({
      id: post.id,
      platformPostId: post.id,
      platform: post.platform,
      embedUrl: post.embedUrl,
      caption: post.caption,
      thumbnail: post.thumbnail,
      metrics: {
        views: post.metrics?.views || 0,
        likes: post.metrics?.likes || 0,
        comments: post.metrics?.comments || 0,
        shares: post.metrics?.shares || 0,
      },
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
    setCurrentCarouselIndex(0); // Reset carousel to first item
  };

  const handleCarouselNext = () => {
    if (selectedPost?.isCarousel && selectedPost.carouselMedia) {
      setCurrentCarouselIndex(prev =>
        prev < selectedPost.carouselMedia!.length - 1 ? prev + 1 : 0
      );
    }
  };

  const handleCarouselPrev = () => {
    if (selectedPost?.isCarousel && selectedPost.carouselMedia) {
      setCurrentCarouselIndex(prev =>
        prev > 0 ? prev - 1 : selectedPost.carouselMedia!.length - 1
      );
    }
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

  const handlePostCarouselNext = (postId: string, maxIndex: number) => {
    setPostCarouselIndices(prev => ({
      ...prev,
      [postId]: Math.min((prev[postId] || 0) + 1, maxIndex - 1),
    }));
  };

  const handlePostCarouselPrev = (postId: string) => {
    setPostCarouselIndices(prev => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 0) - 1, 0),
    }));
  };

  const getPostCarouselIndex = (postId: string) => {
    return postCarouselIndices[postId] || 0;
  };

  const sortedPosts = useMemo(() => {
    const postsToSort = [...posts];
    switch (sortOption) {
      case "most-viewed":
        return postsToSort.sort(
          (a, b) => (b.metrics.views ?? 0) - (a.metrics.views ?? 0)
        );
      case "most-liked":
        return postsToSort.sort((a, b) => b.metrics.likes - a.metrics.likes);
      case "most-commented":
        return postsToSort.sort(
          (a, b) => b.metrics.comments - a.metrics.comments
        );
      case "most-recent":
      default:
        // Assuming datePosted is a string that can be parsed into a Date
        return postsToSort.sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );
    }
  }, [posts, sortOption]);

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
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-3 text-xs bg-[#2463EB] hover:bg-[#2463EB]/90"
              >
                Search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Results */}
      {searchResults && (
        <div className="rounded-lg">
          <div>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src={proxyImage(
                      searchResults.avatarUrl,
                      searchResults.platform
                    )}
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
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {searchResults.displayName}
                      </h2>
                      {searchResults.platform === "tiktok" && (
                        <TikTok className="h-6 w-6 text-black" />
                      )}
                      {searchResults.platform === "instagram" && (
                        <Instagram className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
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
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleFollowProfile}
                    disabled={searchResults.isFollowing}
                    className="w-full sm:w-auto bg-[#2463EB] hover:bg-[#2463EB]/90"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Section */}
      {posts.length > 0 && (
        <div className="space-y-4">
          {/* Posts Header & Filters */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Recent Posts ({posts.length})
            </h3>

            <div className="flex items-center gap-4">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedPosts.map((post, index) => (
                <div
                  key={`${post.id}-${index}`}
                  onClick={() => handlePostClick(post)}
                  className={cn(
                    "group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                  )}
                >
                  <div className={cn("relative aspect-[4/5]")}>
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
                                    img.className =
                                      "w-full h-full object-cover";
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
                                  src={proxyInstagramImage(media.url)}
                                  alt="Post media"
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={e => {
                                    e.currentTarget.src =
                                      "/placeholder-post.jpg";
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Single Media Display (existing logic)
                        <div className="w-full h-full">
                          <video
                            src={
                              post.platform === "instagram"
                                ? `/api/proxy-image?url=${encodeURIComponent(post.embedUrl)}`
                                : post.embedUrl
                            }
                            poster={proxyInstagramImage(post.thumbnail)}
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

                    {/* Save Button */}
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
          )}

          {/* Load More Button for Instagram */}
          {!isLoadingPosts &&
            searchResults?.platform === "instagram" &&
            hasMorePosts && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={loadMorePosts}
                  disabled={isLoadingMorePosts}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  {isLoadingMorePosts ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Loading More Posts...
                    </>
                  ) : (
                    <>
                      Load More Posts
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
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
            <div>
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
                {/* Left: Video/Image with Carousel Support */}
                <div className="space-y-4">
                  <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    {selectedPost.isCarousel && selectedPost.carouselMedia ? (
                      // Carousel Media Display
                      <>
                        {selectedPost.carouselMedia[currentCarouselIndex]
                          ?.isVideo ? (
                          <video
                            key={
                              selectedPost.carouselMedia[currentCarouselIndex]
                                .id
                            }
                            src={
                              selectedPost.platform === "instagram"
                                ? `/api/proxy-image?url=${encodeURIComponent(selectedPost.carouselMedia[currentCarouselIndex].url)}`
                                : selectedPost.carouselMedia[
                                    currentCarouselIndex
                                  ].url
                            }
                            poster={
                              selectedPost.platform === "instagram"
                                ? proxyInstagramImage(
                                    selectedPost.carouselMedia[
                                      currentCarouselIndex
                                    ].thumbnail
                                  )
                                : selectedPost.carouselMedia[
                                    currentCarouselIndex
                                  ].thumbnail
                            }
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                          />
                        ) : (
                          <img
                            key={
                              selectedPost.carouselMedia?.[currentCarouselIndex]
                                ?.id || currentCarouselIndex
                            }
                            src={
                              selectedPost.platform === "instagram"
                                ? proxyInstagramImage(
                                    selectedPost.carouselMedia?.[
                                      currentCarouselIndex
                                    ]?.url || ""
                                  )
                                : selectedPost.carouselMedia?.[
                                    currentCarouselIndex
                                  ]?.url || ""
                            }
                            alt="Carousel item"
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Carousel Navigation */}
                        {selectedPost.carouselMedia.length > 1 && (
                          <>
                            <button
                              onClick={handleCarouselPrev}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4 transform rotate-90" />
                            </button>
                            <button
                              onClick={handleCarouselNext}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4 transform -rotate-90" />
                            </button>

                            {/* Carousel Indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {selectedPost.carouselMedia.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentCarouselIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentCarouselIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/70"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      // Single Media Display
                      <video
                        src={
                          selectedPost.platform === "instagram"
                            ? `/api/proxy-image?url=${encodeURIComponent(selectedPost.embedUrl)}`
                            : selectedPost.embedUrl
                        }
                        poster={
                          selectedPost.platform === "instagram"
                            ? proxyInstagramImage(selectedPost.thumbnail)
                            : selectedPost.thumbnail
                        }
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        onError={e => {
                          // Fallback to image if video fails
                          const img = document.createElement("img");
                          img.src =
                            selectedPost.platform === "instagram"
                              ? proxyInstagramImage(selectedPost.thumbnail)
                              : selectedPost.thumbnail;
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
                    )}
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
