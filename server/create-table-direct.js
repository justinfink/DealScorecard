import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Extract project ref
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref');
  process.exit(1);
}

// For Supabase, we need the actual database password, not the service role key
// The service role key is a JWT for API authentication
// We need to get the database connection string from Supabase settings

console.log('❌ Cannot create table without database password.');
console.log('   Service role key is a JWT, not a database password.');
console.log('\n📋 To get your database password:');
console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/database');
console.log('   2. Find "Connection string" section');
console.log('   3. Copy the password from the connection string');
console.log('   4. Or reset it if needed');
console.log('\n💡 OR create the table via SQL Editor:');
console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql');
console.log('\n   Run: server/create-table.sql\n');

process.exit(1);
