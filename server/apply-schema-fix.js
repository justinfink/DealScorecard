import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

// Use service role if available (has DDL permissions), otherwise anon
const key = serviceKey || anonKey;
const supabase = createClient(supabaseUrl, key);

console.log('🔧 Supabase Schema Fix Tool\n');

if (!serviceKey) {
  console.log('⚠️  No SUPABASE_SERVICE_ROLE_KEY found.');
  console.log('   The anon key cannot modify schema.');
  console.log('\n   To get service role key:');
  console.log('   1. https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api');
  console.log('   2. Copy "service_role" key (keep secret!)');
  console.log('   3. Add to server/.env: SUPABASE_SERVICE_ROLE_KEY=your-key');
  console.log('   4. Run this script again\n');
  
  console.log('📋 OR run this SQL manually in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
  
  const sql = `
-- Make email nullable
ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;

-- Add missing columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;
  `.trim();
  
  console.log(sql);
  console.log('');
  process.exit(0);
}

console.log('✅ Using service role key - proceeding with schema fixes...\n');

// Since Supabase REST API doesn't support direct SQL execution,
// we need to create a helper function first, then use it
async function setupAndFix() {
  // Step 1: Create helper function via direct SQL execution
  // We'll use the Supabase Management API or create a migration
  const createFunction = `
CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
RETURNS void  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql_text;
END;
$$;
  `.trim();

  const fixes = [
    "ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;",
    "ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;",
    "ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;",
    "ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;",
    "ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;",
  ];

  console.log('📝 Supabase REST API doesn\'t support direct SQL execution.');
  console.log('   Please run this SQL in Supabase SQL Editor:\n');
  console.log('   URL: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
  
  console.log('-- Step 1: Create helper function (run once)');
  console.log(createFunction);
  console.log('\n-- Step 2: Apply schema fixes');
  fixes.forEach(fix => console.log(fix));
  console.log('\n   Or copy from: server/fix-schema.sql\n');
}

setupAndFix();