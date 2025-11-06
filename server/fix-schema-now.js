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

// Use service role key if available (has permission for DDL), otherwise anon key
const key = serviceKey || anonKey;
const supabase = createClient(supabaseUrl, key);

async function applySchemaFixes() {
  console.log('🔧 Applying Supabase schema fixes...\n');

  if (!serviceKey) {
    console.log('⚠️  No SUPABASE_SERVICE_ROLE_KEY found.');
    console.log('   The anon key cannot execute DDL (schema changes).');
    console.log('   Getting service role key:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api');
    console.log('   2. Copy the "service_role" key (secret, not anon key)');
    console.log('   3. Add to server/.env: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('   4. Run this script again\n');
    return;
  }

  console.log('✅ Using service role key - can execute schema changes\n');

  // The SQL statements we need to execute
  const sqlStatements = [
    'ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;',
  ];

  // Supabase doesn't expose direct SQL execution via REST API
  // We need to use the Management API or create a function
  // Let's try using the Supabase client's ability to call functions
  
  // First, create a helper function that can execute SQL
  // This needs to be done once via SQL Editor, then we can call it
  
  console.log('Creating helper function (if it doesn\'t exist)...');
  
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
  `;

  // Try to execute via raw HTTP request to Supabase
  try {
    console.log('Attempting to create helper function...');
    
    // Use fetch to call Supabase's REST API directly
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
      console.log('✅ Helper function created');
    } else {
      console.log('⚠️  Could not create function via API (need to create manually)');
      console.log('   Run this in Supabase SQL Editor:');
      console.log(createFunctionSQL);
      console.log('');
    }
  } catch (error) {
    console.log('⚠️  API call failed:', error.message);
    console.log('   Please create the function manually (see above)\n');
  }

  // Now execute the schema fixes
  console.log('\nApplying schema fixes...\n');
  
  for (const sql of sqlStatements) {
    const statement = sql.trim();
    console.log(`Executing: ${statement.substring(0, 60)}...`);
    
    try {
      // Try calling the exec_ddl function if it exists
      const { data, error } = await supabase.rpc('exec_ddl', {
        sql_text: statement
      });

      if (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
        console.log(`   💡 Run this SQL manually in Supabase SQL Editor: ${statement}`);
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${error.message}`);
      console.log(`   💡 Run this SQL manually: ${statement}`);
    }
    console.log('');
  }

  console.log('📋 Summary:');
  console.log('   If all fixes succeeded, your schema is now updated!');
  console.log('   If not, please run server/fix-schema.sql manually in Supabase SQL Editor.');
  console.log('   URL: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
}

applySchemaFixes().catch(console.error);
