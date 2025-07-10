-- Add embed_html field for Instagram and TikTok embeds
-- This field will store the HTML embed code for posts when viewing in boards

ALTER TABLE posts ADD COLUMN IF NOT EXISTS embed_html TEXT;

-- Add index for performance when querying posts with embeds
CREATE INDEX IF NOT EXISTS idx_posts_embed_html ON posts(platform) WHERE embed_html IS NOT NULL;

-- Add comment to document the field usage
COMMENT ON COLUMN posts.embed_html IS 'HTML embed code for displaying posts in boards (Instagram/TikTok embeds)';