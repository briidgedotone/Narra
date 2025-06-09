# Use Narra Database Setup

## 🗂️ Overview

This directory contains the database schema, migrations, and setup instructions for Use Narra's PostgreSQL database using Supabase.

## 📁 File Structure

```
database/
├── README.md                    # This file
├── schema.sql                   # Complete database schema
└── migrations/
    └── 001_initial_schema.sql   # Initial migration with RLS policies
```

## 🚀 Supabase Setup

### 1. Create New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `use-narra-[environment]` (e.g., `use-narra-dev`)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users

### 2. Configure Environment Variables

Copy your project details from the Supabase dashboard:

```bash
# In your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Initial Schema

In your Supabase dashboard:

1. Go to **SQL Editor**
2. Copy and paste the contents of `schema.sql`
3. Click **Run** to create all tables and indexes
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** to set up Row Level Security policies

## 📊 Database Schema

### Core Tables

- **`users`** - User accounts (synced with Clerk)
- **`profiles`** - Social media profiles to follow
- **`posts`** - Social media posts and content
- **`folders`** - Organization folders for users
- **`boards`** - Content boards within folders
- **`board_posts`** - Many-to-many relationship for posts in boards
- **`follows`** - User-profile following relationships
- **`subscriptions`** - Stripe subscription data

### Key Relationships

```
users (1) ←→ (many) folders
folders (1) ←→ (many) boards
boards (many) ←→ (many) posts (via board_posts)
users (many) ←→ (many) profiles (via follows)
profiles (1) ←→ (many) posts
users (1) ←→ (1) subscriptions
```

## 🔒 Security (Row Level Security)

All tables have RLS enabled with the following policies:

- **Users**: Can read/update their own data
- **Profiles**: Public read access
- **Posts**: Public read access
- **Folders**: Users can only access their own
- **Boards**: Users can access their own + public shared boards
- **Board Posts**: Users can manage posts in accessible boards
- **Follows**: Users can manage their own follows
- **Subscriptions**: Users can view their own subscription

## 🔧 Local Development

The database utilities are configured to work with placeholder values:

```typescript
// src/lib/supabase.ts will use these defaults if env vars are missing:
supabaseUrl: "http://localhost:54321";
supabaseAnonKey: "placeholder-key";
```

This allows continued development even without a configured Supabase instance.

## 🛠️ Database Operations

Use the provided `DatabaseService` class for all operations:

```typescript
import { db } from "@/lib/database";

// Create a new folder
const folder = await db.createFolder({
  user_id: "user-id",
  name: "My Inspiration",
});

// Get posts by profile
const posts = await db.getPostsByProfile("profile-id");

// Follow a profile
await db.followProfile("user-id", "profile-id");
```

## 📈 Performance Considerations

### Indexes

The schema includes optimized indexes for:

- Profile lookups by platform and handle
- Post queries by profile and date
- User-specific folder and board queries
- Following relationships

### Caching

Consider implementing Redis caching for:

- Frequently accessed posts
- User folder/board structures
- Profile search results

## 🔄 Migration Process

When adding new features:

1. Create new migration file: `002_add_feature.sql`
2. Test locally first
3. Apply to staging environment
4. Apply to production with backup

## 🐛 Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure user is authenticated and policies match your use case
2. **Foreign Key Violations**: Check that referenced records exist
3. **Unique Constraint Violations**: Handle conflicts in your application logic

### Debugging Queries

Enable query logging in Supabase dashboard under Settings > Database to debug slow queries.

## 📞 Support

For database-related issues:

- Check Supabase documentation
- Review RLS policies if getting permission errors
- Use Supabase dashboard SQL editor for testing queries
