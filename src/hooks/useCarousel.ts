import { useState, useCallback } from "react";

import {
  getCarouselIndex,
  handleCarouselNext,
  handleCarouselPrev,
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

  return {
    getPostCarouselIndex,
    handlePostCarouselNext,
    handlePostCarouselPrev,
  };
}
