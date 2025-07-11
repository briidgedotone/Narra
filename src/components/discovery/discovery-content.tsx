"use client";

/**
 * DiscoveryContent Component
 *
 * Main component for creator discovery functionality. Allows users to search for
 * TikTok and Instagram creators, view their profiles and posts, and save content
 * to boards.
 *
 * Refactored to use extracted components and hooks for better maintainability.
 */

import React, { useState, useEffect, Suspense } from "react";

import { LoadingSpinner } from "@/components/ui/loading";
import { useCarousel } from "@/hooks/useCarousel";
import { useCleanup } from "@/hooks/useCleanup";
import { useDiscoverySearch } from "@/hooks/useDiscoverySearch";
import { usePostsData } from "@/hooks/usePostsData";
import { useTranscript } from "@/hooks/useTranscript";
import { logMemoryUsage } from "@/lib/utils/memory";
import {
  DiscoveryContentProps,
  Post,
  SavePostData,
  ActiveTab,
} from "@/types/discovery";

import { PostModal } from "./PostModal";
import { PostsGrid } from "./PostsGrid";
import { ProfileCard } from "./ProfileCard";
import { SearchHeader } from "./SearchHeader";

// Lazy load the SavePostModal component to reduce initial bundle size
const SavePostModal = React.lazy(() =>
  import("@/components/shared/save-post-modal").then(module => ({
    default: module.SavePostModal,
  }))
);

export function DiscoveryContent({}: DiscoveryContentProps) {
  // Memory optimization and cleanup
  const {} = useCleanup();

  // Custom hooks for state management
  const {
    searchQuery,
    isLoading: isSearchLoading,
    searchResults,
    searchError,
    hasSearched,
    selectedPlatform,
    setSelectedPlatform,
    handleSearch,
    handleSearchInputChange,
    handleFollowProfile,
    resetSearch,
  } = useDiscoverySearch();

  const {
    posts,
    hasMorePosts,
    tiktokHasMore,
    isLoadingMorePosts,
    sortOption,
    loadPosts,
    loadMorePosts,
    setSortOption,
  } = usePostsData();

  const {
    transcript,
    transcriptPostId,
    isLoadingTranscript,
    transcriptError,
    loadTranscript,
    handleCopyTranscript,
    resetTranscript,
  } = useTranscript();

  const {
    currentCarouselIndex,
    setCurrentCarouselIndex,
    handleCarouselNext,
    handleCarouselPrev,
    handlePostCarouselNext,
    handlePostCarouselPrev,
    getPostCarouselIndex,
    resetCarousel,
  } = useCarousel();

  // Local state for modals and UI
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState<SavePostData | null>(null);

  // Log memory usage in development
  useEffect(() => {
    logMemoryUsage("DiscoveryContent mounted");
    return () => logMemoryUsage("DiscoveryContent unmounted");
  }, []);

  // Auto-load posts when search results change
  useEffect(() => {
    if (searchResults) {
      loadPosts(searchResults);
    }
  }, [searchResults, loadPosts]);

  // Event handlers
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setActiveTab("overview");
    // Reset transcript state when opening new post
    resetTranscript();
    resetCarousel();
  };

  const handleSavePost = (post: Post) => {
    setPostToSave({
      id: post.id,
      platformPostId: post.id,
      platform: post.platform,
      embedUrl: post.embedUrl,
      caption: post.caption,
      originalUrl:
        post.platform === "instagram"
          ? `https://www.instagram.com/p/${post.shortcode}/`
          : post.tiktokUrl,
      metrics: {
        views: post.metrics?.views,
        likes: post.metrics?.likes || 0,
        comments: post.metrics?.comments || 0,
        shares: post.metrics?.shares,
      },
      datePosted: post.datePosted,
      handle: searchResults?.handle || "",
      displayName: searchResults?.displayName,
      bio: searchResults?.bio,
      followers: searchResults?.followers,
      avatarUrl: searchResults?.avatarUrl,
      verified: searchResults?.verified,
      // Instagram-specific fields
      thumbnail: post.thumbnail,
      isVideo: post.isVideo,
      isCarousel: post.isCarousel,
      carouselMedia: post.carouselMedia,
      carouselCount: post.carouselCount,
      videoUrl: post.videoUrl,
      displayUrl: post.displayUrl,
      shortcode: post.shortcode,
      dimensions: post.dimensions,
    } as SavePostData);
    setShowSaveModal(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);

    // Load transcript when transcript tab is opened for TikTok posts or Instagram videos
    if (
      tab === "transcript" &&
      selectedPost &&
      ((selectedPost.platform === "tiktok" && selectedPost.tiktokUrl) ||
        (selectedPost.platform === "instagram" &&
          selectedPost.isVideo &&
          selectedPost.shortcode)) &&
      !isLoadingTranscript
    ) {
      // Only load transcript if we don't have one for this specific post
      if (transcriptPostId !== selectedPost.id) {
        const videoUrl =
          selectedPost.platform === "tiktok"
            ? selectedPost.tiktokUrl
            : `https://www.instagram.com/p/${selectedPost.shortcode}/`;
        if (videoUrl) {
          loadTranscript(videoUrl, selectedPost.id);
        }
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      handleSearch(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SearchHeader
        searchQuery={searchQuery}
        selectedPlatform={selectedPlatform}
        onSearchQueryChange={handleSearchInputChange}
        onSearch={handleSearch}
        onKeyDown={handleSearchKeyDown}
      />

      {/* Profile Results */}
      {searchResults && (
        <ProfileCard
          profile={searchResults}
          onFollowToggle={handleFollowProfile}
        />
      )}

      {/* Posts Section */}
      <PostsGrid
        searchResults={searchResults}
        posts={posts}
        isLoading={isSearchLoading}
        isLoadingMorePosts={isLoadingMorePosts}
        hasMorePosts={hasMorePosts}
        tiktokHasMore={tiktokHasMore}
        sortOption={sortOption}
        selectedPlatform={selectedPlatform}
        hasSearched={hasSearched}
        searchError={searchError}
        searchQuery={searchQuery}
        onPostClick={handlePostClick}
        onSavePost={handleSavePost}
        onLoadMorePosts={() => loadMorePosts(searchResults)}
        onSortChange={setSortOption}
        onPlatformChange={setSelectedPlatform}
        onResetSearch={resetSearch}
        getPostCarouselIndex={getPostCarouselIndex}
        onPostCarouselNext={handlePostCarouselNext}
        onPostCarouselPrev={handlePostCarouselPrev}
      />

      {/* ================================================================ */}
      {/* MODALS */}
      {/* ================================================================ */}

      {/* Post Detail Modal */}
      <PostModal
        selectedPost={selectedPost}
        activeTab={activeTab}
        transcript={transcript}
        transcriptPostId={transcriptPostId}
        isLoadingTranscript={isLoadingTranscript}
        transcriptError={transcriptError}
        currentCarouselIndex={currentCarouselIndex}
        onTabChange={handleTabChange}
        onCopyTranscript={handleCopyTranscript}
        onClose={() => setSelectedPost(null)}
        onSavePost={handleSavePost}
        onCarouselNext={handleCarouselNext}
        onCarouselPrev={handleCarouselPrev}
        onSetCarouselIndex={setCurrentCarouselIndex}
        onLoadTranscript={loadTranscript}
      />

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
    </div>
  );
}
