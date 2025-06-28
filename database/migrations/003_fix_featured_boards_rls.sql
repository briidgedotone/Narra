-- Fix RLS policies for featured_boards table to allow admin access
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "featured_boards_select_policy" ON featured_boards;
DROP POLICY IF EXISTS "featured_boards_insert_policy" ON featured_boards;
DROP POLICY IF EXISTS "featured_boards_update_policy" ON featured_boards;
DROP POLICY IF EXISTS "featured_boards_delete_policy" ON featured_boards;

-- Enable RLS on featured_boards table
ALTER TABLE featured_boards ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read featured boards (for displaying on dashboard)
CREATE POLICY "featured_boards_select_policy" ON featured_boards
    FOR SELECT USING (true);

-- Allow admin users to insert featured boards
CREATE POLICY "featured_boards_insert_policy" ON featured_boards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Allow admin users to update featured boards
CREATE POLICY "featured_boards_update_policy" ON featured_boards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Allow admin users to delete featured boards
CREATE POLICY "featured_boards_delete_policy" ON featured_boards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'featured_boards'; 