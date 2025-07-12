-- Create followed_posts table for daily fetched content
CREATE TABLE IF NOT EXISTS public.followed_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id),
    profile_id UUID NOT NULL REFERENCES public.profiles(id),
    platform TEXT NOT NULL CHECK (platform = ANY (ARRAY['tiktok', 'instagram'])),
    platform_post_id TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    caption TEXT,
    transcript TEXT,
    thumbnail_url TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    date_posted TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    -- Composite unique constraint to allow same post for different users
    UNIQUE(user_id, embed_url)
);

-- Create index for fast retrieval of user's posts by date
CREATE INDEX idx_followed_posts_user_date 
ON public.followed_posts(user_id, date_posted DESC);

-- Create index for cleanup of old posts
CREATE INDEX idx_followed_posts_date_posted 
ON public.followed_posts(date_posted);

-- Enable Row Level Security
ALTER TABLE public.followed_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own followed posts
CREATE POLICY "Users can only view their own followed posts"
ON public.followed_posts FOR ALL
USING (auth.uid() = user_id);

-- Function to clean up old followed posts (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_followed_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.followed_posts
  WHERE date_posted < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule cleanup to run daily at 4:30 AM UTC (before the 5 AM fetch)
SELECT cron.schedule(
  'cleanup-followed-posts',
  '30 4 * * *',
  $$SELECT clean_old_followed_posts();$$
); 