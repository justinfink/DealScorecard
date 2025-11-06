# What I Need From Supabase to Fix the Schema

To programmatically fix the Supabase schema, I need:

## Required: Service Role Key

**Where to get it:**
1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api
2. Scroll down to "Project API keys"
3. Find the **"service_role"** key (NOT the anon key)
4. Copy it - it looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Why I need it:**
- The anon key (which you already provided) can only read/write data
- The service_role key has permission to modify the database schema (ALTER TABLE, etc.)
- Without it, I can only read/write data, not add columns

**Security Note:**
- The service_role key bypasses Row Level Security (RLS)
- Keep it secret - never commit it to git
- I'll add it to `server/.env` (which is already in .gitignore)

## What I'll Do With It

Once you provide the service_role key, I will:
1. Add it to `server/.env` as `SUPABASE_SERVICE_ROLE_KEY=your-key-here`
2. Create a script that uses it to execute the schema fixes
3. Run the SQL to:
   - Make `email` nullable
   - Add `form_data` column
   - Add `searcher_name`, `home_base`, `target_close_window` columns

## Alternative (If You Don't Want to Share Service Role Key)

You can run the SQL manually:
1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql
2. Copy the SQL from `server/fix-schema.sql`
3. Paste and click Run

Both methods will work - the service role key just lets me automate it.
