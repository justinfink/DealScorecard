# Torchlight Onboarding Platform

Interactive web-based tool for onboarding searchers to Torchlight, the Operating System for ETA (Entrepreneurship Through Acquisition).

## Features

- **Infinite Scroll Form**: Single-page intake form with 13 granular sections
- **Deal Scorecard Builder**: Pre-built and fully editable criteria with automatic weight/score calculations
- **Supabase Integration**: Automatic data persistence to Supabase database
- **PDF Export**: Automatic PDF generation and download on submission
- **Sticky Sidebar Navigation**: Section indicators with scroll spy and completion tracking
- **Form Suggestions**: Smart suggestions for timezones, ranges, and other inputs

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: Puppeteer (server-side) + jsPDF/html2canvas (client-side fallback)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Database password for Supabase

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DealScorecard
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Set up environment variables:
   - Copy `server/.env.example` to `server/.env` (if exists)
   - Or create `server/.env` with:
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Create the database table in Supabase SQL Editor:
   - Go to your Supabase project SQL Editor
   - Run the SQL from `server/create-table.sql` or `CREATE-TABLE-SQL.md`

### Running the Application

1. Start the backend server:
```bash
cd server
node server.js
```

2. Start the frontend dev server (in a new terminal):
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## Project Structure

```
DealScorecard/
├── src/
│   ├── components/          # React form components
│   ├── utils/              # Utilities (storage, PDF export, initial data)
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx             # Entry point
├── server/
│   ├── server.js           # Express backend server
│   ├── supabase.js          # Supabase client initialization
│   ├── pdfGenerator.js      # Server-side PDF generation
│   └── .env                # Environment variables (not in git)
└── README.md
```

## Form Sections

1. **Contact**: Email collection
2. **Quick Summary**: Searcher name, home base, thesis, right-to-win bullets
3. **Background & Edge**: Experience map and credibility anchors
4. **Deal Scorecard**: Pre-built criteria with weights and scores
5. **Priorities & Non-Negotiables**: Priority stack and exclusion lists
6. **Search Constraints**: Revenue/EBITDA/headcount bands, geography, deal structures
7. **Right-to-Win Mechanics**: Detailed mechanics and playbooks
8. **ICP & Buying Motion**: Target customer profiles and buying processes
9. **Risk Areas & Mitigations**: Risk identification and mitigation strategies
10. **Sub-Niche Identification**: Specific sub-niches of interest
11. **Deal Flow Sufficiency**: Pipeline requirements and sources
12. **Operating Plan Hooks**: Integration and operational considerations
13. **Funnel & KPI**: Metrics and tracking requirements
14. **Decision Gate**: Go/no-go criteria and decision framework

## Submission Flow

1. User fills out the form (data auto-saves to localStorage)
2. User clicks "Submit"
3. Data is sent to backend API (`/api/submit`)
4. Backend saves to Supabase database
5. Backend generates filled PDF
6. PDF is returned and automatically downloaded to user's device

## Development

- Frontend runs on Vite dev server (port 5173)
- Backend runs on Express (port 3001)
- Vite proxy configured for `/api/*` requests to backend
- TypeScript for type safety
- Tailwind CSS for styling

## License

Private project for Torchlight.
