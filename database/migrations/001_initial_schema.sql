-- Migration: 001_initial_schema
-- Created: 2024-12-19
-- Description: Initial database schema for Use Narra

-- This migration creates all the core tables and relationships
-- Run this when setting up a new Supabase project

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read/update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Profiles: Public read access
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Posts: Public read access
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Folders: Users can only access their own folders
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid()::text = user_id);

-- Boards: Users can access their own boards + public shared boards
CREATE POLICY "Users can view own boards" ON boards
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT user_id FROM folders WHERE folders.id = boards.folder_id
    )
  );

CREATE POLICY "Anyone can view shared boards" ON boards
  FOR SELECT USING (is_shared = true);

CREATE POLICY "Users can insert boards in own folders" ON boards
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM folders WHERE folders.id = boards.folder_id
    )
  );

CREATE POLICY "Users can update own boards" ON boards
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT user_id FROM folders WHERE folders.id = boards.folder_id
    )
  );

CREATE POLICY "Users can delete own boards" ON boards
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT user_id FROM folders WHERE folders.id = boards.folder_id
    )
  );

-- Board Posts: Users can manage posts in their own boards
CREATE POLICY "Users can view posts in accessible boards" ON board_posts
  FOR SELECT USING (
    board_id IN (
      SELECT boards.id FROM boards
      LEFT JOIN folders ON boards.folder_id = folders.id
      WHERE folders.user_id = auth.uid()::text OR boards.is_shared = true
    )
  );

CREATE POLICY "Users can insert posts to own boards" ON board_posts
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT boards.id FROM boards
      LEFT JOIN folders ON boards.folder_id = folders.id
      WHERE folders.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete posts from own boards" ON board_posts
  FOR DELETE USING (
    board_id IN (
      SELECT boards.id FROM boards
      LEFT JOIN folders ON boards.folder_id = folders.id
      WHERE folders.user_id = auth.uid()::text
    )
  );

-- Follows: Users can manage their own follows
CREATE POLICY "Users can view own follows" ON follows
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own follows" ON follows
  FOR DELETE USING (auth.uid()::text = user_id);

-- Subscriptions: Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Insert seed data for development
INSERT INTO profiles (handle, platform, display_name, bio, followers_count, verified) VALUES
('example_tiktok', 'tiktok', 'Example TikTok Creator', 'This is a sample TikTok profile for development', 10000, false),
('example_insta', 'instagram', 'Example Instagram Creator', 'This is a sample Instagram profile for development', 15000, true)
ON CONFLICT (handle, platform) DO NOTHING; 