-- Script to create default users in Supabase Auth and profiles table
-- This script should be run manually in Supabase SQL Editor

-- Note: Supabase Auth users need to be created through the Auth API or Dashboard
-- This script only creates the profile entries

-- First, you need to create users in Supabase Auth Dashboard with these credentials:
-- 1. Email: finance@military.gov, Password: finance123
-- 2. Email: commander@military.gov, Password: commander123  
-- 3. Email: auditor@military.gov, Password: auditor123

-- Then run this script to create their profiles:

-- Insert profiles (replace the UUIDs with actual user IDs from Supabase Auth)
-- You can get the user IDs from: Authentication > Users in Supabase Dashboard

-- Example (you need to replace with actual UUIDs):
/*
INSERT INTO public.profiles (id, username, full_name, role, rank, unit, phone)
VALUES 
  ('USER_ID_FROM_AUTH_1', 'finance@military.gov', 'أحمد محمد العلي', 'finance_officer', 'رائد', 'ركن المالية', '+966501234567'),
  ('USER_ID_FROM_AUTH_2', 'commander@military.gov', 'خالد عبدالله السالم', 'commander', 'عقيد', 'قائد اللواء', '+966501234568'),
  ('USER_ID_FROM_AUTH_3', 'auditor@military.gov', 'محمد سعيد الأحمد', 'auditor', 'نقيب', 'المراجعة المالية', '+966501234569')
ON CONFLICT (id) DO NOTHING;
*/

-- Alternative: Use Supabase Auth API to create users programmatically
-- See: https://supabase.com/docs/reference/javascript/auth-admin-createuser
