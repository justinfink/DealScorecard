import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load logo as base64
let logoBase64 = '';
try {
  const logoPath = join(__dirname, '..', 'public', 'Torch.png');
  const logoBuffer = readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (error) {
  console.warn('Could not load logo image:', error.message);
  // Fallback to emoji if logo not found
  logoBase64 = null;
}

export const generateFilledPDF = async (submissionData) => {
  let browser;
  let puppeteer;
  
  try {
    // Determine if we're in Vercel/serverless environment
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isVercel) {
      // Use puppeteer-core with @sparticuz/chromium for Vercel
      puppeteer = await import('puppeteer-core');
      const chromium = await import('@sparticuz/chromium');
      
      // Configure Chromium for Vercel
      const launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };

      browser = await Promise.race([
        puppeteer.default.launch(launchOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Browser launch timeout')), 10000)
        ),
      ]);
    } else {
      // Use regular puppeteer for local development
      // Try puppeteer first, fallback to puppeteer-core if puppeteer not available
      try {
        puppeteer = await import('puppeteer');
      } catch (e) {
        // Fallback to puppeteer-core for local if puppeteer not installed
        puppeteer = await import('puppeteer-core');
        console.warn('Using puppeteer-core instead of puppeteer');
      }
      
      browser = await Promise.race([
        puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Browser launch timeout')), 10000)
        ),
      ]);
    }
    
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
        preferCSSPageSize: false,
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

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper to format array/list - returns empty string if no items
const formatList = (arr) => {
  if (!arr || arr.length === 0) return '';
  if (Array.isArray(arr)) {
    const items = arr.filter(Boolean);
    if (items.length === 0) return '';
    return items.map(item => escapeHtml(String(item))).join(', ');
  }
  return escapeHtml(String(arr));
};

// Helper to format tags - returns empty string if no items
const formatTags = (arr) => {
  if (!arr || arr.length === 0) return '';
  const items = arr.filter(Boolean);
  if (items.length === 0) return '';
  return `<div class="tags">${items.map(item => `<span class="tag">${escapeHtml(String(item))}</span>`).join('')}</div>`;
};

const generateHTML = (data) => {
  const qs = data.quickSummary || {};
  const bg = data.backgroundEdge || {};
  const em = bg.experienceMap || {};
  const ca = bg.credibilityAnchors || {};
  const scorecard = data.scorecard || [];
  const priorities = data.prioritiesNonNegotiables || {};
  const ps = priorities.priorityStack || {};
  const nn = priorities.nonNegotiables || {};
  const sc = data.searchConstraints || {};
  const rtw = data.rightToWinMechanics || {};
  const sn = data.subNicheIdentification || {};
  const dfs = data.dealFlowSufficiency || {};
  const oph = data.operatingPlanHooks || {};
  const fkpi = data.funnelKPI || {};
  const dg = data.decisionGate || {};

  // Get priority order (sorted by rank)
  const priorityFields = [
    { key: 'growthRate', label: 'Growth Rate' },
    { key: 'profitability', label: 'Profitability' },
    { key: 'recurringRevenue', label: 'Recurring Revenue' },
    { key: 'lowPeopleIntensity', label: 'Low People Intensity' },
    { key: 'regSimplicity', label: 'Reg Simplicity' },
    { key: 'ownerSuccessionTiming', label: 'Owner Succession Timing' },
    { key: 'geography', label: 'Geography' },
    { key: 'missionValues', label: 'Mission/Values' },
  ];
  const orderedPriorities = priorityFields
    .map(f => ({ ...f, rank: ps[f.key] || 999 }))
    .sort((a, b) => a.rank - b.rank);

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
      font-size: 13px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ea580c;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #ea580c;
      font-size: 32px;
      margin-bottom: 5px;
    }
    .header p {
      color: #6b7280;
      font-size: 16px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Sections 3+ start on new page - STRONG RULES */
    .section.section-new-page {
      page-break-before: always !important;
      break-before: page !important;
      display: block !important;
    }
    .section-title {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .field-label {
      display: block;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .field-box {
      border: 1px solid #d1d5db;
      padding: 12px;
      background-color: #f9fafb;
      min-height: 40px;
      color: #111827;
      white-space: pre-wrap;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .field-value {
      border: 1px solid #d1d5db;
      padding: 12px;
      background-color: #f9fafb;
      min-height: 40px;
      color: #111827;
      white-space: pre-wrap;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .subsection {
      margin-bottom: 20px;
      padding-left: 10px;
    }
    .subsection-title {
      font-size: 15px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
      margin-top: 15px;
    }
    .field {
      margin-bottom: 12px;
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
      font-size: 11px;
      display: inline-block;
    }
    .bullet-list {
      padding-left: 20px;
    }
    .bullet-list li {
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    table th {
      background-color: #f3f4f6;
      padding: 10px;
      text-align: left;
      border: 1px solid #d1d5db;
      font-weight: 600;
    }
    table td {
      padding: 10px;
      border: 1px solid #d1d5db;
    }
    .priority-list {
      list-style: none;
      padding-left: 0;
    }
    .priority-list li {
      padding: 8px;
      margin-bottom: 6px;
      background-color: #f9fafb;
      border-left: 3px solid #ea580c;
    }
    .notice-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notice-box h3 {
      color: #92400e;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .notice-box p {
      color: #78350f;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 11px;
    }
    @media print {
      .section { 
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      /* Sections 3+ start on new page */
      .section.section-new-page {
        page-break-before: always !important;
        break-before: page !important;
        display: block !important;
      }
      .field-value {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      ol, ul {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px;">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Torchlight Logo" style="height: 48px; width: auto; max-width: 48px; object-fit: contain;" />` : '<div style="height: 48px; width: 48px; background-color: #ea580c; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">🔥</div>'}
      <h1>Torchlight</h1>
    </div>
    <p>Operating System for ETA - Onboarding Form</p>
    <p style="font-size: 12px; margin-top: 10px;">Submitted: ${new Date().toLocaleString()}</p>
    ${qs.searcherName ? `<p style="font-size: 14px; margin-top: 5px; color: #1f2937;"><strong>Searcher:</strong> ${escapeHtml(qs.searcherName)}</p>` : ''}
  </div>

  <!-- Contact Information -->
  <div class="section">
    <h2 class="section-title">1. Contact Information</h2>
    <div class="field" style="margin-bottom: 16px;">
      <label class="field-label">Email Address</label>
      <div class="field-box">${escapeHtml(data.email || '')}</div>
    </div>
  </div>

  <!-- Quick Summary -->
  <div class="section">
    <div class="section-title">2. Quick Summary</div>
    <div class="field">
      <div class="field-label">Searcher Name</div>
      <div class="field-value">${escapeHtml(qs.searcherName || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Home Base</div>
      <div class="field-value">${escapeHtml(qs.homeBase || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Target Close Window</div>
      <div class="field-value">${escapeHtml(qs.targetCloseWindow || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Primary Thesis (1-2 lines)</div>
      <div class="field-value">${escapeHtml(qs.primaryThesis || '')}</div>
    </div>
    ${qs.rightToWin && qs.rightToWin.length > 0 ? `
    <div class="field">
      <div class="field-label">Right-to-Win (3 bullets)</div>
      <div class="field-value">
        <ul class="bullet-list">
          ${qs.rightToWin.filter(Boolean).map(rtw => `<li>${escapeHtml(rtw)}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
    ${qs.nonNegotiables && qs.nonNegotiables.length > 0 ? `
    <div class="field">
      <div class="field-label">Non-Negotiables</div>
      <div class="field-value">
        <ul class="bullet-list">
          ${qs.nonNegotiables.filter(Boolean).map(nn => `<li>${escapeHtml(nn)}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
  </div>

  <!-- Background & Edge -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">3. Background & Edge</div>
    <div class="subsection">
      <div class="subsection-title">Experience Map</div>
      <div class="field">
        <div class="field-label">Functional Strengths</div>
        <div class="field-value">${escapeHtml(em.functionalStrengths || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Deal Exposure (if any)</div>
        <div class="field-value">${escapeHtml(em.dealExposure || '')}</div>
      </div>
      ${em.operatingSuperpowers && em.operatingSuperpowers.length > 0 ? `
      <div class="field">
        <div class="field-label">Operating Superpowers</div>
        <div class="field-value">
          <ul class="bullet-list">
            ${em.operatingSuperpowers.filter(Boolean).map(sp => `<li>${escapeHtml(sp)}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
      ${em.knownGaps && em.knownGaps.length > 0 ? `
      <div class="field">
        <div class="field-label">Known Gaps</div>
        <div class="field-value">
          <ul class="bullet-list">
            ${em.knownGaps.filter(Boolean).map(gap => `<li>${escapeHtml(gap)}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
    </div>
    <div class="subsection">
      <div class="subsection-title">Credibility Anchors</div>
      <div class="field">
        <div class="field-label">Logos / Roles That Open Doors</div>
        <div class="field-value">${escapeHtml(ca.logosRoles || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Regulatory or Technical Domains</div>
        <div class="field-value">${escapeHtml(ca.regulatoryDomains || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Audience Where You're Already Trusted</div>
        <div class="field-value">${escapeHtml(ca.audienceTrusted || '')}</div>
      </div>
    </div>
  </div>

  <!-- Deal Scorecard -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">4. Personal Deal Scorecard</div>
    ${scorecard.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Factor</th>
          <th style="width: 40%;">Definition</th>
          <th style="width: 10%; text-align: center;">Weight (%)</th>
        </tr>
      </thead>
      <tbody>
        ${scorecard.map(factor => `
          <tr>
            <td>${escapeHtml(factor.name || 'Untitled')}</td>
            <td>${escapeHtml(factor.definition || 'No definition')}</td>
            <td style="text-align: center;">${factor.weight || 0}%</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background-color: #f3f4f6; font-weight: 600;">
          <td colspan="2" style="text-align: right;">TOTAL:</td>
          <td style="text-align: center;">${scorecard.reduce((sum, f) => sum + (f.weight || 0), 0).toFixed(1)}%</td>
        </tr>
      </tfoot>
    </table>
    ` : '<div class="field-value">No scorecard factors defined.</div>'}
  </div>

  <!-- Priorities & Non-Negotiables -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">5. Priorities & Non-Negotiables</div>
    <div class="subsection">
      <div class="subsection-title">Priority Stack</div>
      <ol class="priority-list">
        ${orderedPriorities.map(p => `<li>${escapeHtml(p.label)}</li>`).join('')}
      </ol>
    </div>
    <div class="subsection">
      <div class="subsection-title">Non-Negotiables (Hard Stops)</div>
      ${nn.industryExclusions && nn.industryExclusions.length > 0 ? `
      <div class="field">
        <div class="field-label">Industry/Vertical Exclusions</div>
        <div class="field-value">${formatList(nn.industryExclusions)}</div>
      </div>
      ` : ''}
      ${nn.businessModelExclusions && nn.businessModelExclusions.length > 0 ? `
      <div class="field">
        <div class="field-label">Business Model Exclusions</div>
        <div class="field-value">${formatList(nn.businessModelExclusions)}</div>
      </div>
      ` : ''}
      ${nn.customerMixExclusions && nn.customerMixExclusions.length > 0 ? `
      <div class="field">
        <div class="field-label">Customer Mix Exclusions</div>
        <div class="field-value">${formatList(nn.customerMixExclusions)}</div>
      </div>
      ` : ''}
      ${nn.contractRevExclusions && nn.contractRevExclusions.length > 0 ? `
      <div class="field">
        <div class="field-label">Contract/Revenue Exclusions</div>
        <div class="field-value">${formatList(nn.contractRevExclusions)}</div>
      </div>
      ` : ''}
      ${nn.peopleRiskExclusions && nn.peopleRiskExclusions.length > 0 ? `
      <div class="field">
        <div class="field-label">People Risk Exclusions</div>
        <div class="field-value">${formatList(nn.peopleRiskExclusions)}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Search Constraints -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">6. Search Constraints</div>
    <div class="field">
      <div class="field-label">Revenue Range</div>
      <div class="field-value">
        ${sc.revenueMin || sc.revenueMax 
          ? `$${sc.revenueMin || 0}M - $${sc.revenueMax || '∞'}M`
          : ''}
      </div>
    </div>
    <div class="field">
      <div class="field-label">EBITDA Range</div>
      <div class="field-value">
        ${sc.ebitdaMin || sc.ebitdaMax || sc.ebitdaMarginMin || sc.ebitdaMarginMax
          ? `$${sc.ebitdaMin || 0}M - $${sc.ebitdaMax || '∞'}M${sc.ebitdaMarginMin || sc.ebitdaMarginMax ? ` (${sc.ebitdaMarginMin || 0}% - ${sc.ebitdaMarginMax || '∞'}% margin)` : ''}`
          : ''}
      </div>
    </div>
    ${sc.headcountMax ? `
    <div class="field">
      <div class="field-label">Headcount Max</div>
      <div class="field-value">${sc.headcountMax}</div>
    </div>
    ` : ''}
    <div class="field">
      <div class="field-label">Geography: Must-Have</div>
      <div class="field-value">${formatList(sc.geographyMustHave, 'None specified')}</div>
    </div>
    <div class="field">
      <div class="field-label">Geography: Nice-to-Have</div>
      <div class="field-value">${formatList(sc.geographyNiceToHave, 'None specified')}</div>
    </div>
    <div class="field">
      <div class="field-label">Owner Age / Profile</div>
      <div class="field-value">${escapeHtml(sc.ownerAge || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Owner Intent</div>
      <div class="field-value">${escapeHtml(sc.ownerIntent || '')}</div>
    </div>
    ${sc.dealStructures ? `
    <div class="field">
      <div class="field-label">Deal Structures OK</div>
      <div class="field-value">
        ${formatTags(Object.entries(sc.dealStructures).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')), 'None selected')}
      </div>
    </div>
    ` : ''}
  </div>

  <!-- Right-to-Win Mechanics -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">7. Right-to-Win Mechanics</div>
    <div class="field">
      <div class="field-label">Existing Channels & Communities</div>
      <div class="field-value">${escapeHtml(rtw.existingChannels || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Referrers / Advisors You Already Have</div>
      <div class="field-value">${escapeHtml(rtw.referrersAdvisors || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Proof Points (Case Studies, Ops Wins)</div>
      <div class="field-value">${escapeHtml(rtw.proofPoints || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Synergies with Current Platform/Team</div>
      <div class="field-value">${escapeHtml(rtw.synergies || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">90-Day Post-Close Advantages (Be Concrete)</div>
      <div class="field-value">${escapeHtml(rtw.ninetyDayAdvantages || '')}</div>
    </div>
  </div>

  <!-- Sub-Niche Identification -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">8. Sub-Niche Identification</div>
    ${sn.coreNicheCandidates && sn.coreNicheCandidates.length > 0 ? `
    <div class="field">
      <div class="field-label">Core Niche Candidates (top 3)</div>
      <div class="field-value">
        <ul class="bullet-list">
          ${sn.coreNicheCandidates.filter(Boolean).map((niche, i) => `<li>${i + 1}. ${escapeHtml(niche)}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
    ${sn.adjacencyMatrix && sn.adjacencyMatrix.length > 0 ? `
    <div class="field">
      <div class="field-label">Adjacency Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Sub-Niche</th>
            <th style="text-align: center;">Same Buyer</th>
            <th style="text-align: center;">Same Deliverable</th>
            <th style="text-align: center;">Same Channel</th>
            <th style="text-align: center;">Margin Upside</th>
            <th style="text-align: center;">Priority</th>
          </tr>
        </thead>
        <tbody>
          ${sn.adjacencyMatrix.filter(Boolean).map(row => `
            <tr>
              <td>${escapeHtml(row.subNiche || '')}</td>
              <td style="text-align: center;">${row.sameBuyer ? '✓' : '✗'}</td>
              <td style="text-align: center;">${row.sameDeliverable ? '✓' : '✗'}</td>
              <td style="text-align: center;">${row.sameChannel ? '✓' : '✗'}</td>
              <td style="text-align: center;">${row.marginUpside ? '✓' : '✗'}</td>
              <td style="text-align: center;">${escapeHtml(row.priority || '')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    <div class="field">
      <div class="field-label">Keyword Cluster A</div>
      <div class="field-value">${escapeHtml(sn.keywordClusterA || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Keyword Cluster B</div>
      <div class="field-value">${escapeHtml(sn.keywordClusterB || '')}</div>
    </div>
    ${sn.similarToSeedList && sn.similarToSeedList.length > 0 ? `
    <div class="field">
      <div class="field-label">"Similar to" Seed List (5-10 anchors)</div>
      <div class="field-value">${formatList(sn.similarToSeedList)}</div>
    </div>
    ` : ''}
  </div>

  <!-- Torchlight Team Responsibility Notice -->
  <div class="notice-box">
    <h3>📋 Torchlight Team Responsibility</h3>
    <p>The following four sections (Deal Flow Sufficiency Test, Operating Plan Hooks, Funnel & KPI, and Decision Gate) are primarily the responsibility of the Torchlight team. However, you may fill in information if you have relevant insights or preferences.</p>
  </div>

  <!-- Deal Flow Sufficiency -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">9. Deal Flow Sufficiency Test</div>
    <div class="subsection">
      <div class="subsection-title">Query Readiness</div>
      <div class="field-value">
        ${dfs.queryReadiness?.clearKeywordSet ? '✓' : '✗'} Clear keyword set<br>
        ${dfs.queryReadiness?.exclusionsDefined ? '✓' : '✗'} Exclusions defined<br>
        ${dfs.queryReadiness?.naicsSicMapped ? '✓' : '✗'} NAICS/SIC mapped<br>
        ${dfs.queryReadiness?.geoFocusWorkable ? '✓' : '✗'} Geo focus workable
      </div>
    </div>
    <div class="subsection">
      <div class="subsection-title">Volume & Quality</div>
      <div class="field">
        <div class="field-label">Est. TAM (companies in band)</div>
        <div class="field-value">${escapeHtml(dfs.volumeQuality?.estTAM || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Qualifying after exclusions</div>
        <div class="field-value">${escapeHtml(dfs.volumeQuality?.qualifyingAfterExclusions || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Top-quartile "fit" count</div>
        <div class="field-value">${escapeHtml(dfs.volumeQuality?.topQuartileFitCount || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Conclusion</div>
        <div class="field-value">
          ${dfs.volumeQuality?.conclusion === 'sufficient' ? '✅ Sufficient' : ''}
          ${dfs.volumeQuality?.conclusion === 'borderline' ? '⚠️ Borderline' : ''}
          ${dfs.volumeQuality?.conclusion === 'insufficient' ? '❌ Insufficient' : ''}
        </div>
      </div>
    </div>
    ${dfs.remediation ? `
    <div class="subsection">
      <div class="subsection-title">Remediation Options</div>
      <div class="field-value">
        ${dfs.remediation.widenGeo ? '✓' : '✗'} Widen geography<br>
        ${dfs.remediation.expandAdjacencies ? '✓' : '✗'} Expand adjacencies<br>
        ${dfs.remediation.loosenRevenueBand ? '✓' : '✗'} Loosen revenue band<br>
        ${dfs.remediation.addChannelsPartners ? '✓' : '✗'} Add channels/partners
      </div>
    </div>
    ` : ''}
  </div>

  <!-- Operating Plan Hooks -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">10. Operating Plan Hooks</div>
    <div class="field">
      <div class="field-label">100-Day Value Plan (three moves)</div>
      <div class="field-value">
        ${oph.hundredDayValuePlan && oph.hundredDayValuePlan.length > 0 ? `
        <ul class="bullet-list">
          ${oph.hundredDayValuePlan.filter(Boolean).map((move, i) => `<li>${i + 1}. ${escapeHtml(move)}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Retention Plan for Key Staff</div>
      <div class="field-value">${escapeHtml(oph.retentionPlan || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Pricing/Uplift Levers</div>
      <div class="field-value">${escapeHtml(oph.pricingUpliftLevers || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Cross-Sell with Existing Assets</div>
      <div class="field-value">${escapeHtml(oph.crossSellAssets || '')}</div>
    </div>
  </div>

  <!-- Funnel & KPI -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">11. Funnel & KPI</div>
    <div class="subsection">
      <div class="subsection-title">Search KPIs</div>
      <div class="field">
        <div class="field-label">Weekly Targets Added</div>
        <div class="field-value">${escapeHtml(fkpi.searchKPIs?.weeklyTargetsAdded || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">New Convos Per Week</div>
        <div class="field-value">${escapeHtml(fkpi.searchKPIs?.newConvosPerWeek || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">IOIs Per Month</div>
        <div class="field-value">${escapeHtml(fkpi.searchKPIs?.ioIsPerMonth || '')}</div>
      </div>
    </div>
    <div class="subsection">
      <div class="subsection-title">Post-Close KPIs</div>
      <div class="field">
        <div class="field-label">MRR/Retainer %</div>
        <div class="field-value">${escapeHtml(fkpi.postCloseKPIs?.mrrRetainerPercent || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Gross Margin</div>
        <div class="field-value">${escapeHtml(fkpi.postCloseKPIs?.grossMargin || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Utilization</div>
        <div class="field-value">${escapeHtml(fkpi.postCloseKPIs?.utilization || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">NRR/Expansion</div>
        <div class="field-value">${escapeHtml(fkpi.postCloseKPIs?.nrrExpansion || '')}</div>
      </div>
      <div class="field">
        <div class="field-label">Pipeline Coverage (months)</div>
        <div class="field-value">${escapeHtml(fkpi.postCloseKPIs?.pipelineCoverageMonths || '')}</div>
      </div>
    </div>
  </div>

  <!-- Decision Gate -->
  <div class="section section-new-page" style="page-break-before: always !important; break-before: page !important;">
    <div class="section-title">12. Decision Gate</div>
    <div class="field">
      <div class="field-label">Fit Verdict</div>
      <div class="field-value">
        ${dg.fitVerdict === 'proceed' ? '✅ Proceed' : ''}
        ${dg.fitVerdict === 'fix-reevaluate' ? '⚠️ Fix & Re-evaluate' : ''}
        ${dg.fitVerdict === 'pass' ? '❌ Pass' : ''}
      </div>
    </div>
    <div class="field">
      <div class="field-label">Rationale</div>
      <div class="field-value">${escapeHtml(dg.rationale || '')}</div>
    </div>
    <div class="field">
      <div class="field-label">Next Actions</div>
      <div class="field-value">${escapeHtml(dg.nextActions || '')}</div>
    </div>
  </div>

  <div class="footer">
    <p>Torchlight - Operating System for ETA</p>
    <p>This document was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>
</body>
</html>
  `;
};





