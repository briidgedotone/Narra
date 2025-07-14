-- Migration: Remove Stripe Integration
-- Description: Remove all Stripe-related tables and fields from the database

-- Drop Stripe-related tables
DROP TABLE IF EXISTS webhook_events;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS plans;

-- Remove Stripe-related fields from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS plan_id,
DROP COLUMN IF EXISTS monthly_profile_discoveries,
DROP COLUMN IF EXISTS monthly_transcripts_viewed,
DROP COLUMN IF EXISTS usage_reset_date;

-- Remove any Stripe-related indexes (if they exist)
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_stripe_customer_id;
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;
DROP INDEX IF EXISTS idx_webhook_events_stripe_event_id;

-- Clean up any remaining Stripe-related constraints or triggers
-- (These may not exist depending on previous migrations)
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;