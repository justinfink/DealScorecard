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

async function executeSQLViaFunction(sql) {
  // Try to use exec_ddl function if it exists
  try {
    const { error } = await supabase.rpc('exec_ddl', { sql_text: sql });
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    if (error.code === '42883') {
      // Function doesn't exist
      return null;
    }
    throw error;
  }
}

async function main() {
  console.log('🔧 Fixing Supabase Schema with Service Role Key\n');

  // First, try to create the helper function
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

  console.log('Attempting to create helper function...');
  
  // Since Supabase REST API doesn't support DDL directly,
  // we need to use the Management API or create the function manually
  // Let's try using Supabase's database connection via the REST API
  
  // Use the service role to make a direct database call
  // We'll use the Supabase PostgREST API to execute via a function
  
  // Actually, the best approach is to use Supabase's SQL Editor API
  // But that's not publicly documented. Let's use a workaround:
  // Create the function via a direct HTTP call to the database
  
  console.log('\n⚠️  Supabase REST API doesn\'t support direct DDL execution.');
  console.log('   We need to create a helper function first.\n');
  
  // Try to create function using raw SQL execution
  // Use Supabase's ability to execute SQL via the REST API
  // But this requires the function to already exist (chicken-and-egg)
  
  // Solution: Use Supabase CLI or Management API, or manual SQL
  
  console.log('📝 Please run this SQL in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
  console.log('-- Step 1: Create helper function');
  console.log(createFunctionSQL);
  console.log('\n-- Step 2: Apply schema fixes');
  
  const schemaFixes = [
    'ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;',
  ];
  
  schemaFixes.forEach(sql => console.log(sql));
  
  console.log('\n   Or run all at once:\n');
  console.log(createFunctionSQL + '\n');
  schemaFixes.forEach(sql => console.log(sql));
  
  console.log('\n✅ After running this SQL, your schema will be fixed!');
  console.log('   Then test by submitting the form.\n');
}

main().catch(console.error);
