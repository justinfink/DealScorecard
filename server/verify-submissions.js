import { supabase } from './supabase.js';

async function verifySubmissions() {
  console.log('🔍 Checking recent submissions in database...\n');

  const { data, error } = await supabase
    .from('submissions')
    .select('id, email, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log(`✅ Found ${data.length} submission(s) in database:\n`);
  data.forEach((submission, i) => {
    console.log(`${i + 1}. ID: ${submission.id}`);
    console.log(`   Email: ${submission.email || 'no email'}`);
    console.log(`   Submitted: ${submission.submitted_at}`);
    console.log('');
  });

  console.log('✅✅✅ DATABASE VERIFICATION COMPLETE! ✅✅✅');
}

verifySubmissions().catch(console.error);
