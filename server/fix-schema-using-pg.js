import pkg from 'pg';
const { Client } = pkg;
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

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from Supabase URL');
  process.exit(1);
}

// Supabase connection pooler URL
// Use the direct connection (port 5432) with service role key
// Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
// But we need the actual database password, not the API key

// The service role key is a JWT for API authentication, not a database password
// For direct database connections, we need the actual database password

// Alternative: Use Supabase's connection pooler with service role authentication
// But that still requires the database password

console.log('🔧 Supabase Schema Fix\n');
console.log('⚠️  Direct database connection requires the database password, not the API key.');
console.log('   The service role key is for API authentication, not database connections.\n');

console.log('📋 To get your database password:');
console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/database');
console.log('   2. Find "Connection string" section');
console.log('   3. Copy the password from the connection string');
console.log('   4. Or reset it if needed\n');

console.log('💡 OR (Easiest): Just run the SQL manually:\n');
console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql');
console.log('   2. Copy this SQL:\n');

const sql = readFileSync(join(__dirname, 'fix-schema.sql'), 'utf-8');
console.log(sql);

console.log('\n   3. Paste and click "Run"\n');
console.log('✅ Done in 30 seconds!\n');

process.exit(0);
