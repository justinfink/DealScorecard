import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function executeSQL(sql) {
  // Use Supabase's REST API to execute SQL via a stored procedure
  // First, create the procedure if it doesn't exist, then use it
  
  // Try to create exec_sql function via REST API
  // We'll use Supabase's ability to execute functions via RPC
  
  // Approach: Create a function that can execute SQL, then call it
  // But we can't create a function via REST API either...
  
  // Alternative: Use Supabase's PostgREST API with service role
  // to directly execute SQL via a special endpoint
  
  // Actually, Supabase has a way to execute SQL via the REST API
  // using the service role key and a special endpoint
  
  // Try using the Supabase REST API with service role to execute SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (response.ok) {
    return { success: true };
  } else {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
}

async function createExecFunction() {
  const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE query;
END;
$$;
  `.trim();

  // Try to create the function using Supabase REST API
  // We'll use a workaround: create it via a migration or direct SQL execution
  
  // Use Supabase's database connection string with service role
  // But we need the actual database password, not the API key
  
  // Better approach: Use Supabase CLI if available
  // Or use pg library with connection string
  
  throw new Error('Need database connection string or CLI');
}

async function main() {
  console.log('🔧 Executing Schema Fix via Supabase...\n');

  // Read the SQL file
  const sqlFile = join(__dirname, 'fix-schema.sql');
  const sql = readFileSync(sqlFile, 'utf-8');

  // Split into statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.toLowerCase().startsWith('select'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  try {
    // First, try to create the exec_sql function
    await createExecFunction();
    
    // Then execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      await executeSQL(statement);
      console.log('✅ Success\n');
    }
    
    console.log('✅ Schema fixed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Falling back to Supabase CLI or direct connection...\n');
    
    // Try using Supabase CLI
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      console.log('Trying Supabase CLI...');
      // Write SQL to temp file
      const tempFile = join(__dirname, 'temp-schema-fix.sql');
      require('fs').writeFileSync(tempFile, sql);
      
      // Execute via Supabase CLI
      const { stdout, stderr } = await execAsync(`supabase db execute --file ${tempFile}`, {
        cwd: __dirname,
        env: { ...process.env, SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: serviceKey }
      });
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      console.log('✅ Schema fixed via CLI!\n');
      
      // Clean up
      require('fs').unlinkSync(tempFile);
    } catch (cliError) {
      console.error('CLI not available:', cliError.message);
      throw error;
    }
  }
}

main().catch(console.error);