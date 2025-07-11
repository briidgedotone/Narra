"use client";

import { useState, useCallback } from "react";

import { parseWebVTT, copyToClipboard } from "@/lib/utils/format";
import { VideoTranscript } from "@/types/content";

export function useTranscript() {
  // Transcript State
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null);
  const [transcriptPostId, setTranscriptPostId] = useState<string | null>(null); // Track which post's transcript we have
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const loadTranscript = useCallback(
    async (videoUrl: string, postId: string) => {
      console.log("loadTranscript called with:", videoUrl, postId);
      if (!videoUrl || !postId) return;

      setIsLoadingTranscript(true);
      setTranscriptError(null);

      try {
        const response = await fetch(
          `/api/transcript?url=${encodeURIComponent(videoUrl)}&language=en`
        );

        // Check if response is valid
        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const responseText = await response.text();
        if (!responseText || responseText.trim().length === 0) {
          throw new Error("API response is empty");
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error in loadTranscript:", parseError);
          throw new Error("Invalid JSON response from API");
        }

        if (result.success && result.data) {
          setTranscript(result.data);
          setTranscriptPostId(postId); // Track which post this transcript belongs to
        } else {
          setTranscriptError(result.error || "Failed to load transcript");
          setTranscriptPostId(null);
        }
      } catch (error) {
        console.error("Failed to load transcript:", error);
        setTranscriptError("Failed to load transcript. Please try again.");
        setTranscriptPostId(null);
      } finally {
        setIsLoadingTranscript(false);
      }
    },
    []
  );

  const handleCopyTranscript = async () => {
    if (!transcript?.transcript) return;

    const cleanText = parseWebVTT(transcript.transcript);
    const success = await copyToClipboard(cleanText);

    if (success) {
      // You can add a toast notification here
      console.log("Transcript copied to clipboard");
    } else {
      console.error("Failed to copy transcript");
    }
  };

  const resetTranscript = () => {
    setTranscript(null);
    setTranscriptPostId(null);
    setTranscriptError(null);
    setIsLoadingTranscript(false);
  };

  return {
    // State
    transcript,
    transcriptPostId,
    isLoadingTranscript,
    transcriptError,

    // Actions
    loadTranscript,
    handleCopyTranscript,
    resetTranscript,
  };
}
