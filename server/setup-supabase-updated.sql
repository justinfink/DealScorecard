-- Run this SQL in your Supabase SQL Editor to update the submissions table
-- This adds support for the new form structure

-- Add new columns for the updated form structure
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS form_data JSONB,
ADD COLUMN IF NOT EXISTS searcher_name TEXT,
ADD COLUMN IF NOT EXISTS home_base TEXT,
ADD COLUMN IF NOT EXISTS target_close_window TEXT;

-- If table doesn't exist, create it with all columns
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
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
  -- New structured fields
  searcher_name TEXT,
  home_base TEXT,
  target_close_window TEXT
);

-- Optional: Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);

-- Optional: Create an index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);

-- Optional: Create a GIN index on form_data for JSON queries
CREATE INDEX IF NOT EXISTS idx_submissions_form_data ON submissions USING GIN (form_data);
