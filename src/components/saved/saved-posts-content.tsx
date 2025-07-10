"use client";

import { useState, useEffect } from "react";

import { getAllUserSavedPosts } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Folder } from "@/components/ui/icons";

import { SavedPostGrid } from "./SavedPostGrid";

interface SavedPostsContentProps {
  userId: string;
}

interface SavedPost {
  id: string;
  embedUrl: string;
  originalUrl?: string;
  caption: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  platform: "instagram" | "tiktok";
  profile: {
    handle: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
}

export function SavedPostsContent({}: SavedPostsContentProps) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      {/* Posts Count */}
      <div className="text-sm text-muted-foreground">
        {posts.length} saved posts
      </div>

      {/* Posts Grid */}
      <SavedPostGrid posts={posts} isLoading={isLoading} />
    </div>
  );
}
