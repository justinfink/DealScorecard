-- Fix RLS (Row Level Security) to allow submissions
-- Run this in Supabase SQL Editor or via CLI

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'submissions';

-- Disable RLS (if you want anyone to be able to insert)
-- ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- OR create a policy that allows inserts (better for security)
-- Allow anyone to insert (anon key can insert)
CREATE POLICY "Allow public inserts" 
ON submissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow anyone to read their own submissions (optional)
CREATE POLICY "Allow public reads" 
ON submissions 
FOR SELECT 
TO anon, authenticated 
USING (true);
