"use client";

import { useEffect, useState } from "react";

import { getFeaturedBoards } from "@/app/actions/folders";
import { CollectionCard } from "@/components/discovery/collection-card";

interface DashboardContentProps {
  userId: string;
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
  const fallbackCollections = [
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
  const collections =
    featuredBoards.length > 0
      ? featuredBoards.map((board, index) => {
          const boardData = board.boards;
          const folderName = boardData?.folders?.name || "Unknown Folder";

          // Default colors for featured boards
          const colors = ["#FDA02C", "#E87BD1", "#EE97DB", "#B078F9"];
          const badgeColors = [
            "bg-orange-500",
            "bg-black",
            "bg-purple-500",
            "bg-blue-500",
          ];

          return {
            title:
              boardData?.name || `Featured Collection ${board.display_order}`,
            description: `Curated content from ${folderName}`,
            username: folderName,
            authorInitial: folderName.charAt(0).toUpperCase(),
            authorBadgeColor: badgeColors[index % badgeColors.length],
            backgroundColor: colors[index % colors.length],
            boardId: board.board_id, // Add board ID for navigation
          };
        })
      : fallbackCollections;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-280px)] space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome to Use Narra
          </h1>
          <p className="text-lg text-muted-foreground">
            Loading featured collections...
          </p>
        </div>
        <div className="inline-grid grid-cols-2 gap-y-4 gap-x-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-[280px] h-[200px] bg-muted rounded-lg animate-pulse"
            />
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
        {collections.map((collection, index) => (
          <CollectionCard
            key={
              featuredBoards.length > 0
                ? `featured-${index}`
                : `fallback-${index}`
            }
            title={collection.title}
            description={collection.description}
            username={collection.username}
            authorInitial={collection.authorInitial}
            authorBadgeColor={collection.authorBadgeColor}
            backgroundColor={collection.backgroundColor}
            boardId={
              featuredBoards.length > 0
                ? (collection as any).boardId
                : undefined
            } // Pass board ID if available
          />
        ))}
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
