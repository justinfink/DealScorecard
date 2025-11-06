-- Run this in Supabase SQL Editor to fix the schema mismatch
-- This adds all the columns the server code expects

-- First, make email nullable (remove NOT NULL constraint)
ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;

-- Add missing columns if they don't exist
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;
