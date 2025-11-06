import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createExecFunction() {
  console.log('Step 1: Creating helper function to execute SQL...\n');
  
  const createFunctionSQL = `
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

  // Use Supabase REST API to execute SQL via a direct query
  // Since we can't execute DDL directly, we'll use the Management API approach
  try {
    // Try to create the function using Supabase's RPC capability
    // First, we need to execute this SQL directly via the database connection
    // Since Supabase REST API doesn't support DDL, we'll use a workaround
    
    // Use the service role key to make a direct HTTP request to Supabase's database
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectRef) {
      throw new Error('Could not extract project ref from URL');
    }

    // Supabase doesn't expose direct SQL execution via REST API
    // We need to use the PostgREST API to create a function, but that requires the function to already exist
    // So we'll use a different approach: create the function via SQL Editor API
    
    console.log('⚠️  Supabase REST API doesn\'t support direct DDL execution.');
    console.log('   Creating the helper function first...\n');
    
    // Try using the Supabase client's ability to execute functions
    // But first we need the function to exist, which is a chicken-and-egg problem
    
    // Alternative: Use Supabase's database connection string with service role
    // But that requires the database password, not the API key
    
    // Best approach: Use Supabase's SQL Editor API endpoint
    // This requires the Management API which may not be available
    
    console.log('📝 Please run this SQL manually in Supabase SQL Editor first:');
    console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
    console.log(createFunctionSQL);
    console.log('\n   Then run this script again.\n');
    
    return false;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function applySchemaFixes() {
  console.log('Step 2: Applying schema fixes...\n');

  const fixes = [
    { name: 'Make email nullable', sql: 'ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;' },
    { name: 'Add form_data column', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;' },
    { name: 'Add searcher_name column', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;' },
    { name: 'Add home_base column', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;' },
    { name: 'Add target_close_window column', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;' },
  ];

  // Try to use the exec_ddl function if it exists
  for (const fix of fixes) {
    console.log(`Applying: ${fix.name}...`);
    try {
      const { data, error } = await supabase.rpc('exec_ddl', { sql_text: fix.sql });
      
      if (error) {
        if (error.code === '42883') {
          console.log('   ⚠️  Function exec_ddl does not exist yet.');
          console.log('   Please create it first (see Step 1), then run this script again.\n');
          break;
        } else {
          console.log(`   ❌ Error: ${error.message}\n`);
        }
      } else {
        console.log(`   ✅ Success\n`);
      }
    } catch (error) {
      console.log(`   ❌ ${error.message}\n`);
    }
  }
}

async function main() {
  console.log('🔧 Fixing Supabase Schema\n');
  console.log('Using service role key to update database schema...\n');

  const functionCreated = await createExecFunction();
  
  if (functionCreated) {
    await applySchemaFixes();
  } else {
    // Provide manual instructions
    console.log('\n📋 Manual Fix Instructions:\n');
    console.log('Since Supabase REST API doesn\'t support direct DDL execution,');
    console.log('please run this SQL in Supabase SQL Editor:\n');
    console.log('URL: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
    
    const allSQL = `
-- Make email nullable
ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;

-- Add missing columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;
    `.trim();
    
    console.log(allSQL);
    console.log('\n✅ After running this SQL, your schema will be fixed!\n');
  }
}

main().catch(console.error);
