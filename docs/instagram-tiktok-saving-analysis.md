# Instagram vs TikTok Saving Functionality Analysis

## Overview

This document analyzes how TikTok and Instagram post saving functionality works in the Narra application, identifying gaps and issues in the Instagram saving process.

## TikTok Saving Functionality

### Data Flow

1. TikTok posts are scraped with `aweme_id` as primary identifier
2. `originalUrl` is constructed as: `https://www.tiktok.com/@${handle}/video/${aweme_id}`
3. All metrics are available (views, likes, comments, shares)
4. Single media item per post
5. Direct video URLs are used

### Key Fields

- `platformPostId`: `aweme_id`
- `embedUrl`: Direct video URL
- `originalUrl`: Constructed TikTok URL
- `metrics`: Complete set (views, likes, comments, shares)

### Implementation Details

```typescript
// TikTok post transformation (discovery-content.tsx:421-443)
const tiktokItem = item as TikTokVideoData;
return {
  id: tiktokItem.aweme_id || `tiktok-${index}`,
  embedUrl:
    tiktokItem.video?.play_addr?.url_list?.[0] ||
    tiktokItem.video?.download_addr?.url_list?.[0] ||
    "",
  caption: tiktokItem.desc || "No caption available",
  metrics: {
    views: tiktokItem.statistics?.play_count || 0,
    likes: tiktokItem.statistics?.digg_count || 0,
    comments: tiktokItem.statistics?.comment_count || 0,
    shares: tiktokItem.statistics?.share_count || 0,
  },
  datePosted: new Date(tiktokItem.create_time * 1000).toISOString(),
  platform: "tiktok" as const,
  tiktokUrl: `https://www.tiktok.com/@${handle}/video/${tiktokItem.aweme_id}`,
};
```

## Instagram Saving Functionality

### Data Flow

1. Instagram posts are scraped and transformed via `/lib/transformers`
2. `originalUrl` should be constructed as: `https://www.instagram.com/p/${shortcode}/`
3. Supports carousel posts with multiple media items
4. Uses proxy URLs for serving content
5. Metrics may exclude `shares` (Instagram API limitation)

### Key Fields

- `platformPostId`: Instagram post ID
- `embedUrl`: Direct media URL or video URL
- `originalUrl`: Instagram post URL using shortcode
- `shortcode`: Instagram shortcode for URL construction
- `isCarousel`: Multi-media post indicator
- `carouselMedia`: Array of media items

### Implementation Details

```typescript
// Instagram post transformation (discovery-content.tsx:370-412)
const { transformers } = await import("@/lib/transformers");
const transformedPosts = transformers.instagram.postsToAppFormat(
  result.data,
  handle
);

// Convert to Post interface format
const newPosts: Post[] = transformedPosts.map((post: Post) => ({
  id: post.id,
  embedUrl: post.embedUrl,
  caption: post.caption || "",
  thumbnail: post.thumbnail,
  metrics: {
    ...(post.metrics?.views !== undefined && {
      views: post.metrics.views,
    }),
    likes: post.metrics?.likes || 0,
    comments: post.metrics?.comments || 0,
    ...(post.metrics?.shares !== undefined && {
      shares: post.metrics.shares,
    }),
  },
  datePosted: post.datePosted,
  platform: post.platform,
  // Instagram-specific properties
  isVideo: post.isVideo || false,
  isCarousel: post.isCarousel || false,
  carouselMedia: post.carouselMedia || [],
  carouselCount: post.carouselCount || 0,
}));
```

## Critical Gaps Found in Instagram Saving

### 1. Type Definition Mismatch

**Issue**: The `SavePostData` interface in `discovery-content.tsx` is missing the `originalUrl` field, but the `handleSavePost` function tries to set it.

```typescript
// discovery-content.tsx:192-211 - SavePostData interface MISSING originalUrl
interface SavePostData {
  id: string;
  platformPostId: string;
  platform: "instagram" | "tiktok";
  embedUrl: string;
  caption?: string;
  // ❌ Missing: originalUrl?: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  handle: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
}

// But handleSavePost tries to set it (lines 977-979):
originalUrl: post.platform === "instagram"
  ? `https://www.instagram.com/p/${post.shortcode}/`
  : post.tiktokUrl,
```

**Actions File Interface** (correctly includes `originalUrl`):

```typescript
// actions/posts.ts:11-30
interface SavePostData {
  handle: string;
  platform: "instagram" | "tiktok";
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
  platformPostId: string;
  embedUrl: string;
  caption?: string;
  originalUrl?: string; // ✅ Present in actions file
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  datePosted: string;
}
```

### 2. Missing Shortcode Handling

**Issue**: The `shortcode` field (required for Instagram URL construction) may not be consistently available.

```typescript
// This could fail if shortcode is undefined
originalUrl: post.platform === "instagram"
  ? `https://www.instagram.com/p/${post.shortcode}/`  // ❌ shortcode might be undefined
  : post.tiktokUrl,
```

**Root Cause**: The `shortcode` field is not consistently populated during Instagram post transformation.

### 3. Instagram-Specific Fields Not Preserved

**Issue**: Instagram posts have rich metadata that's lost during saving process.

**Missing Fields**:

- `isCarousel`: Whether post has multiple media items
- `carouselCount`: Number of media items
- `isVideo`: Video vs image detection
- `carouselMedia`: Array of media items

**Current Post Interface**:

```typescript
// discovery-content.tsx:102-121
interface Post {
  id: string;
  embedUrl: string;
  caption: string;
  thumbnail: string;
  metrics: { views?; likes; comments; shares? };
  datePosted: string;
  platform: "instagram" | "tiktok";
  tiktokUrl?: string;
  shortcode?: string; // ✅ Instagram-specific
  isVideo?: boolean; // ✅ Instagram-specific
  isCarousel?: boolean; // ✅ Instagram-specific
  carouselMedia?: CarouselMediaItem[];
  carouselCount?: number;
}
```

### 4. Inconsistent Metrics Handling

**Issue**: Instagram posts may not have `shares` data, but the code doesn't handle this gracefully.

```typescript
// This could be undefined for Instagram
shares: post.metrics?.shares,
```

**Impact**: Could lead to inconsistent metrics storage and display.

## Recommendations

### 1. Fix SavePostData Interface Mismatch

```typescript
// Update discovery-content.tsx SavePostData interface
interface SavePostData {
  id: string;
  platformPostId: string;
  platform: "instagram" | "tiktok";
  embedUrl: string;
  caption?: string;
  originalUrl?: string; // ✅ Add this field
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  handle: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
  // Instagram-specific fields
  isCarousel?: boolean; // ✅ Add this field
  carouselCount?: number; // ✅ Add this field
  isVideo?: boolean; // ✅ Add this field
}
```

### 2. Add Shortcode Fallback

```typescript
// In handleSavePost function
originalUrl: post.platform === "instagram"
  ? `https://www.instagram.com/p/${post.shortcode || post.id}/`
  : post.tiktokUrl,
```

### 3. Enhance Database Schema

Consider adding Instagram-specific fields to the posts table:

```sql
-- Add columns to posts table
ALTER TABLE posts
ADD COLUMN shortcode TEXT,
ADD COLUMN is_carousel BOOLEAN DEFAULT FALSE,
ADD COLUMN carousel_count INTEGER DEFAULT 0,
ADD COLUMN is_video BOOLEAN DEFAULT FALSE;
```

### 4. Update SavePostData Creation

```typescript
// In handleSavePost function
const savePostData: SavePostData = {
  id: post.id,
  platformPostId: post.id,
  platform: post.platform,
  embedUrl: post.embedUrl,
  caption: post.caption,
  originalUrl:
    post.platform === "instagram"
      ? `https://www.instagram.com/p/${post.shortcode || post.id}/`
      : post.tiktokUrl,
  metrics: {
    views: post.metrics?.views,
    likes: post.metrics?.likes || 0,
    comments: post.metrics?.comments || 0,
    shares: post.metrics?.shares,
  },
  datePosted: post.datePosted,
  handle: searchResults?.handle || "",
  displayName: searchResults?.displayName,
  bio: searchResults?.bio,
  followers: searchResults?.followers,
  avatarUrl: searchResults?.avatarUrl,
  verified: searchResults?.verified,
  // Instagram-specific fields
  isCarousel: post.isCarousel,
  carouselCount: post.carouselCount,
  isVideo: post.isVideo,
};
```

### 5. Improve Error Handling

```typescript
// Add validation for Instagram shortcode
if (post.platform === "instagram" && !post.shortcode) {
  console.warn(`Instagram post ${post.id} missing shortcode, using post ID`);
}
```

## Impact Assessment

### High Priority Issues

1. **Type Definition Mismatch**: Causes TypeScript compilation issues
2. **Missing Shortcode**: Breaks Instagram URL construction

### Medium Priority Issues

3. **Lost Metadata**: Reduces functionality for Instagram carousel posts
4. **Inconsistent Metrics**: May cause display issues

### Low Priority Issues

5. **Error Handling**: Could improve user experience

## Files Affected

- `/src/components/discovery/discovery-content.tsx` - Main discovery component
- `/src/app/actions/posts.ts` - Server actions for saving posts
- `/src/components/shared/save-post-modal.tsx` - Save post modal component
- `/src/lib/transformers/index.ts` - Instagram post transformation
- `/src/types/database.ts` - Database type definitions

## Conclusion

The main issue is that Instagram posts have more complex structure (carousel support, video detection, shortcodes) but the saving process doesn't consistently handle the `shortcode` field needed for proper URL construction. Additionally, the type definitions are mismatched between the component and server action files.

Fixing these issues will ensure Instagram posts are saved with complete metadata and proper URL construction, matching the functionality available for TikTok posts.
