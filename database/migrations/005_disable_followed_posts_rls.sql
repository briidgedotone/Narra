-- Migration: Disable RLS on followed_posts table
-- Date: 2025-01-07
-- Reason: RLS policy was incompatible with Clerk authentication system
-- The policy used auth.uid() which returns null since we use Clerk (not Supabase Auth)
-- We handle authorization in our application layer instead

-- Disable Row Level Security on followed_posts table
ALTER TABLE followed_posts DISABLE ROW LEVEL SECURITY;

-- Drop the existing policy (if it exists)
DROP POLICY IF EXISTS "Users can only see their own followed posts" ON followed_posts;

-- Note: Authorization is now handled in the application layer
-- via DatabaseService.getFollowedPosts() which filters by userId parameter
-- This is secure because the userId comes from Clerk's authenticated session 