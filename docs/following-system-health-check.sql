-- Following System Health Check
-- Run this to verify the immediate refresh feature is working

-- 1. Check recent follows (last hour)
SELECT 
  'Recent Follows' as check_type,
  COUNT(*) as count,
  MAX(created_at) as latest_follow
FROM follows 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 2. Check recent followed_posts (last hour) 
SELECT 
  'Recent Followed Posts' as check_type,
  COUNT(*) as count,
  MAX(created_at) as latest_post
FROM followed_posts 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 3. Check follows with recent last_refresh
SELECT 
  'Recent Refreshes' as check_type,
  COUNT(*) as count,
  MAX(last_refresh) as latest_refresh
FROM follows 
WHERE last_refresh > NOW() - INTERVAL '1 hour';

-- 4. Check Instagram profiles followed recently
SELECT 
  f.created_at as followed_at,
  f.last_refresh,
  p.handle,
  p.platform,
  p.display_name,
  COUNT(fp.id) as posts_fetched
FROM follows f
JOIN profiles p ON f.profile_id = p.id
LEFT JOIN followed_posts fp ON fp.profile_id = p.id AND fp.user_id = f.user_id
WHERE f.created_at > NOW() - INTERVAL '1 hour'
  AND p.platform = 'instagram'
GROUP BY f.created_at, f.last_refresh, p.handle, p.platform, p.display_name
ORDER BY f.created_at DESC;

-- 5. Check if immediate refresh is working (posts created within 5 minutes of follow)
SELECT 
  'Immediate Refresh Success' as check_type,
  COUNT(*) as successful_immediate_refreshes
FROM follows f
JOIN followed_posts fp ON fp.user_id = f.user_id AND fp.profile_id = f.profile_id
WHERE f.created_at > NOW() - INTERVAL '1 hour'
  AND fp.created_at BETWEEN f.created_at AND f.created_at + INTERVAL '5 minutes';