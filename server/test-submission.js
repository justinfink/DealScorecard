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

async function testSubmission() {
  console.log('🧪 Testing Supabase submission...\n');

  const testData = {
    email: 'test@example.com',
    background: 'Test background',
    interests: 'Test interests',
    experience: 'Test experience',
    scorecard: [],
    form_data: { test: true },
    searcher_name: 'Test User',
    home_base: 'NYC',
    target_close_window: 'Q1 2025',
  };

  console.log('Inserting test data...');
  const { data, error } = await supabase
    .from('submissions')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error('❌ INSERT FAILED:', error.code, error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  if (!data) {
    console.error('❌ No data returned');
    process.exit(1);
  }

  console.log('✅ INSERT SUCCESSFUL!');
  console.log('Submission ID:', data.id);
  console.log('Email:', data.email);
  console.log('Created at:', data.submitted_at);

  // Verify we can read it back
  console.log('\nVerifying read...');
  const { data: readData, error: readError } = await supabase
    .from('submissions')
    .eq('id', data.id)
    .single();

  if (readError) {
    console.error('❌ READ FAILED:', readError.message);
    process.exit(1);
  }

  console.log('✅ READ SUCCESSFUL!');
  console.log('Verified submission exists in database.\n');
  console.log('✅✅✅ DATABASE SAVE IS WORKING! ✅✅✅\n');
}

testSubmission().catch(console.error);
