import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const createTableSQL = `
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  form_data JSONB,
  background TEXT,
  interests TEXT,
  experience TEXT,
  employee_ranges JSONB,
  revenue_ranges JSONB,
  locations JSONB,
  customers TEXT,
  business_model JSONB,
  end_customer TEXT,
  naics_codes JSONB,
  subindustries JSONB,
  risks JSONB,
  deal_killers JSONB,
  scorecard JSONB,
  searcher_name TEXT,
  home_base TEXT,
  target_close_window TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_form_data ON submissions USING GIN (form_data);
`.trim();

async function createTable() {
  console.log('🔧 Creating submissions table via Supabase API...\n');

  // Try using RPC function to execute SQL
  try {
    // First, try to create exec_sql function if it doesn't exist
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
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

    console.log('Creating helper function...');
    const { error: funcError } = await supabase.rpc('exec_sql', { sql_text: createFunctionSQL });
    
    if (funcError && !funcError.message.includes('already exists')) {
      console.log('⚠️  Function creation failed, will use direct SQL');
    } else {
      console.log('✅ Helper function ready');
    }

    // Execute table creation
    console.log('Creating table...');
    const statements = createTableSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      const { error } = await supabase.rpc('exec_sql', { sql_text: statement.trim() + ';' });
      if (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('   ⚠️  ' + error.message.substring(0, 60));
        } else {
          console.error('   ❌ ' + error.message);
        }
      } else {
        console.log('   ✅ Success');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Using Supabase CLI instead...\n');
    return false;
  }

  // Verify table exists
  console.log('\nVerifying table exists...');
  const { data, error } = await supabase
    .from('submissions')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === 'PGRST205') {
      console.error('❌ Table still does not exist');
      console.log('\n📋 Please create the table manually:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql');
      console.log('   2. Run: server/create-table.sql');
      return false;
    }
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✅ Table exists and is accessible!');
  return true;
}

createTable().then(success => {
  if (success) {
    console.log('\n✅✅✅ TABLE CREATED SUCCESSFULLY! ✅✅✅\n');
    process.exit(0);
  } else {
    console.log('\n❌ Table creation failed - please create manually\n');
    process.exit(1);
  }
}).catch(console.error);
