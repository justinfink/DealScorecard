import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key for backend to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Make Supabase optional - don't fail if not configured
let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role' : 'anon';
    console.log(`Supabase client initialized with ${keyType} key`);
  } catch (error) {
    console.warn('Failed to initialize Supabase:', error.message);
    supabase = null;
  }
} else {
  console.warn('Supabase environment variables not set - database features disabled');
  console.warn('Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in server/.env to enable database storage');
}

export { supabase };

// Initialize database table (run this once or use Supabase dashboard)
export const initializeDatabase = async () => {
  // You can run this SQL in Supabase SQL Editor:
  /*
  CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
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
    scorecard JSONB
  );
  */
  
  console.log('Make sure to create the submissions table in Supabase. See server/supabase.js for SQL.');
};
