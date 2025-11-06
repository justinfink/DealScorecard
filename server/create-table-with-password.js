import pkg from 'pg';
const { Client } = pkg;

// Use connection pooler format
const connectionString = 'postgresql://postgres.hujrpzqbyuyckewrkoap:z4MJW1tI3kCQjFnP@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require';

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

  // Try multiple connection formats
  const connectionStrings = [
    `postgresql://postgres:z4MJW1tI3kCQjFnP@db.hujrpzqbyuyckewrkoap.supabase.co:5432/postgres?sslmode=require`,
    `postgresql://postgres.hujrpzqbyuyckewrkoap:z4MJW1tI3kCQjFnP@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`,
    `postgresql://postgres.hujrpzqbyuyckewrkoap:z4MJW1tI3kCQjFnP@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  ];

  let client;
  let connected = false;
  
  for (const connStr of connectionStrings) {
    try {
      console.log(`Trying connection: ${connStr.substring(0, 50)}...`);
      const url = new URL(connStr);
      client = new Client({
        host: url.hostname,
        port: parseInt(url.port),
        database: url.pathname.replace('/', ''),
        user: url.username,
        password: url.password,
        ssl: {
          rejectUnauthorized: false,
          require: true
        }
      });
      await client.connect();
      console.log('✅ Connected!\n');
      connected = true;
      break;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      if (client) await client.end().catch(() => {});
    }
  }
  
  if (!connected) {
    console.error('❌ Could not connect to database with any connection string');
    process.exit(1);
  }

  try {
    // Already connected from the loop above

    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      try {
        await client.query(statement.trim() + ';');
        console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Already exists:', statement.trim().substring(0, 50));
        } else {
          throw error;
        }
      }
    }

    // Verify table exists
    console.log('\nVerifying table exists...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      ORDER BY ordinal_position;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Table exists with', result.rows.length, 'columns');
      console.log('\n✅✅✅ TABLE CREATED SUCCESSFULLY! ✅✅✅\n');
    } else {
      console.error('❌ Table not found after creation');
      process.exit(1);
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

createTable().catch(console.error);
