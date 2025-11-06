# What I Need From Supabase to Fix Schema Automatically

## Quick Answer

**I need your Supabase Service Role Key.**

## Step-by-Step

1. Go to: **https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api**

2. Scroll down to **"Project API keys"** section

3. Find the row that says **"service_role"** (NOT "anon" or "anon public")

4. Click the **eye icon** or **reveal** button to show the key

5. Copy the entire key (it's a long JWT token starting with `eyJ...`)

6. Paste it here and I'll:
   - Add it to `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`
   - Create a script to fix your schema automatically
   - Run it to update your database
   - Verify everything works

## What It Looks Like

The service role key is a long JWT token that looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1anJwenFieXV5Y2tld3Jrb2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM4NjA1OSwiZXhwIjoyMDc3OTYyMDU5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Note

⚠️ **This key has FULL database access** - it bypasses Row Level Security.

- ✅ Safe to use in server-side code (which is where I'll use it)
- ✅ Already stored in `server/.env` (which should be in `.gitignore`)
- ❌ NEVER expose it in frontend code
- ❌ NEVER commit it to git
- ❌ NEVER share it publicly

Once you give it to me, I'll:
1. Add it securely to your `.env` file
2. Use it to fix the schema
3. Your database will be updated and ready to accept submissions

## Alternative: Manual Fix

If you prefer not to share the service role key, you can run the SQL manually:

1. Go to: **https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql**
2. Copy the SQL from `server/fix-schema.sql`
3. Paste and click "Run"

But the automatic way is faster and I'll verify it works!
