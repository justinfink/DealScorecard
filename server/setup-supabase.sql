-- Run this SQL in your Supabase SQL Editor to create the submissions table

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,  -- Made nullable to allow partial submissions
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  -- Store entire form data as JSON for flexibility
  form_data JSONB,
  -- Legacy fields (kept for backward compatibility)
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
  -- New structured fields from updated form
  searcher_name TEXT,
  home_base TEXT,
  target_close_window TEXT
);

-- Optional: Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);

-- Optional: Create an index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
