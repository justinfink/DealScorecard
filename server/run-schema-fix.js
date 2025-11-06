import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE key in .env');
  console.log('💡 Tip: Get your service role key from Supabase Dashboard > Settings > API');
  process.exit(1);
}

// Use service role key if available, otherwise use anon key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  // Supabase doesn't have a direct SQL execution endpoint via REST API
  // We need to use the REST API with service role key
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (error) {
    // Fallback: try direct SQL via Supabase client (if it supports it)
    throw error;
  }
}

async function fixSchema() {
  console.log('🔧 Fixing Supabase schema using direct API calls...\n');

  try {
    // Read the SQL file
    const sqlFile = join(__dirname, 'fix-schema.sql');
    const sql = readFileSync(sqlFile, 'utf-8');

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 60)}...`);

      try {
        // Use Supabase REST API to execute SQL
        // Note: This requires a function in Supabase, or we use the Management API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (response.ok) {
          console.log('   ✅ Success');
        } else {
          const errorText = await response.text();
          console.log(`   ⚠️  Failed: ${errorText.substring(0, 100)}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
      }
    }

    console.log('\n📋 Note: Supabase REST API may not support direct SQL execution.');
    console.log('   The most reliable way is to:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of server/fix-schema.sql');
    console.log('   3. Paste and click Run\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please run server/fix-schema.sql manually in Supabase SQL Editor');
  }
}

// Alternative: Create a Supabase function that can execute SQL
// Then call it via RPC
async function createExecFunction() {
  console.log('Creating exec_sql function in Supabase...');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `;

  // This would need to be run manually in Supabase SQL Editor first
  console.log('Please run this in Supabase SQL Editor first:');
  console.log(createFunctionSQL);
}

fixSchema();
