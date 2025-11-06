import { generateFilledPDF } from '../server/pdfGenerator.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel automatically parses JSON body, but ensure it's an object
    const submissionData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Allow partial submissions - email is optional but preferred
    const email = submissionData.email?.trim() || null;
    
    // If email is provided, validate format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
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
            console.log('✅ Saved with minimal schema');
          }
        }

        if (dbError) {
          console.error('❌ Database error:', dbError.code, dbError.message);
        } else if (data) {
          savedData = data;
          dbSaved = true;
          console.log('✅ Submission saved to database:', data.id);
        }
      } catch (dbErr) {
        console.error('Database connection error (non-fatal):', dbErr.message);
      }
    }

    // Generate PDF with filled data - EXACT SAME AS /api/generate-pdf
    let pdfBuffer = null;
    try {
      const pdfPromise = generateFilledPDF(submissionData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
      );
      pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);
      console.log('PDF generated successfully');
    } catch (pdfError) {
      console.error('PDF generation error (non-fatal):', pdfError.message);
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

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(response);
  } catch (error) {
    console.error('Unexpected error processing submission:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      dbSaved: false,
      pdfGenerated: false,
      pdf: null,
    });
  }
}

