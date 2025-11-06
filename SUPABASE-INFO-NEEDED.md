# What I Need From Supabase to Fix Schema Automatically

## Required Information

To fix the Supabase schema programmatically, I need:

### 1. Service Role Key (for DDL operations)

**Where to get it:**
1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api
2. Scroll down to "Project API keys"
3. Find the **"service_role"** key (NOT the anon key)
4. Copy it - it's a long JWT token starting with `eyJ...`

**Important:** 
- This key has FULL DATABASE ACCESS - keep it secret!
- Never expose it in frontend code
- Only use it in server-side code

### 2. Database Connection String (Alternative)

If you prefer, I can use the direct database connection string:

**Where to get it:**
1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/database
2. Scroll to "Connection string"
3. Select "URI" format
4. Copy the connection string (it looks like: `postgresql://postgres:[password]@[host]:5432/postgres`)

**Note:** This requires the database password, which you can reset in the same settings page if needed.

## What I'll Do With It

Once you provide the service role key, I will:

1. Create a helper function in your Supabase database that can execute SQL
2. Use that function to:
   - Make `email` column nullable
   - Add `form_data` JSONB column
   - Add `searcher_name`, `home_base`, `target_close_window` columns
3. Verify the schema is correct
4. Test that submissions work

## Security Note

The service role key bypasses Row Level Security (RLS) and has full database access. It's safe to use in server-side code but should NEVER be:
- Committed to git
- Exposed in frontend code
- Shared publicly

I'll add it to `server/.env` which should already be in `.gitignore`.

## How to Provide It

Just paste the service role key here and I'll:
1. Add it to `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`
2. Create a script to fix the schema automatically
3. Run it to update your database
4. Verify everything works

**Format:** Just paste the key value (the long JWT token)
