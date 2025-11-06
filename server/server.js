import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';
import { generateFilledPDF } from './pdfGenerator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Torchlight API is running' });
});

// Submit onboarding form
app.post('/api/submit', async (req, res) => {
  try {
    const submissionData = req.body;

    // Allow partial submissions - email is optional but preferred
    const email = submissionData.email?.trim() || null;
    
    // If email is provided, validate format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        // Don't fail - just log and continue without email
        console.warn('Invalid email format provided, continuing without email');
      }
    }

    // Save to Supabase - save entire JSON blob for flexibility
    let savedData = null;
    let dbSaved = false;
    
    if (supabase) {
      try {
        // Build insert object - try with all columns, fallback to minimal if needed
        const insertDataFull = {
          email: email || null,
          background: submissionData.backgroundEdge?.experienceMap?.functionalStrengths || null,
          interests: submissionData.quickSummary?.primaryThesis || null,
          experience: submissionData.backgroundEdge?.experienceMap?.dealExposure || null,
          scorecard: submissionData.scorecard || [],
          // Try optional columns - will be removed if they don't exist
          form_data: submissionData,
          searcher_name: submissionData.quickSummary?.searcherName || null,
          home_base: submissionData.quickSummary?.homeBase || null,
          target_close_window: submissionData.quickSummary?.targetCloseWindow || null,
        };

        console.log('Attempting to insert into Supabase...');
        console.log('Insert data keys:', Object.keys(insertDataFull));
        console.log('Supabase client:', supabase ? 'initialized' : 'NOT initialized');
        
        // Try insert with all columns first
        let { data, error: dbError } = await supabase
          .from('submissions')
          .insert(insertDataFull)
          .select()
          .single();

        // If error mentions missing column, try again with minimal set
        if (dbError && (dbError.message?.includes('column') || dbError.code === '42703' || dbError.code === '42P01')) {
          console.log('⚠️ Column error detected, retrying with minimal schema...');
          
          // Minimal insert - only columns that definitely exist in base schema
          const insertDataMinimal = {
            email: email || null,
            background: submissionData.backgroundEdge?.experienceMap?.functionalStrengths || null,
            interests: submissionData.quickSummary?.primaryThesis || null,
            experience: submissionData.backgroundEdge?.experienceMap?.dealExposure || null,
            scorecard: submissionData.scorecard || [],
          };

          console.log('Retrying with minimal data keys:', Object.keys(insertDataMinimal));
          const result = await supabase
            .from('submissions')
            .insert(insertDataMinimal)
            .select()
            .single();

          if (result.error) {
            dbError = result.error;
            console.error('❌ Minimal insert also failed:', result.error);
          } else {
            data = result.data;
            dbError = null;
            console.log('✅ Saved with minimal schema (some columns missing from table)');
            console.log('   Run server/fix-schema.sql to add missing columns');
          }
        }

        if (dbError) {
          console.error('❌ Database error:', dbError.code, dbError.message);
          console.error('Error details:', JSON.stringify(dbError, null, 2));
          console.error('Error hint:', dbError.hint || 'none');
          
          // Check if it's a schema issue
          if (dbError.message?.includes('column') || dbError.code === '42703') {
            console.error('\n📋 Schema mismatch detected!');
            console.error('   The table is missing required columns.');
            console.error('   Run this SQL in Supabase SQL Editor:');
            console.error('   https://supabase.com/dashboard/project/hujrpzqbyuyckewrkoap/sql\n');
            console.error('   SQL: See server/fix-schema.sql\n');
          } else if (dbError.code === 'PGRST116' || dbError.message?.includes('permission')) {
            console.error('\n📋 Permission/RLS issue detected!');
            console.error('   Check Row Level Security (RLS) policies in Supabase.');
          } else if (dbError.code === '23502' || dbError.message?.includes('null value')) {
            console.error('\n📋 NOT NULL constraint violation!');
            console.error('   A required column is missing a value.');
          }
          // Continue even if database save fails - submission is still processed
        } else if (data) {
          savedData = data;
          dbSaved = true;
          console.log('✅ Submission saved to database:', data.id);
        } else {
          console.warn('⚠️ Insert returned no data but no error');
        }
      } catch (dbErr) {
        console.error('Database connection error (non-fatal):', dbErr.message);
        // Continue even if database is unavailable
      }
    } else {
      console.warn('Supabase not configured - submission not saved to database');
    }

    // Generate PDF with filled data (non-blocking, with timeout)
    let pdfBuffer = null;
    try {
      const pdfPromise = generateFilledPDF(submissionData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 10000)
      );
      pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);
      console.log('PDF generated successfully');
    } catch (pdfError) {
      console.error('PDF generation error (non-fatal):', pdfError.message);
      // Continue without PDF - submission is still processed
    }

    // Always return success - submission is accepted even if some parts fail
    const response = {
      success: true,
      message: 'Submission received successfully',
      dbSaved: dbSaved,
      pdfGenerated: pdfBuffer !== null,
    };

    if (savedData) {
      response.submissionId = savedData.id;
    }

    if (pdfBuffer) {
      const pdfBase64 = pdfBuffer.toString('base64');
      response.pdf = pdfBase64;
    } else {
      response.pdf = null;
      response.message += ' (PDF generation skipped)';
    }

    if (!dbSaved) {
      response.message += ' (Database save skipped)';
    }

    // Ensure Content-Type is set
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  } catch (error) {
    console.error('Unexpected error processing submission:', error);
    // Always return valid JSON, even on error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      dbSaved: false,
      pdfGenerated: false,
      pdf: null,
    });
  }
});

// Get all submissions (admin endpoint - should be protected in production)
app.get('/api/submissions', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get submission by ID
app.get('/api/submissions/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🚀 Torchlight server running on http://localhost:${PORT}`);
  console.log(`📊 Supabase: ${supabase ? '✅ Configured' : '⚠️  Not configured (submissions will not be saved to database)'}`);
  console.log(`📄 PDF Generation: ${typeof generateFilledPDF === 'function' ? '✅ Available' : '⚠️  Not available'}`);
  console.log(`\nReady to accept submissions!`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});