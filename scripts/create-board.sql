-- Create Top Viral Hooks board in the same folder as Best of eCommerce
INSERT INTO boards (id, folder_id, name, description, public_id, is_shared, created_at, updated_at)
SELECT 
  'd4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a'::uuid as id,
  folder_id,
  'Top Viral Hooks' as name,
  'Collection of top performing viral hooks from Instagram' as description,
  'vHooks2025' as public_id,
  false as is_shared,
  now() as created_at,
  now() as updated_at
FROM boards
WHERE id = '877a7dde-74ce-42c8-901b-20db491662b1'
LIMIT 1;

-- Board ID to use: d4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a