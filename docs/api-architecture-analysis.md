# API Architecture Analysis - Narra Application

## Overview

The Narra application follows a modern Next.js architecture with a clear separation between API routes, server actions, and external API integrations. The API layer demonstrates good practices in error handling, caching, authentication, and data transformation.

## Architecture Components

### 1. API Routes (app/api directory)

The application implements several API route endpoints:

#### Discovery API (`/api/discovery`)

- **Purpose**: Fetches social media profiles from TikTok and Instagram
- **Method**: GET
- **Parameters**:
  - `handle`: Username to search (required)
  - `platform`: Either "tiktok" or "instagram" (default: "tiktok")
- **Features**:
  - Input validation and sanitization (removes @ and whitespace)
  - Platform-specific data fetching using ScrapeCreators API
  - Data transformation using dedicated transformers
  - Performance tracking (duration logging)
  - Standardized response format with success/error states
  - Cache support with cached flag in response

#### Image Proxy Routes (`/api/image-proxy` and `/api/proxy-image`)

Two similar implementations for proxying images from social media platforms:

**Features**:

- CORS bypass for Instagram and TikTok images
- Platform-specific headers (Referer, User-Agent, etc.)
- URL decoding and validation
- Cache-Control headers (1 hour to 1 day)
- Error handling with detailed logging
- Support for various content types

**Security considerations**:

- Validates URLs before proxying
- Sets appropriate security headers
- Handles timeouts gracefully

#### Upload Featured Image (`/api/upload-featured-image`)

- **Purpose**: Admin-only endpoint for uploading featured images
- **Authentication**: Requires Clerk auth and admin role
- **Method**: POST (multipart/form-data)
- **Validation**:
  - File type must be image/\*
  - File size limit: 5MB
  - Admin role verification
- **Returns**: Base64 data URL of uploaded image

#### Test Endpoints

Several test endpoints for development and debugging:

- `/api/test-cache`: Tests caching functionality
- `/api/test-discovery`: Tests discovery API
- `/api/test-tiktok-embed`: Tests TikTok embed generation
- `/api/test-scrapecreators`: Tests external API connection
- `/api/test-transcript`: Tests video transcript fetching

### 2. Server Actions (app/actions directory)

Server actions provide a secure way to handle data mutations:

#### Posts Actions (`posts.ts`)

- `savePostToBoard`: Saves social media posts to boards
  - Creates profile if doesn't exist
  - Creates post if doesn't exist
  - Handles duplicate posts gracefully
  - Revalidates multiple paths after success
- `removePostFromBoard`: Removes posts from boards
- `getPostsInBoard`: Fetches paginated posts
- `getAllUserSavedPosts`: Aggregates posts across all user boards
- `getPublicBoardPosts`: Fetches posts for shared boards

#### Discovery Actions (`discovery.ts`)

- `createAndFollowProfile`: Creates/updates profile and follows it
- `unfollowProfileByHandle`: Unfollows a profile
- `checkFollowStatus`: Checks if user follows a profile

#### User Sync (`user-sync.ts`)

- `syncCurrentUserToDatabase`: Syncs Clerk user to database
- Returns user role and subscription status

#### Common Patterns in Server Actions:

- Authentication check using Clerk's `auth()`
- Try-catch error handling with detailed error messages
- Path revalidation after mutations
- Standardized response format: `{ success: boolean, data?: any, error?: string }`

### 3. API Utilities (lib/api directory)

#### ScrapeCreators API Client (`scrape-creators.ts`)

Comprehensive wrapper for the ScrapeCreators external API:

**Features**:

- Centralized API configuration
- Request timeout handling (30 seconds)
- Response validation and JSON parsing
- Built-in caching with Redis/Memory cache
- Platform-specific methods for TikTok and Instagram
- Data transformers for standardizing responses

**API Methods**:

- TikTok: `getProfile`, `getProfileVideos`, `getVideoTranscript`
- Instagram: `getProfile`, `getPosts` (with pagination support)

**Error Handling**:

- Network timeouts
- Invalid JSON responses
- API errors
- Missing API key validation

#### TikTok Embed Utilities (`tiktok-embed.ts`)

Handles TikTok video embedding:

**Methods**:

- `getTikTokOEmbed`: Uses official oEmbed API (currently bypassed due to reliability)
- `generateTikTokIframe`: Creates iframe embeds directly
- `getTikTokEmbed`: Main method using iframe approach
- URL validation and normalization utilities
- Video ID and username extraction

**Security**:

- URL validation before processing
- Sandbox attributes on iframes
- Basic HTML sanitization

### 4. External API Integration

#### ScrapeCreators API

- Base URL: `https://api.scrapecreators.com`
- Authentication: API key in headers
- Endpoints used:
  - `/v1/tiktok/profile`
  - `/v3/tiktok/profile/videos`
  - `/v1/tiktok/video/transcript`
  - `/v1/instagram/profile`
  - `/v2/instagram/user/posts`

#### TikTok oEmbed API

- URL: `https://www.tiktok.com/oembed`
- Currently bypassed in favor of direct iframe embedding due to reliability issues

### 5. Caching Strategy

#### Redis/Memory Cache Implementation

- Fallback to in-memory cache for development
- Key-based caching with TTL support
- Cache keys follow pattern: `platform:resource:identifier`

#### Cache TTLs:

- Profiles: 5 minutes
- Posts: 3 minutes
- Search results: 2 minutes
- Transcripts: 5 minutes

#### Cache Key Generation:

- Profiles: `tiktok:profile:${handle}`
- Videos: `tiktok:videos:${handle}:${count}`
- Transcripts: Uses URL hash for uniqueness
- Instagram similar patterns

### 6. Authentication & Authorization

#### Middleware (`middleware.ts`)

- Uses Clerk for authentication
- Public routes whitelist (home, auth, shared boards, image proxy)
- Admin route protection with role check
- Automatic protection for non-public routes

#### Protected Routes:

- All `/admin/*` routes require admin role
- API routes check authentication in handlers
- Server actions verify `userId` from Clerk

### 7. Error Handling Patterns

#### Consistent Error Response Format:

```typescript
{
  success: false,
  error: string,
  details?: string,
  duration?: string
}
```

#### Error Types Handled:

- Authentication errors (401, 403)
- Validation errors (400)
- Not found errors (404)
- Server errors (500)
- Timeout errors
- Network errors
- JSON parsing errors

#### Error Logging:

- Console.error for debugging
- Error details in response for client
- Stack traces only in development

### 8. Response Standardization

#### Success Response Format:

```typescript
{
  success: true,
  data: any,
  cached?: boolean,
  duration?: string,
  message?: string
}
```

#### Features:

- Consistent structure across all endpoints
- Performance metrics (duration)
- Cache status indication
- Optional message for additional context

### 9. Rate Limiting & Protection

#### Current Implementation:

- No explicit rate limiting middleware
- Protection through caching (reduces API calls)
- Authentication required for most endpoints
- Public endpoints have built-in caching

#### Recommendations for Enhancement:

- Implement rate limiting middleware
- Add request throttling for public endpoints
- Monitor API usage per user
- Implement API quotas for different user tiers

### 10. API Versioning

#### Current State:

- No explicit API versioning in internal routes
- External APIs use versioned endpoints (/v1/, /v2/, /v3/)
- No version negotiation headers

#### Observed Patterns:

- ScrapeCreators API uses path-based versioning
- Different versions for different resources (v1 for profiles, v2/v3 for posts)

## Security Considerations

### Strengths:

1. Authentication on all sensitive endpoints
2. Input validation and sanitization
3. CORS headers on public endpoints
4. Secure image proxying with validation
5. Admin role verification for privileged operations
6. No direct database access from API routes

### Areas for Improvement:

1. Add rate limiting to prevent abuse
2. Implement request signing for internal APIs
3. Add API key management for external clients
4. Enhance input validation with schemas (Zod)
5. Add request/response logging for audit trails

## Performance Optimizations

### Current Optimizations:

1. Aggressive caching for external API calls
2. Path revalidation instead of full page reloads
3. Efficient data transformation
4. Timeout handling to prevent hanging requests
5. Pagination support for large datasets

### Potential Improvements:

1. Implement Redis for production caching
2. Add request batching for bulk operations
3. Implement partial response fields
4. Add compression for API responses
5. Consider implementing GraphQL for flexible queries

## Best Practices Observed

1. **Separation of Concerns**: Clear separation between routes, actions, and utilities
2. **Error Handling**: Consistent error handling across all endpoints
3. **Type Safety**: TypeScript used throughout (could be enhanced)
4. **Caching**: Smart caching strategy for expensive operations
5. **Security**: Authentication and authorization properly implemented
6. **Monitoring**: Duration tracking for performance monitoring
7. **Testing**: Dedicated test endpoints for development

## Recommendations

1. **API Documentation**: Implement OpenAPI/Swagger documentation
2. **Rate Limiting**: Add rate limiting middleware (e.g., express-rate-limit)
3. **Validation**: Enhance with schema validation (Zod or Yup)
4. **Monitoring**: Add APM tools for production monitoring
5. **Versioning**: Implement API versioning strategy
6. **Error Tracking**: Integrate error tracking service (Sentry)
7. **Logging**: Implement structured logging
8. **Testing**: Add comprehensive API tests
9. **WebSockets**: Consider real-time updates for social media data
10. **Queue System**: Implement job queues for heavy operations

## Conclusion

The Narra application demonstrates a well-structured API architecture with good separation of concerns, consistent patterns, and security considerations. The use of Next.js 13+ app directory features like server actions provides a modern approach to API development. While there are areas for enhancement, particularly around rate limiting and API documentation, the current implementation provides a solid foundation for a social media aggregation platform.
