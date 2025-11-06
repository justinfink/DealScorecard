import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Use Supabase Management API to create table
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function createTableViaAPI() {
  console.log('🔧 Creating table via Supabase Management API...\n');

  const sql = `
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

  // Try Supabase Management API
  // Note: This typically requires database password, not API key
  // But let's try using the REST API endpoint for SQL execution
  
  try {
    // Use Supabase's database REST API
    // Format: https://[project].supabase.co/rest/v1/rpc/exec_sql
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (response.ok) {
      console.log('✅ Table creation request sent');
      const result = await response.json();
      console.log('Result:', result);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ API call failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

createTableViaAPI().then(success => {
  if (!success) {
    console.log('\n📋 Supabase REST API cannot execute DDL directly.');
    console.log('   Please create the table manually:');
    console.log('   1. https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql');
    console.log('   2. Run: server/create-table.sql\n');
  }
});
