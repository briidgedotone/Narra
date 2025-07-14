# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development server with Turbopack
- `npm run dev:debug` - Start development server with Node.js inspector
- `npm run build` - Build production bundle
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Utilities

- `npm run check-all` - Run all checks (type-check, lint, format, test)
- `npm run clean` - Clean build artifacts
- `npm run reset` - Full reset (clean, reinstall dependencies)

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Clerk with middleware-based route protection
- **Payments**: Stripe integration with webhooks
- **Styling**: TailwindCSS with Radix UI components
- **State Management**: React Server Components + client-side hooks
- **Cache**: Redis via IORedis for performance optimization

### Core Application Structure

**Authentication & Authorization:**

- Clerk handles user authentication with role-based access (user/admin)
- Middleware (`src/middleware.ts`) protects routes and handles user data caching
- Public routes: `/`, auth pages, API endpoints, shared content
- Admin routes: `/admin/*` - require admin role
- Protected routes: All others require authentication

**Database Architecture:**

- **Singleton Pattern**: `DatabaseService` class provides centralized database operations
- **Core Tables**: users, profiles (social media), posts, folders, boards, board_posts
- **Relationships**: Users → Folders → Boards → Posts (many-to-many via board_posts)
- **Social Integration**: Profiles table stores TikTok/Instagram creator data
- **Posts**: Store social media content with metrics, transcripts, and embeds

**Content Management Flow:**

1. **Discovery**: Users search/browse TikTok/Instagram content via `/discovery`
2. **Curation**: Save posts to organized boards within folders
3. **Organization**: Hierarchical structure (User → Folders → Boards → Posts)
4. **Sharing**: Boards can be made public with shareable links
5. **Following**: Users can follow creators and see their latest posts

### Key Implementation Patterns

**Server Actions Pattern:**

- All database mutations use Next.js Server Actions in `src/app/actions/`
- Actions handle authentication, validation, and cache revalidation
- Pattern: `auth()` → validate → database operation → `revalidatePath()`

**Component Architecture:**

- **Layout**: `DashboardLayout` wraps authenticated pages with sidebar
- **Provider Pattern**: `FoldersProvider` manages folder/board state
- **Compound Components**: Modal components with multiple variants
- **Server Components**: Pages fetch data, client components handle interactivity

**Database Interaction:**

- Singleton `DatabaseService` instance exported as `db`
- Type-safe operations using generated Supabase types
- Complex queries use PostgreSQL joins with careful type handling
- Error handling with user-friendly messages

### Performance Optimizations

**Caching Strategy:**

- **Middleware Cache**: User data cached in-memory for requests
- **Server Component Cache**: Next.js automatic caching for pages
- **Database Connection Pool**: Supabase handles connection pooling
- **Image Proxy**: Custom proxy for external images to avoid CORS

**Code Splitting:**

- Lazy loading: `DiscoveryContent` component uses React.lazy
- Dynamic imports for heavy components
- Turbopack for fast development builds

### External Integrations

**Social Media APIs:**

- Custom scraping service (`scrape-creators.ts`) for TikTok/Instagram
- Embed generation for displaying social content
- Transcript extraction for video content
- Profile and post metadata fetching

**Payment Processing:**

- Stripe checkout and webhook handling
- Subscription status tracking in user table
- Plan-based feature access via middleware

## Important Development Notes

### TypeScript Handling

- Strict type checking enabled
- When working with database results, use proper type guards for nullable fields
- Complex Supabase queries may require type assertions - prefer `as Type` over `any`
- Filter out null values before type assertions to maintain type safety

### Database Operations

- Always use the singleton `db` instance from `@/lib/database`
- Handle unique constraint violations (code 23505) gracefully
- Use transactions for multi-table operations
- Implement proper error handling with user-friendly messages

### Social Media Content

- Instagram embeds require server-side fetching due to CORS
- TikTok embeds can be handled client-side
- Always handle failed embeds gracefully with fallback content
- Store original URLs alongside embed URLs for reliability

### Testing Strategy

- Jest configuration includes coverage thresholds (70% minimum)
- Focus testing on components, hooks, and utility functions
- Use React Testing Library for component tests
- Mock external APIs and database calls

### Deployment Considerations

- Supabase connection requires proper environment variables
- Clerk authentication needs production domain configuration
- Stripe webhooks require HTTPS endpoints
- Image proxy may need CORS configuration for production

### Common Patterns for New Features

1. Create Server Action in appropriate `actions/` file
2. Add database method to `DatabaseService` if needed
3. Create reusable components in `components/` with proper TypeScript
4. Use `useFolders` hook for folder/board-related state
5. Implement proper loading and error states
6. Add cache revalidation after mutations
7. Include proper authentication checks
