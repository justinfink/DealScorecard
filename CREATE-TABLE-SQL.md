# Create Submissions Table

**The table does NOT exist yet.** You need to create it manually.

## Steps:

1. Go to: https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql

2. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  form_data JSONB,
  background TEXT,
  interests TEXT,
  experience TEXT,
  scorecard JSONB,
  searcher_name TEXT,
  home_base TEXT,
  target_close_window TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_form_data ON submissions USING GIN (form_data);
```

3. Click "Run"

4. After that, submissions will save to the database automatically!

---

**Current Status:**
- ✅ Site: http://localhost:5173 - Running
- ✅ Backend: http://localhost:3001 - Running  
- ✅ Code: Ready for submissions
- ❌ Database table: **MUST BE CREATED** (see above)

