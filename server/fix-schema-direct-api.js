import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nGet service role key from:');
  console.log('https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/settings/api\n');
  process.exit(1);
}

// Extract project ref
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function executeViaSupabaseAPI() {
  console.log('🔧 Applying schema fixes via Supabase API...\n');

  // Supabase doesn't expose DDL via REST API directly
  // But we can use the Management API or database functions
  // Let's try using Supabase's database REST API with service role
  
  const fixes = [
    'ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;',
    'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;',
  ];

  // Try using Supabase's SQL Editor API endpoint
  // This might work with service role key
  try {
    for (const sql of fixes) {
      console.log(`Executing: ${sql.substring(0, 60)}...`);
      
      // Try Supabase's database query endpoint
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
        console.log('   ✅ Success\n');
      } else {
        const error = await response.text();
        console.log(`   ⚠️  Failed: ${error.substring(0, 100)}\n`);
      }
    }
  } catch (error) {
    console.log('❌ API approach failed:', error.message);
    console.log('\n📋 Supabase REST API doesn\'t support direct SQL execution.');
    console.log('   Please run server/fix-schema.sql manually:\n');
    console.log('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
    
    const sql = `
-- Make email nullable
ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;

-- Add missing columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;
    `.trim();
    
    console.log(sql);
  }
}

executeViaSupabaseAPI();
