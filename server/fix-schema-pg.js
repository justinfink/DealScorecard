import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Get connection details from Supabase URL
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL');
  process.exit(1);
}

// Extract project ref from URL: https://xxxxx.supabase.co
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from Supabase URL');
  process.exit(1);
}

// Supabase connection pooler URL
// Use direct connection (not pooler) for DDL operations
const dbUrl = `postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

// Get connection password from service role key or connection string
// Actually, we need the actual database password, not the API key
// This approach won't work without the actual DB password

console.log('❌ Direct PostgreSQL connection requires database password.');
console.log('   Supabase API keys cannot be used for direct DB connections.\n');
console.log('📋 Please run the SQL manually in Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
console.log('Copy and paste this SQL:\n');

const sql = `
-- Make email nullable
ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;

-- Add missing columns  
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;
`.trim();

console.log(sql);
console.log('');
