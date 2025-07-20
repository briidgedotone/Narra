-- Diagnostic query to debug subscription status issues
-- Run this to check user subscription status vs actual Stripe subscription status

SELECT 
  u.id,
  u.email,
  u.subscription_status as user_status,
  u.plan_id as user_plan,
  u.updated_at as user_last_updated,
  s.status as stripe_status,
  s.plan_id as stripe_plan,
  s.current_period_start,
  s.current_period_end,
  s.updated_at as stripe_last_updated,
  CASE 
    WHEN u.subscription_status = s.status THEN '✅ SYNCED'
    ELSE '❌ OUT OF SYNC'
  END as sync_status,
  CASE 
    WHEN u.subscription_status IN ('active', 'trialing') THEN '✅ SHOULD ACCESS DASHBOARD'
    ELSE '❌ SHOULD BE REDIRECTED TO PLAN SELECTION'
  END as dashboard_access
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.subscription_status != 'inactive' OR s.id IS NOT NULL
ORDER BY u.updated_at DESC;