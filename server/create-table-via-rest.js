import fetch from 'node-fetch';

const SUPABASE_URL = 'https://hujrpzqbyuyckewrkoap.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1anJwenFieXV5Y2tld3Jrb2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM4NjA1OSwiZXhwIjoyMDc3OTYyMDU5fQ.TBbKbWd-_Hm4cxNSujOPhJsPxeqRV3tuv0chFB3CWJM';

const sql = `
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  form_data JSONB,
  background TEXT,
  interests TEXT,
  experience TEXT,
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
  console.log('🔧 Attempting to create table via Supabase REST API...\n');

  try {
    // Use the rpc endpoint to execute SQL (if available)
    // Or use the REST API query endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('\n✅ Table creation request sent!');
      return true;
    } else {
      console.log('\n⚠️  REST API method not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

createTable().then(success => {
  if (!success) {
    console.log('\n📋 Manual creation required:');
    console.log('Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql');
    console.log('\nRun this SQL:');
    console.log(sql);
  }
}).catch(console.error);
