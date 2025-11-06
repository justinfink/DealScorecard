# Fix Supabase Schema - Quick Fix

## The Problem
The server code expects these columns that might not exist:
- `form_data` (JSONB)
- `searcher_name` (TEXT)
- `home_base` (TEXT)  
- `target_close_window` (TEXT)

Also, `email` might be set as NOT NULL when it should allow nulls.

## Quick Fix (Run This SQL)

1. Go to: **https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql**
2. Copy and paste this SQL:

```sql
-- Make email nullable
ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;

-- Add missing columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;
```

3. Click **Run**
4. Done!

The server will now work with the updated schema.
