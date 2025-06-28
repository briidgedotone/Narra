"use client";

import { useEffect, useState } from "react";

import { getFeaturedBoards } from "@/app/actions/folders";
import { CollectionCard } from "@/components/discovery/collection-card";

interface DashboardContentProps {
  userId: string;
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

export function DashboardContent({}: DashboardContentProps) {
  const [featuredBoards, setFeaturedBoards] = useState<FeaturedBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedBoards = async () => {
      try {
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

    loadFeaturedBoards();
  }, []);

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
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-280px)] space-y-8">
        {/* Header Section Skeleton */}
        <div className="text-center space-y-3">
          <div className="h-9 w-80 bg-muted rounded-md animate-pulse mx-auto" />
          <div className="h-6 w-96 bg-muted/60 rounded-md animate-pulse mx-auto" />
        </div>

        {/* Collections Grid Skeleton */}
        <div className="inline-grid grid-cols-2 gap-y-4 gap-x-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-[488px] h-[152px] p-4 bg-[#F8F8F8] border-none rounded-xl"
            >
              <div className="flex h-full">
                {/* Image placeholder */}
                <div className="w-[120px] h-[120px] flex-shrink-0 rounded-md bg-muted animate-pulse" />

                {/* Content placeholder */}
                <div className="pl-4 flex-1 flex flex-col justify-start py-2 space-y-3">
                  {/* Title skeleton */}
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />

                  {/* Description skeleton - 2 lines */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted/60 rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-muted/60 rounded animate-pulse" />
                  </div>

                  {/* Bottom spacer to push content up like real card */}
                  <div className="flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-280px)] space-y-8">
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
