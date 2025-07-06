import { useState, useCallback } from "react";

import {
  getCarouselIndex,
  handleCarouselNext,
  handleCarouselPrev,
  setCarouselIndex,
} from "@/lib/utils/carousel";

export function useCarousel() {
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>(
    {}
  );

  const getPostCarouselIndex = useCallback(
    (postId: string) => {
      return getCarouselIndex(carouselStates, postId);
    },
    [carouselStates]
  );

  const handlePostCarouselNext = useCallback(
    (postId: string, maxIndex: number) => {
      setCarouselStates(prev => handleCarouselNext(prev, postId, maxIndex));
    },
    []
  );

  const handlePostCarouselPrev = useCallback((postId: string) => {
    setCarouselStates(prev => handleCarouselPrev(prev, postId));
  }, []);

  const setPostCarouselIndex = useCallback((postId: string, index: number) => {
    setCarouselStates(prev => setCarouselIndex(prev, postId, index));
  }, []);

  return {
    getPostCarouselIndex,
    handlePostCarouselNext,
    handlePostCarouselPrev,
    setPostCarouselIndex,
  };
}
