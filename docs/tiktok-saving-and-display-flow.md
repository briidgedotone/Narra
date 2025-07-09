# TikTok Saving and Display Flow

## Overview

This document explains how TikTok content saving and displaying works in the Narra application, from discovery to final display as interactive embeds.

## What We Save in the Database for TikTok Posts

When you save a TikTok post, here's what goes into the database:

### 1. Profile Information (in `profiles` table)

- `handle`: The TikTok username (e.g., "mrbeats")
- `platform`: "tiktok"
- `display_name`: The creator's display name
- `bio`: Their bio text
- `followers_count`: Number of followers
- `avatar_url`: Profile picture URL
- `verified`: Whether they're verified

### 2. Post Information (in `posts` table)

- `platform_post_id`: The unique TikTok video ID (`aweme_id`)
- `platform`: "tiktok"
- `embed_url`: The direct video URL from TikTok
- `caption`: The video's caption/description
- `original_url`: The full TikTok URL (e.g., `https://www.tiktok.com/@username/video/123456`)
- `metrics`: JSON object with views, likes, comments, shares
- `date_posted`: When the video was originally posted
- `transcript`: Video transcript (if available)

### 3. Board Connection (in `board_posts` table)

- `board_id`: Which board the post was saved to
- `post_id`: Reference to the post
- `added_at`: When user saved it

## How the Flow Works

### Step 1: Discovery & Saving

1. User searches for TikTok creator
2. App fetches TikTok videos using scraping API
3. User clicks "Save" on a video
4. App saves the profile (if new), post data, and board connection

### Step 2: Displaying Saved Posts

When showing saved posts, the app:

1. **Queries the database** to get saved posts:

   ```sql
   SELECT posts.*, profiles.*
   FROM board_posts
   JOIN posts ON board_posts.post_id = posts.id
   JOIN profiles ON posts.profile_id = profiles.id
   ```

2. **For TikTok posts specifically**, there are two display modes:

   **Mode A: Thumbnail View** (Discovery page)

   - Shows a static thumbnail image
   - Displays metrics (views, likes, comments)
   - Shows TikTok logo overlay

   **Mode B: Live Embed** (Board/Following pages)

   - Uses TikTok's official embed API
   - Shows the actual interactive TikTok video
   - Fetches embed HTML using `/api/test-tiktok-embed`

### Step 3: TikTok Embed Process

For live embeds, the app:

1. Takes the saved `original_url` (like `https://www.tiktok.com/@user/video/123`)
2. Calls TikTok's oEmbed API to get embed HTML
3. Displays the interactive TikTok video player

## Technical Implementation Details

### Database Schema

```sql
-- Profile storage
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  followers_count INTEGER,
  avatar_url TEXT,
  verified BOOLEAN
);

-- Post storage
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  platform TEXT NOT NULL,
  platform_post_id TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  caption TEXT,
  original_url TEXT,
  metrics JSONB,
  date_posted TIMESTAMPTZ,
  transcript TEXT
);

-- Board connections
CREATE TABLE board_posts (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id),
  post_id UUID REFERENCES posts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TikTok Data Transformation

```typescript
// From TikTok API response to our Post format
const tiktokPost = {
  id: tiktokItem.aweme_id,
  embedUrl: tiktokItem.video?.play_addr?.url_list?.[0],
  caption: tiktokItem.desc,
  metrics: {
    views: tiktokItem.statistics?.play_count || 0,
    likes: tiktokItem.statistics?.digg_count || 0,
    comments: tiktokItem.statistics?.comment_count || 0,
    shares: tiktokItem.statistics?.share_count || 0,
  },
  datePosted: new Date(tiktokItem.create_time * 1000).toISOString(),
  platform: "tiktok",
  tiktokUrl: `https://www.tiktok.com/@${handle}/video/${tiktokItem.aweme_id}`,
};
```

### Display Logic

```typescript
// PostCard component logic
const shouldUseTikTokIframe =
  post.platform === "tiktok" &&
  (context === "board" || context === "following");

// TikTok embed fetch
useEffect(() => {
  if (shouldUseTikTokIframe && tiktokUrl) {
    fetch("/api/test-tiktok-embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tiktokUrl }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.html) {
          setTiktokEmbed(data.data.html);
        }
      });
  }
}, [shouldUseTikTokIframe, tiktokUrl]);
```

## Key Features

### Two Display Modes

**Thumbnail Mode (Discovery Context)**

- **Purpose**: Fast loading for grid views
- **Shows**: Static thumbnail, metrics, TikTok logo
- **Benefits**: Quick browsing, responsive design
- **Used in**: Discovery page, search results

**Live Embed Mode (Board/Following Context)**

- **Purpose**: Full interactive experience
- **Shows**: Actual playable TikTok video
- **Benefits**: Native TikTok experience, sound, controls
- **Used in**: Board pages, following feed, saved posts

### Database Efficiency Features

1. **Profile Deduplication**: One profile record per creator across all posts
2. **Many-to-Many Relationships**: One post can be saved to multiple boards
3. **JSON Metrics Storage**: Flexible metrics without schema changes
4. **Proper Indexing**: Fast queries on platform, handle, date_posted

### URL Construction Logic

```typescript
// Original URL construction for TikTok embeds
const originalUrl = `https://www.tiktok.com/@${handle}/video/${aweme_id}`;

// Fallback logic for backward compatibility
const tiktokUrl =
  post.originalUrl ||
  (post.platform === "tiktok" && post.platformPostId && post.profile?.handle
    ? `https://www.tiktok.com/@${post.profile.handle}/video/${post.platformPostId}`
    : null);
```

## API Endpoints

### `/api/test-scrapecreators`

- **Purpose**: Fetch TikTok creator data and posts
- **Input**: `handle`, `platform`, optional `count` and `cursor`
- **Output**: Creator profile and video list

### `/api/test-tiktok-embed`

- **Purpose**: Generate TikTok embed HTML
- **Input**: TikTok URL
- **Output**: oEmbed HTML for interactive player

### Database Service Methods

```typescript
// Save post workflow
async savePostToBoard(postData: SavePostData, boardId: string) {
  // 1. Ensure profile exists
  let profile = await db.getProfileByHandle(handle, platform);
  if (!profile) {
    profile = await db.createProfile(profileData);
  }

  // 2. Ensure post exists
  let post = await db.getPostByPlatformId(platformPostId, platform);
  if (!post) {
    post = await db.createPost(postData);
  }

  // 3. Link post to board
  await db.addPostToBoard(boardId, post.id);
}

// Retrieve saved posts
async getPostsInBoard(boardId: string) {
  return await db.query(`
    SELECT posts.*, profiles.*
    FROM board_posts
    JOIN posts ON board_posts.post_id = posts.id
    JOIN profiles ON posts.profile_id = profiles.id
    WHERE board_posts.board_id = $1
    ORDER BY board_posts.added_at DESC
  `);
}
```

## Why This Approach Works

### 1. **Complete Data Preservation**

- Saves all essential metadata for future display
- Preserves metrics at time of saving
- Maintains creator context

### 2. **Flexible Display Options**

- Can switch between thumbnail and embed modes
- Supports different UI contexts
- Graceful fallbacks for failed embeds

### 3. **Performance Optimization**

- Lazy loading of embed HTML
- Efficient database queries
- Proper caching strategies

### 4. **User Experience**

- **Discovery**: Fast browsing with thumbnails
- **Viewing**: Full interactive TikTok experience
- **Organization**: Posts organized in boards/folders

## Error Handling

### TikTok Embed Failures

```typescript
// Fallback display when embed fails
{embedError ? (
  <div className="bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500 text-white">
    <TikTok className="w-16 h-16 mb-3" />
    <p className="text-lg font-bold">TikTok</p>
    <p className="text-sm opacity-90">@{post.profile?.handle}</p>
    <p className="text-xs opacity-70 mt-2">Failed to load</p>
  </div>
) : null}
```

### Database Constraints

- Unique constraints prevent duplicate posts in same board
- Foreign key constraints ensure data integrity
- Graceful handling of duplicate save attempts

## Future Enhancements

### Potential Improvements

1. **Thumbnail Storage**: Save thumbnails to avoid external dependencies
2. **Offline Viewing**: Cache embed HTML for offline access
3. **Analytics**: Track view counts and engagement
4. **Batch Operations**: Save multiple posts at once

### Scalability Considerations

- **CDN Integration**: For thumbnail and video caching
- **Database Sharding**: For large user bases
- **API Rate Limiting**: To handle TikTok API limits
- **Background Jobs**: For metadata updates

## Conclusion

The TikTok saving and display system provides a complete solution for content curation:

1. **Efficient Storage**: Normalized database schema with proper relationships
2. **Rich Experience**: Full interactive TikTok embeds when appropriate
3. **Fast Browsing**: Thumbnail mode for quick discovery
4. **Reliable Fallbacks**: Graceful degradation when embeds fail

This architecture ensures users get the full TikTok experience when viewing their saved content, while maintaining good performance and data integrity throughout the application.
