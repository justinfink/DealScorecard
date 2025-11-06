# Quick Start Guide

## Running the Application

### Option 1: Using npm (Recommended)
```bash
npm run dev
```

Then open your browser to: **http://localhost:5173**

### Option 2: Using the batch file (Windows)
Double-click `start.bat` or run:
```bash
start.bat
```

### Option 3: Using PowerShell
```powershell
npm run dev
```

## What You Should See

1. In the terminal, you should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. You should see the Torchlight onboarding interface with:
   - Header with "Torchlight - Operating System for ETA"
   - Progress steps at the top (Background, Deal Filters, Scorecard, Review)
   - Form fields for entering your information

## Troubleshooting

### If you see "command not found" or "npm is not recognized":
- Make sure Node.js is installed: `node --version`
- Make sure npm is installed: `npm --version`
- If not installed, download from: https://nodejs.org/

### If the port is already in use:
- The app will try a different port (like 5174, 5175, etc.)
- Check the terminal output for the actual URL

### If you see build errors:
- Make sure all dependencies are installed: `npm install`
- Check that you're in the project directory

### If the page is blank:
- Open browser developer tools (F12)
- Check the Console tab for errors
- Make sure JavaScript is enabled

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` folder. You can serve them with any static file server.
