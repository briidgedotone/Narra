-- Fix Instagram posts with missing original_url values
-- Run this in your Supabase SQL editor

-- First, let's see what we're working with
SELECT 
    id,
    title,
    original_url,
    shortcode,
    platform_post_id,
    CASE 
        WHEN original_url IS NULL OR original_url = '' THEN 'MISSING'
        ELSE 'HAS_URL'
    END as url_status
FROM posts 
WHERE board_id = 4 
    AND content_type = 'instagram'
ORDER BY created_at DESC;

-- Option 1: If posts have shortcode, generate Instagram URLs from shortcode
UPDATE posts 
SET original_url = 'https://www.instagram.com/p/' || shortcode || '/'
WHERE board_id = 4 
    AND content_type = 'instagram'
    AND (original_url IS NULL OR original_url = '')
    AND shortcode IS NOT NULL 
    AND shortcode != '';

-- Option 2: If posts have platform_post_id but no shortcode, use that
UPDATE posts 
SET original_url = 'https://www.instagram.com/p/' || platform_post_id || '/'
WHERE board_id = 4 
    AND content_type = 'instagram'
    AND (original_url IS NULL OR original_url = '')
    AND platform_post_id IS NOT NULL 
    AND platform_post_id != ''
    AND (shortcode IS NULL OR shortcode = '');

-- Verify the changes
SELECT 
    id,
    title,
    original_url,
    shortcode,
    platform_post_id,
    CASE 
        WHEN original_url IS NULL OR original_url = '' THEN 'STILL_MISSING'
        ELSE 'FIXED'
    END as url_status
FROM posts 
WHERE board_id = 4 
    AND content_type = 'instagram'
ORDER BY created_at DESC;

-- Count the results
SELECT 
    CASE 
        WHEN original_url IS NULL OR original_url = '' THEN 'STILL_MISSING'
        ELSE 'FIXED'
    END as url_status,
    COUNT(*) as count
FROM posts 
WHERE board_id = 4 
    AND content_type = 'instagram'
GROUP BY url_status;