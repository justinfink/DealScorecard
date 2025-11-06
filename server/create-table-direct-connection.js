import pkg from 'pg';
const { Client } = pkg;

// Supabase connection using pooler
// Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres
const connectionString = 'postgresql://postgres.hujrpzqbyuyckewrkoap:z4MJW1tI3kCQjFnP@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

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

async function createTable() {
  console.log('🔧 Creating submissions table...\n');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      const sqlStatement = statement.trim() + ';';
      try {
        await client.query(sqlStatement);
        console.log('✅', sqlStatement.substring(0, 50) + '...');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('⚠️  Already exists');
        } else {
          console.error('❌', error.message);
          throw error;
        }
      }
    }

    // Verify
    console.log('\nVerifying...');
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'submissions';
    `);

    if (result.rows[0].count > 0) {
      console.log('✅✅✅ TABLE EXISTS! ✅✅✅\n');
    } else {
      console.error('❌ Table not found');
      process.exit(1);
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

createTable().catch(console.error);
