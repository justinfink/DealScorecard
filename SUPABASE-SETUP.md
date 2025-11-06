# Fix Supabase Schema Issues

## The Problem
The server code tries to insert columns that might not exist in your Supabase table, causing silent failures.

## The Solution

### Option 1: Run the Fix Script (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the contents of `server/fix-schema.sql`
4. Click "Run" to execute

### Option 2: Recreate the Table (If you don't have important data)
1. Go to Supabase SQL Editor
2. Run: `DROP TABLE IF EXISTS submissions;`
3. Copy and paste the contents of `server/setup-supabase.sql`
4. Click "Run"

## What This Fixes
- Makes `email` nullable (allows partial submissions)
- Adds `form_data` JSONB column (stores entire form)
- Adds `searcher_name`, `home_base`, `target_close_window` columns
- Allows submissions without requiring all fields

## Verify It Worked
After running the SQL, check your server logs when submitting. You should see:
- `✅ Submission saved to database: [uuid]`

If you still see errors, check:
1. Server logs for detailed error messages
2. Supabase dashboard > Table Editor > submissions (verify columns exist)
3. Browser console (F12) for network errors
