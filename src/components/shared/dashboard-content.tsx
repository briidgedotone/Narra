"use client";

import { useEffect, useState } from "react";

import { getFeaturedBoards } from "@/app/actions/folders";
import { CollectionCard } from "@/components/discovery/collection-card";

interface DashboardContentProps {
  initialFeaturedBoards: FeaturedBoard[];
}

interface Collection {
  title: string;
  description: string;
  username: string;
  authorInitial: string;
  authorBadgeColor: string;
  backgroundColor: string;
  boardId?: string | undefined;
  coverImageUrl?: string | undefined;
}

interface FeaturedBoard {
  id: string;
  board_id: string;
  display_order: number;
  cover_image_url: string | null;
  custom_title: string | null;
  custom_description: string | null;
  boards: {
    id: string;
    name: string;
    description: string | null;
    folders: {
      name: string;
    } | null;
  } | null;
}

export function DashboardContent({
  initialFeaturedBoards,
}: DashboardContentProps) {
  const [featuredBoards, setFeaturedBoards] = useState<FeaturedBoard[]>(
    initialFeaturedBoards
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFeaturedBoards = async () => {
      try {
        setLoading(true);
        const result = await getFeaturedBoards();
        if (result.success) {
          setFeaturedBoards(result.data || []);
        }
      } catch (error) {
        console.error("Failed to load featured boards:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have initial data
    if (initialFeaturedBoards.length === 0) {
      loadFeaturedBoards();
    }
  }, [initialFeaturedBoards]);

  // Fallback collections if no featured boards are set
  const fallbackCollections: Collection[] = [
    {
      title: "The MrBeast Collection",
      description:
        "Viral content strategies from YouTube's biggest philanthropist and entrepreneur",
      username: "MrBeast",
      authorInitial: "M",
      authorBadgeColor: "bg-orange-500",
      backgroundColor: "#FDA02C",
    },
    {
      title: "The Charli D'Amelio Collection",
      description:
        "Dance trends and lifestyle content from TikTok's most-followed creator",
      username: "Charli D'Amelio",
      authorInitial: "C",
      authorBadgeColor: "bg-black",
      backgroundColor: "#E87BD1",
    },
    {
      title: "The Khaby Lame Collection",
      description:
        "Silent comedy gold and life hacks from TikTok's king of reactions",
      username: "Khaby Lame",
      authorInitial: "K",
      authorBadgeColor: "bg-purple-500",
      backgroundColor: "#EE97DB",
    },
    {
      title: "The Addison Rae Collection",
      description:
        "Fashion, beauty, and dance content from the multi-platform influencer",
      username: "Addison Rae",
      authorInitial: "A",
      authorBadgeColor: "bg-blue-500",
      backgroundColor: "#B078F9",
    },
  ];

  // Convert featured boards to collection format
  const featuredCollections: Collection[] = featuredBoards.map(
    (board, index) => {
      const boardData = board.boards;

      // Default colors for featured boards
      const colors = ["#FDA02C", "#E87BD1", "#EE97DB", "#B078F9"];

      return {
        title: boardData?.name || `Featured Collection ${board.display_order}`,
        description:
          boardData?.description || "A curated collection of inspiring content",
        username: "", // Remove username for featured boards
        authorInitial: "", // Remove profile initial for featured boards
        authorBadgeColor: "", // Remove badge color for featured boards
        backgroundColor: colors[index % colors.length] || "#94A3B8",
        boardId: board.board_id, // Add board ID for navigation
        coverImageUrl: board.cover_image_url || undefined, // Add cover image URL
      };
    }
  );

  const collections: Collection[] =
    featuredBoards.length > 0 ? featuredCollections : fallbackCollections;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] space-y-12">
        {/* Header Section Skeleton - Motion Style */}
        <div className="text-center space-y-4">
          <div className="h-8 w-72 bg-gray-100 rounded-lg mx-auto animate-pulse" />
          <div className="h-5 w-96 bg-gray-50 rounded-md mx-auto animate-pulse" />
        </div>

        {/* Collections Grid Skeleton - Motion Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Image placeholder - Clean rounded square */}
                <div className="w-20 h-20 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />

                {/* Content placeholder - Clean spacing */}
                <div className="flex-1 space-y-3">
                  {/* Title skeleton - Professional width */}
                  <div className="h-5 w-48 bg-gray-100 rounded-md animate-pulse" />

                  {/* Description skeleton - Two clean lines */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator - Subtle Motion style */}
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-75" />
          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-150" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome to Use Narra
        </h1>
        <p className="text-lg text-muted-foreground">
          {featuredBoards.length > 0
            ? "Discover curated collections from our featured boards."
            : "Discover, save, and organize inspiring content from your favorite creators."}
        </p>
      </div>

      {/* Collections */}
      <div className="inline-grid grid-cols-2 gap-y-4 gap-x-6">
        {collections.map((collection, index) => {
          const isFeatured = featuredBoards.length > 0;
          const featuredCollection = isFeatured
            ? featuredCollections[index]
            : null;

          return (
            <CollectionCard
              key={isFeatured ? `featured-${index}` : `fallback-${index}`}
              title={collection.title}
              description={collection.description}
              username={collection.username}
              authorInitial={collection.authorInitial}
              authorBadgeColor={collection.authorBadgeColor}
              backgroundColor={collection.backgroundColor}
              boardId={featuredCollection?.boardId}
              coverImageUrl={featuredCollection?.coverImageUrl}
            />
          );
        })}
      </div>

      {/* Admin Notice */}
      {featuredBoards.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>No featured collections have been set by the admin yet.</p>
          <p>Showing default collections.</p>
        </div>
      )}
    </div>
  );
}
