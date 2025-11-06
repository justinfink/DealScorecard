# What I Need: Supabase Service Role Key

## Quick Steps

1. **Go to:** https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api

2. **Find:** Scroll to "Project API keys" section

3. **Look for:** The row labeled **"service_role"** (NOT "anon" or "anon public")

4. **Reveal:** Click the eye icon or "reveal" button to show the key

5. **Copy:** Copy the entire JWT token (starts with `eyJ...`)

6. **Paste here:** Just paste the key and I'll add it to your `.env` and fix the schema automatically

## What It Looks Like

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1anJwenFieXV5Y2tld3Jrb2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM4NjA1OSwiZXhwIjoyMDc3OTYyMDU5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## What I'll Do With It

1. Add it to `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`
2. Create a script that uses it to execute SQL in your Supabase database
3. Run the SQL to:
   - Make `email` nullable
   - Add `form_data` JSONB column
   - Add `searcher_name`, `home_base`, `target_close_window` columns
4. Verify the schema is correct
5. Test that submissions work

## Security

- ✅ Safe in server-side code (which is where it goes)
- ✅ Stored in `.env` (which should be gitignored)
- ❌ Never expose in frontend code
- ❌ Never commit to git

Once you provide it, I can fix everything automatically!
