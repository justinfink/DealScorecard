# Torchlight Backend Server

Backend API server for handling Torchlight onboarding form submissions using Supabase.

## Features

- RESTful API endpoints for form submission
- Supabase database integration
- Automatic PDF generation with filled form data
- PDF download on submission

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Supabase

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Project Settings > API
4. Copy your project URL and anon key

### 3. Create Database Table

Run this SQL in the Supabase SQL Editor:

```sql
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
```

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### POST `/api/submit`
Submit onboarding form data and receive a PDF.

**Request Body:**
```json
{
  "email": "user@example.com",
  "background": { ... },
  "filters": { ... },
  "scorecard": [ ... ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission received successfully",
  "submissionId": "uuid",
  "pdf": "base64-encoded-pdf-string"
}
```

### GET `/api/health`
Health check endpoint.

### GET `/api/submissions`
Get all submissions (admin endpoint - should be protected in production).

### GET `/api/submissions/:id`
Get a specific submission by ID.

## PDF Generation

The server uses Puppeteer to generate PDFs from HTML templates. The PDF includes:
- All form data filled in
- Professional formatting
- Properly formatted tables and lists
- Ready for printing or sharing

PDFs are automatically downloaded when the user submits the form.

## Production Deployment

### Recommended Setup:

1. **Database**: Supabase handles this automatically
2. **Environment**: Set `NODE_ENV=production`
3. **Security**: 
   - Add authentication to admin endpoints
   - Use Row Level Security (RLS) in Supabase
   - Validate and sanitize all inputs
4. **Hosting**: Deploy to services like:
   - Railway
   - Render
   - Heroku
   - AWS
   - DigitalOcean

### Environment Variables for Production

Make sure to set:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `PORT` - Server port (usually set by hosting provider)
- `NODE_ENV=production`

## Development with Frontend

The frontend is configured to proxy API requests to `http://localhost:3001`. Make sure both servers are running:

1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev`

## Troubleshooting

**Supabase connection errors:**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that the submissions table exists
- Ensure your Supabase project is active

**PDF generation errors:**
- Puppeteer requires additional system dependencies on Linux
- Check server logs for detailed error messages
- PDF generation is non-blocking - submissions are still saved even if PDF fails

**CORS errors:**
- Ensure frontend URL is allowed in CORS configuration