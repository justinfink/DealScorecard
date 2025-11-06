import { generateFilledPDF } from '../server/pdfGenerator.js';

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
    const submissionData = req.body;
    
    // Generate PDF with filled data - EXACT SAME AS /api/submit
    let pdfBuffer = null;
    try {
      const pdfPromise = generateFilledPDF(submissionData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
      );
      pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);
      console.log('PDF generated successfully for export');
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError.message);
      return res.status(500).json({
        success: false,
        error: 'PDF generation failed',
        message: pdfError.message,
      });
    }

    if (pdfBuffer) {
      const pdfBase64 = pdfBuffer.toString('base64');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
        success: true,
        pdf: pdfBase64,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'PDF generation failed',
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error',
    });
  }
}

