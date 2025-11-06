import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('🔧 Fixing Supabase schema...\n');

  try {
    // Check current table structure
    console.log('1. Checking current table structure...');
    const { data: columns, error: checkError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'submissions' 
          ORDER BY ordinal_position;
        `
      });

    if (checkError) {
      console.log('   (Could not check structure - will proceed with fixes)');
    } else {
      console.log('   Current columns:', columns?.map(c => c.column_name).join(', ') || 'none');
    }

    // Try to make email nullable (if it's NOT NULL)
    console.log('\n2. Making email nullable...');
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;'
      });
      if (alterError) {
        console.log('   ⚠️  Could not alter email (might already be nullable or need service role)');
      } else {
        console.log('   ✅ Email is now nullable');
      }
    } catch (e) {
      console.log('   ⚠️  Could not alter email column:', e.message);
    }

    // Add missing columns
    console.log('\n3. Adding missing columns...');
    
    const columnsToAdd = [
      { name: 'form_data', type: 'JSONB' },
      { name: 'searcher_name', type: 'TEXT' },
      { name: 'home_base', type: 'TEXT' },
      { name: 'target_close_window', type: 'TEXT' }
    ];

    for (const col of columnsToAdd) {
      try {
        const { error: addError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
        });
        
        if (addError) {
          // Try alternative approach - check if column exists first
          console.log(`   ⚠️  Could not add ${col.name} directly (might need service role key)`);
        } else {
          console.log(`   ✅ Added ${col.name}`);
        }
      } catch (e) {
        console.log(`   ⚠️  ${col.name}: ${e.message}`);
      }
    }

    console.log('\n📋 Summary:');
    console.log('   The anon key may not have permission to alter schema.');
    console.log('   Please run the SQL in server/fix-schema.sql manually in Supabase SQL Editor,');
    console.log('   OR add SUPABASE_SERVICE_ROLE_KEY to .env and run this script again.\n');

    // If service role key is available, try again
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      console.log('🔑 Using service role key for schema changes...\n');
      const adminSupabase = createClient(supabaseUrl, serviceKey);
      
      try {
        await adminSupabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE submissions ALTER COLUMN email DROP NOT NULL;
            ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_data JSONB;
            ALTER TABLE submissions ADD COLUMN IF NOT EXISTS searcher_name TEXT;
            ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_base TEXT;
            ALTER TABLE submissions ADD COLUMN IF NOT EXISTS target_close_window TEXT;
          `
        });
        console.log('✅ Schema updated successfully with service role key!');
      } catch (e) {
        console.log('⚠️  Service role approach failed:', e.message);
        console.log('   Please run server/fix-schema.sql manually in Supabase SQL Editor');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please run the SQL in server/fix-schema.sql manually in Supabase SQL Editor');
  }
}

fixSchema();
