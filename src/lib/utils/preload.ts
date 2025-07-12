/**
 * Simple component preloading utilities
 * Preloads components before user navigates to improve perceived performance
 */

// Cache for preloaded components
const preloadCache = new Set<string>();

/**
 * Preload a component by triggering its dynamic import
 */
export function preloadComponent(importFn: () => Promise<any>, key: string) {
  if (preloadCache.has(key)) return;

  preloadCache.add(key);
  importFn().catch(() => {
    // Remove from cache if preload fails so it can be retried
    preloadCache.delete(key);
  });
}

/**
 * Preload route components on hover
 */
export function preloadRoute(route: string) {
  switch (route) {
    case "/discovery":
      preloadComponent(
        () => import("@/components/discovery/discovery-content"),
        "discovery-content"
      );
      break;
    case "/following":
      preloadComponent(
        () => import("@/app/following/following-page-content"),
        "following-content"
      );
      break;
    case "/saved":
      preloadComponent(
        () => import("@/components/saved/saved-posts-content"),
        "saved-content"
      );
      break;
    case "/boards":
      preloadComponent(
        () => import("@/app/boards/boards-page-content"),
        "boards-content"
      );
      break;
  }
}

/**
 * Add hover preloading to navigation links
 */
export function addHoverPreload(element: HTMLElement, route: string) {
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    // Delay preload slightly to avoid preloading on quick mouse movements
    timeoutId = setTimeout(() => preloadRoute(route), 100);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mouseleave", handleMouseLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mouseleave", handleMouseLeave);
    clearTimeout(timeoutId);
  };
}
