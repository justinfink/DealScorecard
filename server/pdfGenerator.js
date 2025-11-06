import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateFilledPDF = async (submissionData) => {
  let browser;
  try {
    // Try to launch browser with timeout
    browser = await Promise.race([
      puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Browser launch timeout')), 10000)
      ),
    ]);
    
    const page = await browser.newPage();
    
    // Generate HTML content with filled data (updated for new structure)
    const htmlContent = generateHTML(submissionData);
    
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Generate PDF with timeout
    const pdfBuffer = await Promise.race([
      page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
      ),
    ]);
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error.message);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('Error closing browser:', closeError.message);
      }
    }
  }
};

const generateHTML = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 5px;
    }
    .header p {
      color: #6b7280;
      font-size: 16px;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .field {
      margin-bottom: 12px;
    }
    .field-label {
      font-weight: 600;
      color: #4b5563;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .field-value {
      color: #1f2937;
      font-size: 14px;
      padding: 8px;
      background-color: #f9fafb;
      border-left: 3px solid #2563eb;
      padding-left: 12px;
      min-height: 20px;
    }
    .field-value.empty {
      color: #9ca3af;
      font-style: italic;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag {
      background-color: #dbeafe;
      color: #1e40af;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      display: inline-block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table th {
      background-color: #f3f4f6;
      padding: 10px;
      text-align: left;
      border: 1px solid #d1d5db;
      font-weight: 600;
      font-size: 12px;
    }
    table td {
      padding: 10px;
      border: 1px solid #d1d5db;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Torchlight</h1>
    <p>Operating System for ETA - Onboarding Form</p>
    <p style="font-size: 12px; margin-top: 10px;">Submitted: ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <div class="section-title">Contact Information</div>
    <div class="field">
      <div class="field-label">Email Address</div>
      <div class="field-value">${data.email || '<span class="empty">Not provided</span>'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Background & Interests</div>
    <div class="field">
      <div class="field-label">Professional Background</div>
      <div class="field-value">${data.background?.background || '<span class="empty">Not provided</span>'}</div>
    </div>
    <div class="field">
      <div class="field-label">Interests & Goals</div>
      <div class="field-value">${data.background?.interests || '<span class="empty">Not provided</span>'}</div>
    </div>
    ${data.background?.experience ? `
    <div class="field">
      <div class="field-label">Relevant Experience</div>
      <div class="field-value">${data.background.experience}</div>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <div class="section-title">Deal Filters</div>
    <div class="field">
      <div class="field-label">Employee Ranges</div>
      <div class="field-value">
        ${data.filters?.employeeRanges?.length > 0 
          ? `<div class="tags">${data.filters.employeeRanges.map(r => `<span class="tag">${r}</span>`).join('')}</div>`
          : '<span class="empty">None selected</span>'}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Revenue Ranges</div>
      <div class="field-value">
        ${data.filters?.revenueRanges?.length > 0 
          ? `<div class="tags">${data.filters.revenueRanges.map(r => `<span class="tag">${r}</span>`).join('')}</div>`
          : '<span class="empty">None selected</span>'}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Preferred Locations</div>
      <div class="field-value">
        ${data.filters?.locations?.length > 0 
          ? `<div class="tags">${data.filters.locations.map(l => `<span class="tag">${l}</span>`).join('')}</div>`
          : '<span class="empty">None</span>'}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Customer Type</div>
      <div class="field-value">${data.filters?.customers || '<span class="empty">Not specified</span>'}</div>
    </div>
    <div class="field">
      <div class="field-label">Business Model</div>
      <div class="field-value">
        ${data.filters?.businessModel?.length > 0 
          ? `<div class="tags">${data.filters.businessModel.map(m => `<span class="tag">${m}</span>`).join('')}</div>`
          : '<span class="empty">None selected</span>'}
      </div>
    </div>
    <div class="field">
      <div class="field-label">End Customer</div>
      <div class="field-value">${data.filters?.endCustomer || '<span class="empty">Not specified</span>'}</div>
    </div>
    <div class="field">
      <div class="field-label">Industry NAICS Code(s)</div>
      <div class="field-value">
        ${data.filters?.naicsCodes?.length > 0 
          ? `<div class="tags">${data.filters.naicsCodes.map(c => `<span class="tag">${c}</span>`).join('')}</div>`
          : '<span class="empty">None</span>'}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Early Subindustries of Interest</div>
      <div class="field-value">
        ${data.filters?.subindustries?.length > 0 
          ? `<div class="tags">${data.filters.subindustries.map(s => `<span class="tag">${s}</span>`).join('')}</div>`
          : '<span class="empty">None</span>'}
      </div>
    </div>
    ${data.filters?.risks?.length > 0 ? `
    <div class="field">
      <div class="field-label">Areas of Outreach Risk</div>
      <div class="field-value">
        <div class="tags">${data.filters.risks.map(r => `<span class="tag" style="background-color: #fee2e2; color: #991b1b;">${r}</span>`).join('')}</div>
      </div>
    </div>
    ` : ''}
    ${data.filters?.dealKillers?.length > 0 ? `
    <div class="field">
      <div class="field-label">Deal Killers</div>
      <div class="field-value">
        <div class="tags">${data.filters.dealKillers.map(k => `<span class="tag" style="background-color: #fee2e2; color: #991b1b;">${k}</span>`).join('')}</div>
      </div>
    </div>
    ` : ''}
  </div>

  ${data.scorecard?.length > 0 ? `
  <div class="section">
    <div class="section-title">Deal Scorecard (${data.scorecard.length} criteria)</div>
    <table>
      <thead>
        <tr>
          <th>Priority</th>
          <th>Criterion</th>
          <th>Ranking (0-10)</th>
          <th>Weight (%)</th>
        </tr>
      </thead>
      <tbody>
        ${data.scorecard.map(c => `
          <tr>
            <td>${c.priority}</td>
            <td>${c.name}</td>
            <td>${c.ranking || 0}</td>
            <td>${c.weight || 0}%</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background-color: #f3f4f6; font-weight: 600;">
          <td colspan="2" style="text-align: right;">Totals:</td>
          <td>${data.scorecard.reduce((sum, c) => sum + (c.ranking || 0), 0).toFixed(1)}</td>
          <td>${data.scorecard.reduce((sum, c) => sum + (c.weight || 0), 0)}%</td>
        </tr>
      </tfoot>
    </table>
  </div>
  ` : ''}

  <div class="footer">
    <p>Torchlight - Operating System for ETA</p>
    <p>This document was generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `;
};
