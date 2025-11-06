import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL');
  process.exit(1);
}

if (!serviceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n📝 To get your service role key:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api');
  console.log('   2. Copy the "service_role" key (keep it secret!)');
  console.log('   3. Add to server/.env: SUPABASE_SERVICE_ROLE_KEY=your-key-here');
  console.log('   4. Run this script again\n');
  process.exit(1);
}

async function executeSQL(sql) {
  // Supabase Management API endpoint for SQL execution
  // This uses the service role key to execute DDL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    throw new Error('Could not extract project ref from Supabase URL');
  }

  // Use Supabase's Management API
  const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  try {
    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey,
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    // Fallback: try using Supabase's REST API with a stored procedure
    // First, we need to create a function that can execute DDL
    throw error;
  }
}

async function fixSchema() {
  console.log('🔧 Applying Supabase schema fixes directly...\n');

  const sqlFile = join(__dirname, 'fix-schema.sql');
  const sql = readFileSync(sqlFile, 'utf-8');

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.startsWith('/*') && !s.toLowerCase().includes('select'));

  console.log(`Executing ${statements.length} schema changes...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 70)}...`);

    try {
      await executeSQL(statement);
      console.log('   ✅ Success\n');
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      
      // If Management API doesn't work, try alternative approach
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('   💡 Management API not available. Trying alternative method...\n');
        
        // Alternative: Use Supabase REST API with a stored procedure
        // We'll need to create the function first via SQL Editor
        console.log('   Please run this SQL in Supabase SQL Editor first:');
        console.log('   Then rerun this script.\n');
        console.log(`
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
        `);
        break;
      }
    }
  }

  console.log('📋 Summary:');
  console.log('   If all succeeded, your schema is updated!');
  console.log('   If not, please run server/fix-schema.sql manually:');
  console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
}

fixSchema().catch(console.error);
