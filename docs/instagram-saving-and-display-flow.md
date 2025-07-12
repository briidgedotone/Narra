# Instagram Saving and Display Flow

## Overview

This document explains how Instagram content saving and displaying works in the Narra application. Unlike TikTok which uses iframe embeds, Instagram posts use a proxy system with direct image/video URLs and carousel support.

## What We Save in the Database for Instagram Posts

When you save an Instagram post, here's what goes into the database:

### 1. Profile Information (in `profiles` table)

- `handle`: The Instagram username (e.g., "cristiano")
- `platform`: "instagram"
- `display_name`: The creator's display name
- `bio`: Their bio text
- `followers_count`: Number of followers
- `avatar_url`: Profile picture URL
- `verified`: Whether they're verified

### 2. Post Information (in `posts` table)

- `platform_post_id`: The Instagram post ID
- `platform`: "instagram"
- `embed_url`: The direct image or video URL from Instagram
- `caption`: The post's caption/description
- `original_url`: The Instagram post URL (e.g., `https://www.instagram.com/p/ABC123/`)
- `metrics`: JSON object with likes, comments, views (if available)
- `date_posted`: When the post was originally published

### 3. Instagram-Specific Data (stored in JSON)

- `isCarousel`: Whether it's a multi-image/video post
- `carouselMedia`: Array of all images/videos in the carousel
- `carouselCount`: Number of items in the carousel
- `isVideo`: Whether the main content is a video

### 4. Board Connection (in `board_posts` table)

- `board_id`: Which board the post was saved to
- `post_id`: Reference to the post
- `added_at`: When user saved it

## How Instagram Display Works (Different from TikTok)

### Key Difference: No Iframe Embeds

Unlike TikTok, Instagram posts are **never** displayed as iframe embeds. Instead, they use:

1. **Thumbnail images** for grid views
2. **Direct video URLs** for video playback
3. **Carousel navigation** for multi-image posts

### Instagram Display Process

#### Step 1: Image Proxy System

Instagram blocks direct image loading, so we use a proxy:

- User's browser → Our proxy (`/api/image-proxy`) → Instagram → Back to user
- The proxy adds Instagram-specific headers to make requests work
- This allows us to display Instagram images without CORS issues

#### Step 2: Carousel Handling

For Instagram posts with multiple images/videos:

- Shows navigation arrows (left/right)
- Displays dot indicators at the bottom
- Smooth sliding animation between images
- Each carousel item can be either image or video

#### Step 3: Video Playback

For Instagram videos:

- Uses direct video URLs (not embeds)
- Shows play button overlay
- Auto-plays on hover in grid view
- Full controls in modal view

## The Complete Flow

### Discovery & Saving Flow

1. User searches for Instagram creator
2. App fetches Instagram posts using scraping API
3. App transforms complex Instagram data into our format
4. User clicks "Save" on a post
5. App saves profile, post data, and carousel information

### Display Flow

1. **Load saved posts** from database with all metadata
2. **Check if carousel**: If `isCarousel` is true, prepare carousel navigation
3. **Proxy images**: All Instagram images go through our proxy system
4. **Handle videos**: Direct video URLs for smooth playback
5. **Show carousel controls**: If multiple items, show arrows and dots

## Technical Implementation Details

### Database Schema for Instagram Posts

```sql
-- Instagram post storage includes carousel metadata
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  platform TEXT NOT NULL, -- 'instagram'
  platform_post_id TEXT NOT NULL,
  embed_url TEXT NOT NULL, -- Direct image/video URL
  caption TEXT,
  original_url TEXT, -- Instagram post URL
  metrics JSONB, -- {likes, comments, views}
  date_posted TIMESTAMPTZ,
  -- Instagram-specific fields stored in JSON
  is_carousel BOOLEAN DEFAULT FALSE,
  carousel_count INTEGER DEFAULT 0,
  is_video BOOLEAN DEFAULT FALSE
);
```

### Instagram Data Transformation

```typescript
// From Instagram API response to our Post format
const transformInstagramPost = (apiPost: InstagramAPIPost) => {
  return {
    id: apiPost.id,
    embedUrl: apiPost.video_url || apiPost.display_url,
    caption: apiPost.caption?.text || "",
    originalUrl: `https://www.instagram.com/p/${apiPost.shortcode}/`,
    metrics: {
      likes: apiPost.like_count || 0,
      comments: apiPost.comment_count || 0,
      views: apiPost.view_count || apiPost.play_count, // Optional
    },
    datePosted: new Date(apiPost.taken_at_timestamp * 1000).toISOString(),
    platform: "instagram",
    // Instagram-specific fields
    isCarousel: apiPost.media_type === 8,
    carouselMedia: apiPost.carousel_media?.map(item => ({
      id: item.id,
      type: item.media_type === 2 ? "video" : "image",
      url: item.video_url || item.display_url,
      thumbnail: item.display_url,
      isVideo: item.media_type === 2,
    })),
    carouselCount: apiPost.carousel_media?.length || 0,
    isVideo: apiPost.media_type === 2,
  };
};
```

### Image Proxy System

```typescript
// Proxy route with Instagram-specific headers
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; InstagramBot/1.0)",
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
    Accept: "image/*,*/*;q=0.8",
  };

  const response = await fetch(url, { headers });
  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type"),
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
```

### Carousel Navigation Logic

```typescript
// PostCard component carousel handling
const PostCard = ({ post }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCarouselNext = () => {
    if (post.carouselMedia && currentIndex < post.carouselMedia.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleCarouselPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="relative">
      {/* Carousel media display */}
      {post.isCarousel && post.carouselMedia && (
        <div
          className="flex transition-transform duration-300"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {post.carouselMedia.map((media, index) => (
            <div key={media.id} className="w-full flex-shrink-0">
              {media.isVideo ? (
                <video
                  src={`/api/proxy-image?url=${encodeURIComponent(media.url)}`}
                  poster={`/api/proxy-image?url=${encodeURIComponent(media.thumbnail)}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`/api/proxy-image?url=${encodeURIComponent(media.url)}`}
                  alt="Instagram post"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {post.carouselMedia && post.carouselMedia.length > 1 && (
        <>
          <button onClick={handleCarouselPrev} className="absolute left-2 top-1/2">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleCarouselNext} className="absolute right-2 top-1/2">
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
        {post.carouselMedia?.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
```

## Instagram vs TikTok Display Differences

| Feature              | Instagram                                    | TikTok                       |
| -------------------- | -------------------------------------------- | ---------------------------- |
| **Embed Type**       | Thumbnail + Direct URLs                      | Iframe embeds (in boards)    |
| **Aspect Ratio**     | 2:3 (more square)                            | 9:16 (vertical)              |
| **Carousel**         | ✅ Full carousel support                     | ❌ Single video only         |
| **Image Proxy**      | ✅ Required (Instagram blocks direct access) | ✅ Basic proxy               |
| **Metrics**          | Likes, Comments, Views (optional)            | All metrics including shares |
| **Video Playback**   | Direct video URLs                            | Embedded TikTok player       |
| **Transcript**       | ❌ Not available                             | ✅ Available                 |
| **Shares Data**      | ❌ Not provided by API                       | ✅ Available                 |
| **URL Construction** | Uses shortcode: `/p/{shortcode}/`            | Uses handle + video ID       |

## API Endpoints

### `/api/test-scrapecreators` (Instagram)

- **Purpose**: Fetch Instagram creator data and posts
- **Input**: `handle`, `platform=instagram`, optional `count` and `next_max_id`
- **Output**: Creator profile and post list with carousel data

### `/api/image-proxy` & `/api/proxy-image`

- **Purpose**: Proxy Instagram images with proper headers
- **Input**: Instagram image/video URL
- **Output**: Proxied media with CORS headers

## Key Features

### 1. Carousel Support

- **Detection**: `media_type === 8` indicates carousel post
- **Navigation**: Arrow buttons and dot indicators
- **Smooth Transitions**: CSS transforms for sliding effect
- **Mixed Media**: Each carousel item can be image or video

### 2. Image Proxy System

- **Instagram Headers**: Proper referer and user-agent
- **CORS Handling**: Bypasses Instagram's restrictions
- **Caching**: Long-term caching for performance
- **Error Handling**: Graceful fallbacks for failed images

### 3. Video Handling

- **Direct URLs**: No iframe embeds like TikTok
- **Poster Images**: Thumbnail for video preview
- **Controls**: Native video controls in modal view
- **Auto-play**: Hover effects in grid view

### 4. Responsive Design

- **Grid Layout**: Optimized for Instagram's square-ish aspect ratio
- **Modal View**: Full-screen carousel experience
- **Touch Support**: Swipe gestures for mobile carousel

## Database Queries

### Save Instagram Post

```sql
-- 1. Create or get profile
INSERT INTO profiles (handle, platform, display_name, bio, followers_count, avatar_url, verified)
VALUES ($1, 'instagram', $2, $3, $4, $5, $6)
ON CONFLICT (handle, platform) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  followers_count = EXCLUDED.followers_count,
  avatar_url = EXCLUDED.avatar_url,
  verified = EXCLUDED.verified;

-- 2. Create or get post
INSERT INTO posts (profile_id, platform, platform_post_id, embed_url, caption, original_url, metrics, date_posted)
VALUES ($1, 'instagram', $2, $3, $4, $5, $6, $7)
ON CONFLICT (platform_post_id, platform) DO NOTHING;

-- 3. Link to board
INSERT INTO board_posts (board_id, post_id)
VALUES ($1, $2)
ON CONFLICT (board_id, post_id) DO NOTHING;
```

### Retrieve Instagram Posts

```sql
SELECT
  posts.id,
  posts.embed_url,
  posts.caption,
  posts.original_url,
  posts.metrics,
  posts.date_posted,
  profiles.handle,
  profiles.display_name,
  profiles.avatar_url
FROM board_posts
JOIN posts ON board_posts.post_id = posts.id
JOIN profiles ON posts.profile_id = profiles.id
WHERE posts.platform = 'instagram' AND board_posts.board_id = $1
ORDER BY board_posts.added_at DESC;
```

## Error Handling

### Image Loading Failures

```typescript
// PostCard component error handling
<img
  src={proxiedImageUrl}
  onError={(e) => {
    // Hide broken image and show fallback
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }}
/>
<div className="hidden bg-gray-200 flex items-center justify-center">
  <p className="text-gray-500">Image could not be loaded</p>
</div>
```

### Carousel Navigation Bounds

```typescript
// Prevent navigation beyond bounds
const handleCarouselNext = () => {
  if (currentIndex < (post.carouselMedia?.length || 1) - 1) {
    setCurrentIndex(prev => prev + 1);
  }
};

const handleCarouselPrev = () => {
  if (currentIndex > 0) {
    setCurrentIndex(prev => prev - 1);
  }
};
```

## Performance Optimizations

### 1. Lazy Loading

- Images load only when visible
- Carousel items load progressively
- Efficient memory usage

### 2. Caching Strategy

- Proxy responses cached for 1 year
- Browser caching for repeated views
- CDN integration for global delivery

### 3. Image Optimization

- Responsive image sizes
- WebP format when supported
- Compression for faster loading

## Why This Approach Works for Instagram

### 1. Reliable Image Loading

- Instagram blocks direct image access
- Our proxy system solves this completely
- Images load consistently across all browsers

### 2. Rich Carousel Experience

- Users can browse through multiple images/videos
- Smooth animations and intuitive navigation
- Preserves the Instagram multi-media experience

### 3. Performance Optimized

- Direct video URLs for fast playback
- Lazy loading of carousel images
- Efficient caching of proxied images

### 4. No Instagram API Dependencies

- Works without Instagram's official API
- No embed restrictions or rate limits
- Full control over display and functionality

## Future Enhancements

### Potential Improvements

1. **Story Support**: Add Instagram Story saving and display
2. **Reel Integration**: Enhanced video handling for Instagram Reels
3. **IGTV Support**: Long-form video content
4. **Advanced Carousel**: Zoom, full-screen gallery view
5. **Image CDN**: Dedicated CDN for Instagram media

### Technical Considerations

- **Rate Limiting**: Handle Instagram's anti-bot measures
- **Image Storage**: Local storage for offline viewing
- **Metadata Enhancement**: Extract hashtags, mentions, location
- **Video Optimization**: Transcoding for better performance

## Conclusion

The Instagram saving and display system in Narra provides:

1. **Complete Visual Experience**: Full carousel support with smooth navigation
2. **Reliable Image Loading**: Proxy system bypasses Instagram restrictions
3. **Performance Optimized**: Direct URLs and efficient caching
4. **Rich Metadata**: Comprehensive post information storage
5. **Responsive Design**: Works perfectly across all devices

**Key Insight**: Instagram posts focus on visual content with carousels and high-quality images, requiring a sophisticated proxy system and carousel navigation, while maintaining excellent performance and user experience.

The system successfully preserves the Instagram experience within Narra's organizational structure, allowing users to curate and browse Instagram content seamlessly.

## Simple Language Summary

### What We Save for Instagram Posts

When you save an Instagram post, we save:

- **Creator Info**: Username, bio, followers, profile picture
- **Post Data**: The actual image/video URLs, caption, likes, comments
- **Special Instagram Stuff**: If it's a carousel (multiple photos), if it's a video
- **Board Link**: Which board you saved it to

### How Instagram Display Works (Simple Version)

**The Main Difference from TikTok:**

- **TikTok**: Shows the actual TikTok video player (like embedding a YouTube video)
- **Instagram**: Shows our own version using Instagram's images/videos

**Why We Need a Proxy:**

- Instagram doesn't let websites directly show their images
- Our server acts as a middleman: gets the image from Instagram and passes it to you
- This is why Instagram images always load through `/api/image-proxy`

**The Display Process:**

1. **Load from Database**: Get all the saved Instagram data
2. **Use Proxy for Images**: Every Instagram image goes through our proxy
3. **Show Carousel Controls**: If there are multiple photos, show arrows and dots
4. **Handle Videos**: Play Instagram videos directly (not embedded)

### Instagram's Special Features

**Carousel Posts** (Multiple Photos/Videos):

- Left/right arrows to navigate
- Dots at the bottom showing position
- Smooth sliding between images
- Each item can be photo or video

**Video Posts**:

- Show play button overlay
- Auto-play when you hover
- Full controls when opened

**Image Quality**:

- High-resolution images
- Proper caching for fast loading
- Fallback if image fails

### Why Instagram is More Complex Than TikTok

1. **No Official Embeds**: Can't just embed like YouTube/TikTok
2. **Image Restrictions**: Must proxy all images
3. **Carousel Support**: Handle multiple images per post
4. **Mixed Content**: Same post can have photos AND videos

### The User Experience

**What Users See:**

- Beautiful grid of Instagram posts
- Smooth carousel navigation
- High-quality images and videos
- All organized in their boards

**What Happens Behind the Scenes:**

- Proxy system fetches images
- Database stores all metadata
- Carousel state management
- Video playback handling

**End Result**: Users get the full Instagram experience - carousels, videos, high-quality images - all while keeping their content organized in boards, just like they saved it!
