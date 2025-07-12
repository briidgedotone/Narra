"use client";

import { useState, useCallback } from "react";

export function useCarousel() {
  // Carousel State
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [postCarouselIndices, setPostCarouselIndices] = useState<
    Record<string, number>
  >({});

  const handleCarouselNext = useCallback(() => {
    setCurrentCarouselIndex(prev => prev + 1);
  }, []);

  const handleCarouselPrev = useCallback(() => {
    setCurrentCarouselIndex(prev => prev - 1);
  }, []);

  const handlePostCarouselNext = useCallback(
    (postId: string, maxIndex: number) => {
      setPostCarouselIndices(prev => ({
        ...prev,
        [postId]: Math.min((prev[postId] || 0) + 1, maxIndex - 1),
      }));
    },
    []
  );

  const handlePostCarouselPrev = useCallback((postId: string) => {
    setPostCarouselIndices(prev => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 0) - 1, 0),
    }));
  }, []);

  const getPostCarouselIndex = useCallback(
    (postId: string) => {
      return postCarouselIndices[postId] || 0;
    },
    [postCarouselIndices]
  );

  const resetCarousel = () => {
    setCurrentCarouselIndex(0);
  };

  return {
    // State
    currentCarouselIndex,
    postCarouselIndices,

    // Actions
    setCurrentCarouselIndex,
    handleCarouselNext,
    handleCarouselPrev,
    handlePostCarouselNext,
    handlePostCarouselPrev,
    getPostCarouselIndex,
    resetCarousel,
  };
}
