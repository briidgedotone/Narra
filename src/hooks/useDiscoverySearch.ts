"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import { getCached, setCache } from "@/lib/utils/cache";
import { Profile, Platform } from "@/types/discovery";

export function useDiscoverySearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Discovery State
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("tiktok");

  // Handle URL parameters (from following page navigation)
  useEffect(() => {
    const handleParam = searchParams.get("handle");
    const platformParam = searchParams.get("platform") as Platform | null;

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

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setIsLoading(true);
      setSearchResults(null);
      setSearchError(null);
      setHasSearched(true);

      try {
        // Clean the handle - remove @ and whitespace
        const cleanHandle = query.replace(/[@\s]/g, "");

        // Create cache key for this search
        const cacheKey = `discovery-${cleanHandle}-${selectedPlatform}`;

        // Check cache first
        const cachedResult = getCached<Profile>(cacheKey);
        if (cachedResult) {
          console.log("Using cached result for", cleanHandle);
          const profile: Profile = {
            ...cachedResult,
            isFollowing: false,
          };
          setSearchResults(profile);
          setIsLoading(false);
          return;
        }

        // Update URL with search parameters
        router.push(
          `/discovery?handle=${encodeURIComponent(cleanHandle)}&platform=${selectedPlatform}`,
          { scroll: false }
        );

        // Call our discovery API
        const response = await fetch(
          `/api/discovery?handle=${encodeURIComponent(cleanHandle)}&platform=${selectedPlatform}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          // Cache the successful result
          setCache(cacheKey, result.data);

          const profile: Profile = {
            ...result.data,
            isFollowing: false,
          };

          setSearchResults(profile);
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
        setIsLoading(false);
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
      !isLoading
    ) {
      // Only trigger search if we have the handle in query but no results yet
      handleSearch(handleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, searchQuery, isLoading, handleSearch]);

  // Handle input changes WITHOUT automatic search
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
    },
    []
  );

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

  const resetSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    setSearchError(null);
    setSearchResults(null);
  };

  return {
    // State
    searchQuery,
    isLoading,
    searchResults,
    searchError,
    hasSearched,
    selectedPlatform,

    // Actions
    setSearchQuery,
    setSelectedPlatform,
    handleSearch,
    handleSearchInputChange,
    handleFollowProfile,
    resetSearch,
  };
}
