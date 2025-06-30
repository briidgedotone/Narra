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
    if (post.platform !== "tiktok") return;

    setIsLoadingTranscript(true);
    setTranscriptError(null);
    setCurrentTranscriptPostId(post.id);

    try {
      const response = await fetch("/api/test-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: post.embedUrl,
        }),
      });

      const data = await response.json();

      if (data.success && data.transcript) {
        setTranscript(data.transcript);
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

      // Load transcript when transcript tab is opened and either:
      // 1. We don't have a transcript for this post yet, or
      // 2. The transcript we have is for a different post
      if (
        tab === "transcript" &&
        selectedPost &&
        selectedPost.platform === "tiktok" &&
        !isLoadingTranscript &&
        currentTranscriptPostId !== selectedPost.id
      ) {
        loadTranscript(selectedPost);
      }
    },
    [selectedPost, isLoadingTranscript, currentTranscriptPostId, loadTranscript]
  );

  const handleCopyTranscript = useCallback(async () => {
    if (!transcript?.text) {
      toast.error("No transcript to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(transcript.text);
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
