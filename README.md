# Torchlight - Operating System for ETA

An interactive web-based onboarding tool for Torchlight, designed to help users set up their profiles and preferences for Entrepreneur Through Acquisition (ETA) opportunities.

## Features

### 1. User Background & Interests
- Professional background input
- Interests and goals description
- Relevant experience documentation

### 2. Deal Filters
- **Employee Ranges**: Select from predefined ranges (1-10, 11-25, etc.)
- **Revenue Ranges**: Choose revenue brackets ($0-500K, $500K-1M, etc.)
- **Locations**: Add multiple preferred locations
- **Customer Type**: Specify B2B, B2C, B2G, etc.
- **Business Model**: Select from SaaS, Services, Manufacturing, Distribution, E-commerce, Marketplace, or Other
- **End Customer**: Define target customer profile
- **NAICS Codes**: Add industry classification codes
- **Subindustries**: List early subindustries of interest
- **Risks**: Document areas of outreach risk
- **Deal Killers**: Specify criteria that would disqualify a deal

### 3. Interactive Deal Scorecard Builder
- Add/remove evaluation criteria dynamically
- Set priority order (drag up/down)
- Assign rankings (0-10 scale)
- Set weights (percentage-based)
- Auto-summing totals at the bottom
- Visual indicators for weight totals (should sum to 100%)
- Weighted score calculation

### 4. Review Page
- Complete overview of all entered information
- Easy navigation back to any step for edits

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for icons
- **LocalStorage** for data persistence

### Backend
- **Express.js** for RESTful API
- **Supabase** for database and backend services
- **Puppeteer** for PDF generation
- **CORS** enabled for frontend integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

#### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

#### Backend Setup

1. Navigate to server directory:
```bash
cd server
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Set up Supabase:
   - Create a Supabase account at https://supabase.com
   - Create a new project
   - Get your project URL and anon key from Settings > API
   - Run the SQL from `server/.env.example` in Supabase SQL Editor to create the table

4. Configure your `.env` file:
   - Set `SUPABASE_URL` to your Supabase project URL
   - Set `SUPABASE_ANON_KEY` to your Supabase anon key
   - See `server/README.md` for detailed instructions

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Building for Production

**Frontend:**
```bash
npm run build
```

The built files will be in the `dist` directory.

**Backend:**
See `server/README.md` for production deployment instructions.

## Usage

1. **Contact Step**: Enter your email address (required for submission)
2. **Background Step**: Fill out your professional background, interests, and experience
3. **Deal Filters Step**: Configure your deal preferences across all filter categories
4. **Scorecard Step**: Build your evaluation criteria with priorities, rankings, and weights
5. **Review Step**: Review all information and complete onboarding

All data is automatically saved to localStorage as you progress through the steps.

### Form Submission

When you complete the onboarding:
- Data is saved to Torchlight's Supabase database
- A filled PDF with your responses is automatically downloaded
- The PDF includes all your information in a professional format

## Project Structure

```
src/
├── components/
│   ├── BackgroundForm.tsx      # User background form
│   ├── DealFiltersForm.tsx     # Deal filters configuration
│   └── ScorecardBuilder.tsx    # Interactive scorecard builder
├── types.ts                    # TypeScript type definitions
├── utils/
│   └── storage.ts              # LocalStorage utilities
├── App.tsx                     # Main application component
├── main.tsx                    # Entry point
└── index.css                   # Global styles
```

## Features in Detail

### Scorecard Builder
- **Priority Management**: Use up/down arrows to reorder criteria
- **Ranking System**: Rate each criterion from 0-10
- **Weight System**: Assign percentage weights (should total 100%)
- **Auto-calculation**: Total rankings and weights are automatically calculated
- **Visual Feedback**: Color-coded indicators for weight totals

### Data Persistence
All onboarding data is automatically saved to browser localStorage. This means:
- Data persists across page refreshes
- Users can continue where they left off
- No backend required for basic functionality

## License

Private project - All rights reserved
