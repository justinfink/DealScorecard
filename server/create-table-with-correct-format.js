import pkg from 'pg';
const { Client } = pkg;

// Based on Supabase documentation, the connection string format is:
// postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres
// For direct connection: postgresql://postgres:[PASSWORD]@[DIRECT_HOST]:5432/postgres

const password = 'z4MJW1tI3kCQjFnP';
const projectRef = 'hujrpzqbyuyckewrkoap';

// Try pooler connection - username should be just 'postgres' for pooler
// For direct connection, use: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
// But we need the actual host. Let's try pooler with standard format
const connectionString = `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

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
  console.log('🔧 Creating submissions table via Supabase pooler...\n');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      const sqlStatement = statement.trim() + ';';
      try {
        await client.query(sqlStatement);
        console.log('✅ Executed:', sqlStatement.substring(0, 50) + '...');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('⚠️  Already exists:', sqlStatement.substring(0, 40));
        } else {
          console.error('❌ Error:', error.message);
          throw error;
        }
      }
    }

    // Verify table exists
    console.log('\nVerifying table...');
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'submissions';
    `);

    if (parseInt(result.rows[0].count) > 0) {
      console.log('✅✅✅ TABLE CREATED AND VERIFIED! ✅✅✅\n');
    } else {
      console.error('❌ Table verification failed');
      process.exit(1);
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Code:', error.code);
    if (error.code === '28P01' || error.message.includes('password')) {
      console.error('\n⚠️  Authentication failed. Check password.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Host not found. Check connection string format.');
    }
    await client.end().catch(() => {});
    process.exit(1);
  }
}

createTable().catch(console.error);
