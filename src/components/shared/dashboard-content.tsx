"use client";

import { CollectionCard } from "@/components/discovery/collection-card";

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({}: DashboardContentProps) {
  // Collections data
  const collections = [
    {
      title: "The MrBeast Collection",
      description:
        "Viral content strategies from YouTube&apos;s biggest philanthropist and entrepreneur",
      username: "MrBeast",
      authorInitial: "M",
      authorBadgeColor: "bg-orange-500",
      backgroundColor: "#FDA02C",
    },
    {
      title: "The Charli D&apos;Amelio Collection",
      description:
        "Dance trends and lifestyle content from TikTok&apos;s most-followed creator",
      username: "Charli D'Amelio",
      authorInitial: "C",
      authorBadgeColor: "bg-black",
      backgroundColor: "#E87BD1",
    },
    {
      title: "The Khaby Lame Collection",
      description:
        "Silent comedy gold and life hacks from TikTok&apos;s king of reactions",
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

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-280px)] space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome to Use Narra
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover, save, and organize inspiring content from your favorite
          creators.
        </p>
      </div>

      {/* Collections */}
      <div className="inline-grid grid-cols-2 gap-y-4 gap-x-6">
        {collections.map((collection, index) => (
          <CollectionCard
            key={index}
            title={collection.title}
            description={collection.description}
            username={collection.username}
            authorInitial={collection.authorInitial}
            authorBadgeColor={collection.authorBadgeColor}
            backgroundColor={collection.backgroundColor}
          />
        ))}
      </div>
    </div>
  );
}
