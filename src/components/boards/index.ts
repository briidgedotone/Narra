/**
 * @fileoverview Board Components Module
 *
 * This module exports all board-related UI components for the Use Narra application.
 * These components work together to provide a complete Pinterest-style board experience
 * with post management, filtering, and detailed viewing capabilities.
 *
 * Components:
 * - PostCard: Individual post display with carousel navigation
 * - PostGrid: Responsive grid layout for displaying multiple posts
 *
 * Features:
 * - Pinterest-style responsive grid layout
 * - Post filtering by platform (TikTok/Instagram) and recency
 * - Carousel navigation for multi-image posts
 * - Performance optimizations with React.memo and memoized calculations
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Lazy loading images for better performance
 * - Error handling and loading states
 *
 * Usage:
 * ```tsx
 * import { PostGrid } from '@/components/boards';
 *
 * function BoardPage() {
 *   return (
 *     <PostGrid posts={posts} onPostClick={handlePostClick} />
 *   );
 * }
 * ```
 *
 * @author Use Narra Team
 * @version 1.0.0
 */

export { PostGrid } from "./PostGrid";
