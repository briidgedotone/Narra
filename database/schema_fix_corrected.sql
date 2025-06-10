-- ==============================================
-- CORRECTED FIX: Change users.id from UUID to TEXT for Clerk compatibility
-- ==============================================
-- Clerk user IDs are strings like "user_xyz", not UUIDs

-- Step 1: Drop all foreign key constraints first
ALTER TABLE folders DROP CONSTRAINT IF EXISTS folders_user_id_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_user_id_fkey; 
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Step 2: Change user_id columns to TEXT in related tables FIRST
ALTER TABLE folders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE follows ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE subscriptions ALTER COLUMN user_id TYPE TEXT;

-- Step 3: Drop the existing users table (since it's empty anyway)
DROP TABLE IF EXISTS users CASCADE;

-- Step 4: Recreate users table with TEXT id instead of UUID
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT for Clerk compatibility
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' 
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Now recreate foreign key constraints (both sides are TEXT now)
ALTER TABLE folders ADD CONSTRAINT folders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT follows_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Recreate the updated_at trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verify the schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'folders', 'follows', 'subscriptions')
  AND column_name IN ('id', 'user_id')
ORDER BY table_name, column_name;

-- Success message
SELECT 'Schema fixed! All user ID references are now TEXT compatible with Clerk 🎉' as status; 