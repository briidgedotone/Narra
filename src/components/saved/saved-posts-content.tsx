"use client";

import { useState, useEffect } from "react";

import { getAllUserSavedPosts } from "@/app/actions/posts";
import { InstagramEmbed, TikTokEmbed } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Folder,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
} from "@/components/ui/icons";
import { usePostModal } from "@/hooks/usePostModal";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/format";

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

  // Custom hooks for post modal management
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
      <SavedPostGrid
        posts={posts}
        isLoading={isLoading}
        onPostClick={handlePostClick}
      />

      {/* Post detail modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => closeModal()}>
        <DialogContent className="w-fit max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          {selectedPost && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Left: Embed Component */}
                <div className="space-y-4">
                  <div className="w-fit mx-auto lg:mx-0">
                    {selectedPost.platform === "tiktok" ? (
                      <TikTokEmbed
                        url={selectedPost.originalUrl || selectedPost.embedUrl}
                      />
                    ) : (
                      <InstagramEmbed
                        url={selectedPost.originalUrl || selectedPost.embedUrl}
                      />
                    )}
                  </div>
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
                            {selectedPost.platform === "tiktok"
                              ? "Loading transcript..."
                              : "Transcript not available for Instagram posts."}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {transcript.text}
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
    </div>
  );
}
