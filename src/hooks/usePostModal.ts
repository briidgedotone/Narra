import { useState, useCallback } from "react";
import { toast } from "sonner";

import type { SavedPost, VideoTranscript } from "@/types/board";

export function usePostModal() {
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transcript">(
    "overview"
  );
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [currentTranscriptPostId, setCurrentTranscriptPostId] = useState<
    string | null
  >(null);

  const handlePostClick = useCallback((post: SavedPost) => {
    setSelectedPost(post);
    setActiveTab("overview");
    // Reset transcript state when opening new post
    setTranscript(null);
    setTranscriptError(null);
    setIsLoadingTranscript(false);
    setCurrentTranscriptPostId(null);
  }, []);

  const loadTranscript = useCallback(async (post: SavedPost) => {
    if (
      post.platform !== "tiktok" &&
      !(post.platform === "instagram" && post.isVideo)
    )
      return;

    setIsLoadingTranscript(true);
    setTranscriptError(null);
    setCurrentTranscriptPostId(post.id);

    try {
      const response = await fetch(
        `/api/transcript?url=${encodeURIComponent(post.embedUrl)}`
      );

      const data = await response.json();

      if (data.success && data.data) {
        setTranscript({ text: data.data.transcript });
      } else {
        setTranscriptError(data.error || "Failed to load transcript");
      }
    } catch (error) {
      console.error("Failed to load transcript:", error);
      setTranscriptError("Failed to load transcript");
    } finally {
      setIsLoadingTranscript(false);
    }
  }, []);

  const handleTabChange = useCallback(
    (tab: "overview" | "transcript") => {
      setActiveTab(tab);

      // Always call API for transcript (like discovery page approach)
      if (
        tab === "transcript" &&
        selectedPost &&
        (selectedPost.platform === "tiktok" ||
          (selectedPost.platform === "instagram" && selectedPost.isVideo))
      ) {
        if (
          !isLoadingTranscript &&
          currentTranscriptPostId !== selectedPost.id
        ) {
          // Always fetch fresh transcript from API
          loadTranscript(selectedPost);
        }
      }
    },
    [selectedPost, isLoadingTranscript, currentTranscriptPostId, loadTranscript]
  );

  const handleCopyTranscript = useCallback(async () => {
    if (!transcript?.transcript) {
      toast.error("No transcript to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(transcript.transcript);
      toast.success("Transcript copied to clipboard");
    } catch (error) {
      console.error("Failed to copy transcript:", error);
      toast.error("Failed to copy transcript");
    }
  }, [transcript]);

  const closeModal = useCallback(() => {
    setSelectedPost(null);
  }, []);

  return {
    selectedPost,
    activeTab,
    transcript,
    isLoadingTranscript,
    transcriptError,
    handlePostClick,
    handleTabChange,
    handleCopyTranscript,
    closeModal,
    loadTranscript,
  };
}
