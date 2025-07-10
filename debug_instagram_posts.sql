-- Debug Instagram posts in board 4
-- Run this in your Supabase SQL editor or database client

-- 1. Check all Instagram posts in board 4 with their original_url values
SELECT 
    id,
    board_id,
    content_type,
    title,
    description,
    original_url,
    CASE 
        WHEN original_url IS NULL THEN 'NULL'
        WHEN original_url = '' THEN 'EMPTY'
        ELSE 'HAS_VALUE'
    END as url_status,
    LENGTH(original_url) as url_length,
    embed_html IS NOT NULL as has_embed_html,
    created_at
FROM posts 
WHERE board_id = 4 
    AND content_type = 'instagram'
ORDER BY created_at DESC;

-- 2. Count posts by URL status
SELECT 
    CASE 
        WHEN original_url IS NULL THEN 'NULL'
        WHEN original_url = '' THEN 'EMPTY'
        ELSE 'HAS_VALUE'
    END as url_status,
    COUNT(*) as count
FROM posts 
WHERE board_id = 4 
    AND content_type = 'instagram'
GROUP BY url_status;

-- 3. Show posts with missing original_url values
SELECT 
    id,
    title,
    description,
    original_url,
    created_at
FROM posts 
WHERE board_id = 4 
    AND content_type = 'instagram'
    AND (original_url IS NULL OR original_url = '')
ORDER BY created_at DESC;

-- 4. Check if migration has been applied (should show all new columns)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
    AND column_name IN ('original_url', 'is_video', 'is_carousel', 'carousel_count', 'shortcode')
ORDER BY column_name;