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

async function executeSQLViaPostgREST(sql) {
  // Supabase uses PostgREST which doesn't support DDL directly
  // But we can use the service role to create a function, then call it
  
  // Approach: Use Supabase's ability to execute stored procedures
  // First create a function that can execute DDL, then use it
  
  console.log('Creating helper function...');
  
  // Create exec_sql function using Supabase REST API
  // We'll use the PostgREST API directly with service role
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

  // Try to execute this via Supabase's SQL endpoint
  // Supabase doesn't have a direct SQL endpoint, but we can use the Management API
  
  // Use fetch to call Supabase's database directly
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  // Try using Supabase's PostgREST API to execute SQL
  // This requires the function to already exist (chicken-and-egg)
  
  // Alternative: Use pg library with connection pooler
  const { Client } = await import('pg');
  
  // Get connection string from Supabase
  // Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
  // We need the database password, not the API key
  
  // The service role key is a JWT, not a database password
  // We need to use a different approach
  
  // Try using Supabase's REST API with a special endpoint for SQL execution
  // Some Supabase instances expose a /sql endpoint
  
  try {
    // Try Supabase's SQL Editor API endpoint (if available)
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Function doesn't exist, try to create it first
    // But we can't create it via REST API either...
    
    // Use Supabase CLI instead
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Try Supabase CLI
    try {
      console.log('Using Supabase CLI to execute SQL...');
      
      const sqlFile = join(__dirname, 'fix-schema.sql');
      const sql = readFileSync(sqlFile, 'utf-8');
      
      // Write to temp file
      const tempFile = join(__dirname, 'temp-fix.sql');
      require('fs').writeFileSync(tempFile, sql);
      
      // Execute via CLI
      const { stdout, stderr } = await execAsync(`supabase db execute --file ${tempFile}`, {
        cwd: __dirname,
        env: {
          ...process.env,
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: serviceKey,
        }
      });
      
      console.log(stdout);
      if (stderr && !stderr.includes('warning')) {
        console.error(stderr);
      }
      
      // Clean up
      require('fs').unlinkSync(tempFile);
      
      return { success: true };
    } catch (cliError) {
      console.error('CLI error:', cliError.message);
      throw new Error('Cannot execute SQL - need database connection string or CLI');
    }
  }
}

async function main() {
  console.log('🔧 Applying Schema Fix to Supabase...\n');
  console.log('Using service role key to execute SQL...\n');

  const sqlFile = join(__dirname, 'fix-schema.sql');
  const sql = readFileSync(sqlFile, 'utf-8');

  // Remove SELECT statements (just execute DDL)
  const ddlStatements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      const upper = s.toUpperCase();
      return s && 
             !s.startsWith('--') && 
             (upper.startsWith('ALTER') || upper.startsWith('CREATE') || upper.startsWith('DROP'));
    });

  console.log(`Executing ${ddlStatements.length} DDL statements...\n`);

  for (let i = 0; i < ddlStatements.length; i++) {
    const statement = ddlStatements[i];
    console.log(`[${i + 1}/${ddlStatements.length}] ${statement.substring(0, 60)}...`);
    
    try {
      await executeSQLViaPostgREST(statement);
      console.log('   ✅ Success\n');
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      throw error;
    }
  }

  console.log('✅ Schema fixed successfully!\n');
}

main().catch(console.error);
