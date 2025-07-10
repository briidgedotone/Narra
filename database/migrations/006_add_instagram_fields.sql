-- Add Instagram-specific fields to posts table
-- This migration addresses the missing carousel_count and other Instagram fields

ALTER TABLE posts ADD COLUMN IF NOT EXISTS original_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_carousel BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS carousel_media JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS carousel_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shortcode TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- Rename thumbnail_url to thumbnail for consistency (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE posts RENAME COLUMN thumbnail_url TO thumbnail;
    END IF;
END $$;

-- Add thumbnail column if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_shortcode ON posts(shortcode) WHERE shortcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_is_video ON posts(is_video) WHERE is_video = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_is_carousel ON posts(is_carousel) WHERE is_carousel = TRUE;

-- Update existing posts to set default values for new fields
UPDATE posts 
SET 
    is_video = FALSE,
    is_carousel = FALSE,
    carousel_count = 0
WHERE 
    is_video IS NULL 
    OR is_carousel IS NULL 
    OR carousel_count IS NULL;