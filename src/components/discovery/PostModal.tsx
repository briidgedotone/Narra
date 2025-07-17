"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Calendar,
  Bookmark,
  ChevronDown,
  Eye,
  Share,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber, formatDate, parseWebVTT } from "@/lib/utils/format";
import { proxyImage, proxyInstagramImage } from "@/lib/utils/image-proxy";
import { VideoTranscript } from "@/types/content";
import { Post, ActiveTab } from "@/types/discovery";

interface PostModalProps {
  selectedPost: Post | null;
  activeTab: ActiveTab;
  transcript: VideoTranscript | null;
  transcriptPostId: string | null;
  isLoadingTranscript: boolean;
  transcriptError: string | null;
  currentCarouselIndex: number;
  onTabChange: (tab: ActiveTab) => void;
  onCopyTranscript: () => void;
  onClose: () => void;
  onSavePost: (post: Post) => void;
  onCarouselNext: () => void;
  onCarouselPrev: () => void;
  onSetCarouselIndex: (index: number) => void;
  onLoadTranscript: (videoUrl: string, postId: string) => void;
}

export function PostModal({
  selectedPost,
  activeTab,
  transcript,
  isLoadingTranscript,
  transcriptError,
  currentCarouselIndex,
  onTabChange,
  onCopyTranscript,
  onClose,
  onSavePost,
  onCarouselNext,
  onCarouselPrev,
  onSetCarouselIndex,
  onLoadTranscript,
}: PostModalProps) {
  const [imageLoading, setImageLoading] = useState(true);

  // Reset loading state when carousel index changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentCarouselIndex]);

  // Preload adjacent images for better UX
  useEffect(() => {
    if (selectedPost?.isCarousel && selectedPost.carouselMedia) {
      const nextIndex = currentCarouselIndex + 1;
      const prevIndex = currentCarouselIndex - 1;

      // Preload next image
      if (nextIndex < selectedPost.carouselMedia.length) {
        const nextImage = document.createElement("img");
        const nextUrl =
          selectedPost.platform === "instagram"
            ? proxyInstagramImage(
                selectedPost.carouselMedia[nextIndex]?.url || ""
              )
            : proxyImage(selectedPost.carouselMedia[nextIndex]?.url, "tiktok");
        nextImage.src = nextUrl;
      }

      // Preload previous image
      if (prevIndex >= 0) {
        const prevImage = document.createElement("img");
        const prevUrl =
          selectedPost.platform === "instagram"
            ? proxyInstagramImage(
                selectedPost.carouselMedia[prevIndex]?.url || ""
              )
            : proxyImage(selectedPost.carouselMedia[prevIndex]?.url, "tiktok");
        prevImage.src = prevUrl;
      }
    }
  }, [currentCarouselIndex, selectedPost]);
  const handleLoadTranscript = () => {
    console.log("Load Transcript button clicked");
    if (selectedPost) {
      console.log(
        "Selected post:",
        selectedPost.platform,
        selectedPost.isVideo,
        selectedPost.shortcode
      );
      let videoUrl: string | undefined;
      if (selectedPost.platform === "tiktok" && selectedPost.tiktokUrl) {
        videoUrl = selectedPost.tiktokUrl;
      } else if (
        selectedPost.platform === "instagram" &&
        selectedPost.isVideo &&
        selectedPost.shortcode
      ) {
        videoUrl = `https://www.instagram.com/p/${selectedPost.shortcode}/`;
      }
      console.log("Constructed video URL:", videoUrl);
      if (videoUrl) {
        console.log("Calling loadTranscript with:", videoUrl, selectedPost.id);
        onLoadTranscript(videoUrl, selectedPost.id);
      }
    }
  };

  return (
    <Dialog open={!!selectedPost} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[666px] overflow-y-auto">
        {selectedPost && (
          <>
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
                            selectedPost.carouselMedia[currentCarouselIndex].id
                          }
                          src={
                            selectedPost.platform === "instagram"
                              ? `/api/proxy-image?url=${encodeURIComponent(selectedPost.carouselMedia[currentCarouselIndex].url)}`
                              : selectedPost.carouselMedia[currentCarouselIndex]
                                  .url
                          }
                          poster={
                            selectedPost.platform === "instagram"
                              ? proxyInstagramImage(
                                  selectedPost.carouselMedia[
                                    currentCarouselIndex
                                  ].thumbnail
                                )
                              : proxyImage(
                                  selectedPost.carouselMedia[
                                    currentCarouselIndex
                                  ].thumbnail,
                                  "tiktok"
                                ) || "/placeholder-post.jpg"
                          }
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          {imageLoading && (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                          )}
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
                                : proxyImage(
                                    selectedPost.carouselMedia?.[
                                      currentCarouselIndex
                                    ]?.url,
                                    "tiktok"
                                  )
                            }
                            alt="Carousel item"
                            className="absolute inset-0 w-full h-full object-cover"
                            onLoad={() => setImageLoading(false)}
                            onError={e => {
                              setImageLoading(false);
                              e.currentTarget.src = "/placeholder-post.jpg";
                            }}
                          />
                        </div>
                      )}

                      {/* Carousel Navigation */}
                      {selectedPost.carouselMedia.length > 1 && (
                        <>
                          <button
                            onClick={onCarouselPrev}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4 transform rotate-90" />
                          </button>
                          <button
                            onClick={onCarouselNext}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4 transform -rotate-90" />
                          </button>

                          {/* Carousel Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {selectedPost.carouselMedia.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => onSetCarouselIndex(index)}
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
                  ) : // Single Media Display
                  selectedPost.isVideo || selectedPost.platform === "tiktok" ? (
                    <video
                      src={
                        selectedPost.platform === "instagram"
                          ? selectedPost.videoUrl
                            ? `/api/proxy-image?url=${encodeURIComponent(selectedPost.videoUrl)}`
                            : `/api/proxy-image?url=${encodeURIComponent(selectedPost.embedUrl)}`
                          : selectedPost.embedUrl
                      }
                      poster={
                        selectedPost.platform === "instagram"
                          ? selectedPost.thumbnail
                            ? proxyInstagramImage(selectedPost.thumbnail)
                            : undefined
                          : proxyImage(selectedPost.thumbnail, "tiktok")
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
                            ? selectedPost.thumbnail
                              ? proxyInstagramImage(selectedPost.thumbnail)
                              : "/placeholder-post.jpg"
                            : selectedPost.thumbnail || "/placeholder-post.jpg";
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
                  ) : (
                    <img
                      src={
                        selectedPost.platform === "instagram"
                          ? proxyInstagramImage(
                              selectedPost.thumbnail || selectedPost.embedUrl
                            )
                          : selectedPost.thumbnail || selectedPost.embedUrl
                      }
                      alt="Post image"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = "/placeholder-post.jpg";
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
                    onClick={() => onTabChange("overview")}
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
                    onClick={() => onTabChange("transcript")}
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

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          className="flex-1"
                          onClick={() => onSavePost(selectedPost)}
                        >
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save to Board
                        </Button>
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
                          onClick={onCopyTranscript}
                          disabled={
                            !transcript?.transcript ||
                            isLoadingTranscript ||
                            (selectedPost?.platform === "instagram" &&
                              !selectedPost?.isVideo) ||
                            (selectedPost?.platform !== "tiktok" &&
                              selectedPost?.platform !== "instagram")
                          }
                        >
                          Copy Transcript
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        {selectedPost?.platform === "instagram" &&
                        !selectedPost?.isVideo ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">
                              Transcript not available for Instagram photos
                            </p>
                          </div>
                        ) : selectedPost?.platform !== "tiktok" &&
                          selectedPost?.platform !== "instagram" ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">
                              Transcript not available for this platform
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
                              onClick={handleLoadTranscript}
                            >
                              Try Again
                            </Button>
                          </div>
                        ) : transcript?.transcript ? (
                          <p className="text-sm leading-relaxed max-h-[400px] overflow-y-auto pr-2">
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
                              onClick={handleLoadTranscript}
                            >
                              Load Transcript
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        {selectedPost?.platform === "instagram" &&
                        !selectedPost?.isVideo
                          ? "Transcript not available for Instagram photos"
                          : selectedPost?.platform !== "tiktok" &&
                              selectedPost?.platform !== "instagram"
                            ? "Transcript not available for this platform"
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
  );
}
