-- Migration: Add billing_period to subscriptions table
-- Description: Track whether subscriptions are monthly or yearly for analytics and support

-- Add billing_period column to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN billing_period TEXT 
CHECK (billing_period IN ('monthly', 'yearly'));

-- Add index for faster queries by billing period
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_period 
ON subscriptions(billing_period);

-- Add comment to document the field
COMMENT ON COLUMN subscriptions.billing_period IS 'Billing frequency: monthly or yearly subscription';

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND column_name = 'billing_period';