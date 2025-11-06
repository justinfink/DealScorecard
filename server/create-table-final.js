import pkg from 'pg';
const { Client } = pkg;

// Supabase direct connection format
// Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
const password = 'z4MJW1tI3kCQjFnP';
const projectRef = 'hujrpzqbyuyckewrkoap';

// Try direct connection (port 5432) - this is the standard format
const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

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
  console.log('🔧 Creating submissions table via direct database connection...\n');
  console.log('Connection:', connectionString.substring(0, 50) + '...\n');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!\n');

    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      const sqlStatement = statement.trim() + ';';
      try {
        await client.query(sqlStatement);
        console.log('✅ Executed:', sqlStatement.substring(0, 60) + '...');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('⚠️  Already exists:', sqlStatement.substring(0, 50));
        } else {
          console.error('❌ Error:', error.message);
          throw error;
        }
      }
    }

    // Verify table exists
    console.log('\nVerifying table exists...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'submissions' 
      ORDER BY ordinal_position;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Table exists with', result.rows.length, 'columns');
      result.rows.slice(0, 5).forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
      console.log('\n✅✅✅ TABLE CREATED SUCCESSFULLY! ✅✅✅\n');
    } else {
      console.error('❌ Table not found after creation');
      process.exit(1);
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

createTable().catch(console.error);
