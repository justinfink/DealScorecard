import dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.SUPABASE_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1anJwenFieXV5Y2tld3Jrb2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM4NjA1OSwiZXhwIjoyMDc3OTYyMDU5fQ.TBbKbWd-_Hm4cxNSujOPhJsPxeqRV3tuv0chFB3CWJM";
const projectRef = 'hujrpzqbyuyckewrkoap';

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

async function createTableViaManagementAPI() {
  console.log('🔧 Creating table via Supabase Management API...\n');

  try {
    // Use Supabase Management API
    // Endpoint: https://api.supabase.com/v1/projects/{project_ref}/database/sql
    const url = `https://api.supabase.com/v1/projects/${projectRef}/database/sql`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('\n✅ Table creation request sent successfully!');
      return true;
    } else {
      console.error('\n❌ Failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

createTableViaManagementAPI().then(success => {
  if (success) {
    console.log('\n✅✅✅ TABLE CREATION INITIATED! ✅✅✅\n');
    console.log('Waiting 5 seconds for table to be created...\n');
    setTimeout(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const { default: dotenv } = await import('dotenv');
      dotenv.config();
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data, error } = await supabase.from('submissions').select('id').limit(1);
      if (error && error.code === 'PGRST205') {
        console.log('⚠️  Table not created yet, may need manual creation');
        process.exit(1);
      } else if (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
      } else {
        console.log('✅✅✅ TABLE EXISTS AND IS ACCESSIBLE! ✅✅✅');
        process.exit(0);
      }
    }, 5000);
  } else {
    process.exit(1);
  }
}).catch(console.error);
