# Supabase Project Complete Analysis

## Overview

This document provides a comprehensive analysis of how Supabase is configured and used in the Narra application, including database structure, authentication setup, security policies, and architectural decisions.

## Project Configuration

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cvkqgduefcvkeagfvvgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anonymous key for client-side]
SUPABASE_SERVICE_ROLE_KEY=[service role key for admin operations]
DATABASE_URL=[PostgreSQL connection string]
```

### Supabase Client Setup (`/src/lib/supabase.ts`)

```typescript
// Client for regular operations (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client for privileged operations (uses service role key)
export const createAdminClient = () => {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
```

## Database Schema

### Core Tables

1. **users** - Stores user accounts synced from Clerk

   - `id`: UUID (matches Clerk user ID)
   - `email`: User email
   - `role`: 'user' | 'admin'
   - `subscription_status`: Subscription state
   - `created_at`, `updated_at`: Timestamps

2. **profiles** - Social media creator profiles

   - `id`: UUID
   - `handle`: Username
   - `platform`: 'tiktok' | 'instagram'
   - `display_name`, `bio`: Profile info
   - `followers_count`, `avatar_url`, `verified`: Metadata
   - Unique constraint: (handle, platform)

3. **posts** - Social media posts

   - `id`: UUID
   - `profile_id`: References profiles
   - `platform`: 'tiktok' | 'instagram'
   - `platform_post_id`: Original post ID
   - `embed_url`: Direct media URL
   - `caption`, `transcript`: Content
   - `original_url`: Platform URL
   - `metrics`: JSONB (views, likes, comments, shares)
   - `date_posted`: Original post date

4. **folders** - User's organization folders

   - `id`: UUID
   - `user_id`: References users
   - `name`, `description`: Folder info
   - Unique constraint: (user_id, name)

5. **boards** - Content boards within folders

   - `id`: UUID
   - `folder_id`: References folders
   - `name`, `description`: Board info
   - `public_id`: For public sharing
   - `is_shared`: Boolean for public access
   - Unique constraint: (folder_id, name)

6. **board_posts** - Many-to-many posts in boards

   - `id`: UUID
   - `board_id`: References boards
   - `post_id`: References posts
   - `added_at`: When saved
   - Unique constraint: (board_id, post_id)

7. **follows** - User following relationships

   - `id`: UUID
   - `user_id`: References users
   - `profile_id`: References profiles
   - `created_at`: Follow date
   - `last_refresh`: Last content update
   - Unique constraint: (user_id, profile_id)

8. **subscriptions** - Stripe subscription data

   - `id`: UUID
   - `user_id`: References users
   - `stripe_customer_id`, `stripe_subscription_id`: Stripe IDs
   - `plan_id`, `status`: Subscription info
   - `current_period_start`, `current_period_end`: Billing period

9. **featured_boards** - Admin-curated boards

   - `board_id`: References boards
   - `display_order`: Sort order
   - `cover_image_url`: Optional cover image
   - Primary key: display_order

10. **followed_posts** - Cached posts from followed profiles
    - `id`: UUID
    - `user_id`: References users
    - `post_id`: References posts
    - `fetched_at`: Cache timestamp

### Database Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_profiles_platform_handle ON profiles(platform, handle);
CREATE INDEX idx_posts_profile_id ON posts(profile_id);
CREATE INDEX idx_posts_date_posted ON posts(date_posted DESC);
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_boards_folder_id ON boards(folder_id);
CREATE INDEX idx_boards_public_id ON boards(public_id) WHERE public_id IS NOT NULL;
CREATE INDEX idx_board_posts_board_id ON board_posts(board_id);
CREATE INDEX idx_board_posts_post_id ON board_posts(post_id);
CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_profile_id ON follows(profile_id);
```

### Triggers and Functions

1. **Auto-update timestamps**:

   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';
   ```

2. **Applied to tables**: users, posts, folders, boards, subscriptions

## Authentication Architecture

### Clerk Integration (Not Supabase Auth)

The project uses **Clerk** for authentication instead of Supabase Auth:

1. **User Flow**:

   - User signs up/in with Clerk
   - Clerk webhook or middleware syncs user to Supabase
   - User ID from Clerk is used as primary key in Supabase

2. **Sync Process** (`/src/lib/auth/sync.ts`):

   ```typescript
   export async function syncUserToDatabase(clerkUser: User) {
     const userData = {
       id: clerkUser.id,
       email: clerkUser.emailAddresses[0].emailAddress,
       role: "user", // or 'admin' based on metadata
       subscription_status: "inactive",
     };

     // Create or update user in Supabase
     await db.createUser(userData);
   }
   ```

3. **Authorization Flow**:
   - Clerk middleware protects routes
   - Server actions get userId from Clerk session
   - Database operations filter by userId

## Security Analysis

### Row Level Security (RLS) Status

**Critical Issue**: The project has inconsistent RLS implementation due to Clerk/Supabase Auth incompatibility.

#### Why RLS Fails

```sql
-- Traditional RLS policy expects Supabase Auth
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid()::text = user_id);

-- But auth.uid() returns NULL with Clerk authentication!
```

#### Current State

- **RLS Enabled but Broken**: 8 tables (users, profiles, posts, folders, boards, board_posts, follows, subscriptions)
- **RLS Disabled**: 1 table (followed_posts)
- **RLS Working**: 1 table (featured_boards - uses custom admin check)

#### Security Implementation

Instead of RLS, security is handled at the application layer:

```typescript
// Database service methods include userId checks
async getFoldersByUser(userId: string) {
  const { data, error } = await this.client
    .from("folders")
    .select("*")
    .eq("user_id", userId); // Application-level filtering

  return data;
}
```

### Security Vulnerabilities

1. **Direct Database Access**: If someone gets the anon key, they could bypass application security
2. **Inconsistent Protection**: Some tables have broken RLS, others don't
3. **No Database-Level Security**: Relies entirely on application code

### Recommended Fixes

#### Option 1: Disable RLS Completely

```sql
-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

#### Option 2: Custom RLS with Clerk

```sql
-- Create custom auth function
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Extract user ID from JWT or session
  -- This would need custom implementation
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql;

-- Use in policies
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.clerk_user_id() = user_id);
```

#### Option 3: Security Definer Functions

```sql
-- Create secure functions that validate userId
CREATE OR REPLACE FUNCTION get_user_folders(p_user_id TEXT)
RETURNS SETOF folders AS $$
BEGIN
  -- Validate p_user_id matches authenticated user
  -- Return only that user's folders
  RETURN QUERY SELECT * FROM folders WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Access Patterns

### Database Service Layer

The project uses a centralized `DatabaseService` class for all database operations:

```typescript
export class DatabaseService {
  private client = supabase;
  private adminClient = createAdminClient();

  // User operations
  async createUser(userData: Database["public"]["Tables"]["users"]["Insert"])
  async getUserById(id: string)
  async updateUser(id: string, updates: ...)

  // Profile operations
  async createProfile(profileData: ...)
  async getProfileByHandle(handle: string, platform: "tiktok" | "instagram")

  // Post operations
  async createPost(postData: ...)
  async getPostsByProfile(profileId: string, limit = 20, offset = 0)

  // Board operations
  async createBoard(boardData: ...)
  async addPostToBoard(boardId: string, postId: string)
  async getPostsInBoard(boardId: string, limit = 20, offset = 0)

  // ... and many more
}
```

### Complex Queries

#### Get Posts in Board with Profiles

```typescript
async getPostsInBoard(boardId: string) {
  const { data } = await this.client
    .from("board_posts")
    .select(`
      added_at,
      posts (
        id, platform, platform_post_id, embed_url, caption,
        profiles (
          id, handle, platform, display_name, avatar_url
        )
      )
    `)
    .eq("board_id", boardId)
    .order("added_at", { ascending: false });
}
```

#### Get User Statistics

```typescript
async getUserStats(userId: string) {
  // Complex aggregation across multiple tables
  const folders = await this.getFoldersByUser(userId);
  const boards = folders.flatMap(f => f.boards);
  const savedPosts = await this.countPostsInBoards(boards);
  const following = await this.countFollowing(userId);

  return { folders, boards, savedPosts, following };
}
```

## Performance Optimizations

### 1. Efficient Indexes

- Platform + handle for profile lookups
- Profile ID for post queries
- Date-based sorting indexes
- Partial indexes for filtered queries

### 2. Query Optimization

- Select only needed columns
- Use pagination (limit/offset)
- Batch operations where possible
- Avoid N+1 queries with joins

### 3. Caching Strategy

- Redis for API responses
- Client-side caching for static data
- Database query result caching

## Migrations

### Migration History

1. **001_initial_schema.sql**: Core tables and RLS policies
2. **002_featured_boards.sql**: Admin-curated boards feature
3. **003_fix_featured_boards_rls.sql**: Fix admin access policies
4. **004_followed_posts.sql**: Cache for following feed
5. **005_disable_followed_posts_rls.sql**: Disable broken RLS

### Migration Pattern

```sql
-- Migration header
-- Migration: [number]_[description]
-- Created: [date]
-- Description: [what and why]

-- Schema changes
ALTER TABLE ...
CREATE TABLE ...

-- RLS policies
CREATE POLICY ...

-- Data migrations
INSERT INTO ...
```

## Supabase Features Usage

### Features Used

- ✅ **PostgreSQL Database**: Full schema with relationships
- ✅ **TypeScript Integration**: Auto-generated types
- ✅ **Row Level Security**: Attempted but problematic
- ✅ **Database Functions**: Triggers and stored procedures
- ✅ **Client Libraries**: JavaScript/TypeScript SDK

### Features NOT Used

- ❌ **Supabase Auth**: Using Clerk instead
- ❌ **Realtime Subscriptions**: No live updates
- ❌ **Storage**: No file storage
- ❌ **Edge Functions**: No serverless functions
- ❌ **Vector/Embeddings**: No AI features

## Best Practices and Recommendations

### 1. Fix RLS Implementation

Choose one approach:

- Fully disable RLS and rely on application security
- Implement custom RLS that works with Clerk
- Use database functions with security definer

### 2. Add Database Validations

```sql
-- Add check constraints
ALTER TABLE posts ADD CONSTRAINT valid_platform
  CHECK (platform IN ('tiktok', 'instagram'));

ALTER TABLE users ADD CONSTRAINT valid_role
  CHECK (role IN ('user', 'admin'));
```

### 3. Implement Soft Deletes

```sql
-- Add deleted_at columns
ALTER TABLE boards ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update queries to filter deleted items
WHERE deleted_at IS NULL
```

### 4. Add Audit Trails

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Optimize for Scale

- Implement table partitioning for posts
- Add materialized views for analytics
- Consider read replicas for heavy queries
- Implement connection pooling

## Conclusion

The Supabase implementation in Narra is well-structured but has a critical security gap due to the Clerk/Supabase Auth incompatibility. The database schema is well-designed with proper relationships and indexes. The main recommendation is to resolve the RLS situation by either fully committing to application-layer security or implementing a custom database-level security solution that works with Clerk.

Key strengths:

- Clean database schema with proper constraints
- TypeScript integration for type safety
- Efficient query patterns with proper indexes
- Good separation of concerns with DatabaseService

Key weaknesses:

- Broken RLS implementation creating security risk
- Not utilizing many Supabase features
- Inconsistent security model
- No real-time capabilities despite use case fit
