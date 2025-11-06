# Quick Supabase Setup

Since you've used Supabase before, here's the quickest way to set up:

## Option 1: Manual Setup (Fastest if you have credentials)

1. Create `server/.env` file with:
```env
PORT=3001
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-anon-key-here
```

2. Run the SQL from `server/setup-supabase.sql` in your Supabase SQL Editor

3. Done! Start the server with `npm run dev`

## Option 2: Use the helper script

```bash
cd server
node create-env.js
```

Then follow the prompts to enter your Supabase credentials.

## What I Need From You

If you can provide:
- Your Supabase project URL
- Your Supabase anon key

I can create the `.env` file for you right away!
