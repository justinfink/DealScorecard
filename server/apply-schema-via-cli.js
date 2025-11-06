import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const execAsync = promisify(exec);

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from Supabase URL');
  process.exit(1);
}

async function executeViaCLI() {
  console.log('🔧 Applying Schema Fix via Supabase CLI...\n');
  
  // First, link the project if not already linked
  try {
    console.log('Linking to Supabase project...');
    await execAsync(`npx supabase link --project-ref ${projectRef}`, {
      cwd: __dirname,
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: serviceKey, // May need access token instead
      }
    });
    console.log('✅ Project linked\n');
  } catch (error) {
    // Project might already be linked, continue
    if (!error.message.includes('already linked')) {
      console.log('⚠️  Link step skipped (may already be linked)\n');
    }
  }

  // Read SQL file
  const sqlFile = join(__dirname, 'fix-schema.sql');
  const sql = readFileSync(sqlFile, 'utf-8');

  // Execute SQL via CLI
  try {
    console.log('Executing SQL...\n');
    
    // Use Supabase CLI to execute SQL
    // Write SQL to temp file
    const { writeFileSync, unlinkSync } = await import('fs');
    const tempFile = join(__dirname, 'temp-schema-fix.sql');
    writeFileSync(tempFile, sql);
    
    // Execute via CLI - use db push or execute command
    const { stdout, stderr } = await execAsync(`npx supabase db execute --file "${tempFile}"`, {
      cwd: __dirname,
      env: {
        ...process.env,
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: serviceKey,
      }
    });
    
    console.log(stdout);
    if (stderr && !stderr.toLowerCase().includes('warning')) {
      console.error('⚠️  Warnings:', stderr);
    }
    
    // Clean up
    unlinkSync(tempFile);
    
    console.log('\n✅ Schema fixed successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ CLI execution failed:', error.message);
    
    // Try alternative: direct SQL execution via REST API with helper function
    console.log('\n💡 Trying alternative method...\n');
    return false;
  }
}

async function executeViaDirectConnection() {
  console.log('🔧 Trying direct database connection...\n');
  
  const { Client } = await import('pg');
  
  // For direct connection, we need the database password
  // The service role key is a JWT, not a database password
  
  // Try to get connection string from Supabase settings
  // Or construct it using the service role key
  
  // Actually, Supabase connection pooler can use JWT authentication
  // Format: postgresql://postgres.[ref]:[jwt]@aws-0-[region].pooler.supabase.com:6543/postgres
  
  // Extract region from URL (if available) or use default
  const region = 'us-east-1'; // Default, might need to detect
  
  // Try connection with JWT as password (this might work for some endpoints)
  const connectionString = `postgresql://postgres.${projectRef}:${serviceKey}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read and execute SQL
    const sqlFile = join(__dirname, 'fix-schema.sql');
    const sql = readFileSync(sqlFile, 'utf-8');
    
    // Execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.toUpperCase().startsWith('SELECT'));
    
    for (const statement of statements) {
      if (!statement) continue;
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      await client.query(statement);
      console.log('   ✅ Success\n');
    }
    
    await client.end();
    console.log('✅ Schema fixed successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    console.log('\n💡 JWT authentication may not work for direct connections.');
    console.log('   Need database password instead.\n');
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  console.log('🚀 Applying Supabase Schema Fix\n');
  console.log('Project:', projectRef);
  console.log('Service role key: ✅ Configured\n');

  // Try CLI first
  const cliSuccess = await executeViaCLI();
  
  if (!cliSuccess) {
    // Try direct connection
    const directSuccess = await executeViaDirectConnection();
    
    if (!directSuccess) {
      console.error('\n❌ All automated methods failed.');
      console.log('\n📋 Manual execution required:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql');
      console.log('   2. Copy SQL from: server/fix-schema.sql');
      console.log('   3. Paste and run\n');
      process.exit(1);
    }
  }
}

main().catch(console.error);
