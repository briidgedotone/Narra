/**
 * Carousel state management utilities
 */

/**
 * Get the current carousel index for a post
 */
export const getCarouselIndex = (
  carouselStates: Record<string, number>,
  postId: string
): number => {
  return carouselStates[postId] || 0;
};

/**
 * Handle carousel next navigation
 */
export const handleCarouselNext = (
  carouselStates: Record<string, number>,
  postId: string,
  maxIndex: number
): Record<string, number> => {
  return {
    ...carouselStates,
    [postId]: Math.min((carouselStates[postId] || 0) + 1, maxIndex - 1),
  };
};

/**
 * Handle carousel previous navigation
 */
export const handleCarouselPrev = (
  carouselStates: Record<string, number>,
  postId: string
): Record<string, number> => {
  return {
    ...carouselStates,
    [postId]: Math.max((carouselStates[postId] || 0) - 1, 0),
  };
};

/**
 * Set carousel index to a specific value
 */
export const setCarouselIndex = (
  carouselStates: Record<string, number>,
  postId: string,
  index: number
): Record<string, number> => {
  return {
    ...carouselStates,
    [postId]: index,
  };
};
