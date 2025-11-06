import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or key');
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

  // Try to execute this via Supabase REST API
  // We'll use a direct HTTP call since Supabase JS client doesn't support raw SQL
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createFunctionSQL }),
    });

    if (response.ok) {
      console.log('✅ Helper function created\n');
      return true;
    } else {
      console.log('⚠️  Could not create function via API');
      console.log('   We need to create it manually first.\n');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    console.log('\n📝 Please run this SQL in Supabase SQL Editor first:');
    console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
    console.log(createFunctionSQL);
    console.log('\nThen run this script again.\n');
    return false;
  }
}

async function applyFixes(functionExists) {
  console.log('Step 2: Applying schema fixes...\n');

  const fixes = [
    { name: 'Make email nullable', sql: "ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;" },
    { name: 'Add form_data', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;' },
    { name: 'Add searcher_name', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;' },
    { name: 'Add home_base', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;' },
    { name: 'Add target_close_window', sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;' },
  ];

  if (functionExists) {
    for (const fix of fixes) {
      console.log(`Applying: ${fix.name}...`);
      try {
        const { error } = await supabase.rpc('exec_ddl', { sql_text: fix.sql });
        if (error) {
          console.log(`   ⚠️  ${error.message}`);
        } else {
          console.log(`   ✅ Success\n`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${error.message}\n`);
      }
    }
  } else {
    console.log('📋 Since helper function doesn\'t exist, please run this SQL manually:\n');
    fixes.forEach(fix => {
      console.log(`-- ${fix.name}`);
      console.log(`${fix.sql}\n`);
    });
    console.log('In Supabase SQL Editor: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
  }
}

async function main() {
  console.log('🔧 Automatic Supabase Schema Fix\n');
  console.log('This will fix the schema to match what the server expects.\n');

  const functionExists = await createExecFunction();
  await applyFixes(functionExists);

  console.log('✅ Done! Your schema should now be fixed.');
  console.log('   Try submitting the form again.\n');
}

main().catch(console.error);
