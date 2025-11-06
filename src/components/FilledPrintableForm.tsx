import React from 'react';
import { OnboardingData } from '../types';

interface FilledPrintableFormProps {
  data: OnboardingData;
  onClose: () => void;
}

// Helper to format array/list as JSX
const formatListJSX = (arr: string[] | undefined): React.ReactNode => {
  if (!arr || arr.length === 0) {
    return '';
  }
  const items = arr.filter(Boolean);
  if (items.length === 0) {
    return '';
  }
  return items.join(', ');
};

// Helper style object to prevent page breaks
const NO_BREAK_STYLE: React.CSSProperties = {
  pageBreakInside: 'avoid',
  breakInside: 'avoid',
  WebkitPageBreakInside: 'avoid',
};

export const FilledPrintableForm: React.FC<FilledPrintableFormProps> = ({ data, onClose }) => {
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

  return (
    <div className="printable-form bg-white p-8 max-w-4xl mx-auto" id="filled-printable-form">
      {/* Header */}
      <div className="mb-8 text-center border-b-2 border-torchlight-600 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img 
            src="/Torch.png" 
            alt="Torchlight Logo" 
            className="h-12 w-auto object-contain"
            style={{ maxWidth: '48px', height: 'auto' }}
          />
          <h1 className="text-4xl font-bold text-torchlight-600">Torchlight</h1>
        </div>
        <p className="text-xl text-gray-600">Operating System for ETA - Onboarding Form</p>
        <p className="text-sm text-gray-500 mt-2">Submitted: {new Date().toLocaleString()}</p>
        {qs.searcherName && (
          <p className="text-sm text-gray-700 mt-1"><strong>Searcher:</strong> {qs.searcherName}</p>
        )}
      </div>

      {/* Contact Information */}
      <div className="mb-8 print-major-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          1. Contact Information
        </h2>
        <div className="mb-4 print-field-container">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
            {data.email || ''}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mb-8 print-major-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          2. Quick Summary
        </h2>
        <div className="space-y-4">
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Searcher Name</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {qs.searcherName || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Home Base</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {qs.homeBase || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Close Window</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {qs.targetCloseWindow || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Thesis (1-2 lines)</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {qs.primaryThesis || ''}
            </div>
          </div>
          {qs.rightToWin && qs.rightToWin.length > 0 && qs.rightToWin.some(Boolean) && (
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Right-to-Win (3 bullets)</label>
              <div className="border border-gray-300 p-3 bg-gray-50 print-field-box" style={NO_BREAK_STYLE}>
                <ul className="list-disc list-inside space-y-1" style={NO_BREAK_STYLE}>
                  {qs.rightToWin.filter(Boolean).map((rtw, i) => (
                    <li key={i} style={NO_BREAK_STYLE}>{rtw}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {qs.nonNegotiables && qs.nonNegotiables.length > 0 && qs.nonNegotiables.some(Boolean) && (
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Non-Negotiables</label>
              <div className="border border-gray-300 p-3 bg-gray-50 print-field-box" style={NO_BREAK_STYLE}>
                <ul className="list-disc list-inside space-y-1" style={NO_BREAK_STYLE}>
                  {qs.nonNegotiables.filter(Boolean).map((nn, i) => (
                    <li key={i} style={NO_BREAK_STYLE}>{nn}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background & Edge */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          3. Background & Edge
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Experience Map</h3>
            <div className="space-y-4 pl-4">
              <div className="print-field-container">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Functional Strengths</label>
                <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                  {em.functionalStrengths || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deal Exposure (if any)</label>
                <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {em.dealExposure || ''}
                </div>
              </div>
              {em.operatingSuperpowers && em.operatingSuperpowers.length > 0 && em.operatingSuperpowers.some(Boolean) && (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Superpowers</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 print-field-box" style={NO_BREAK_STYLE}>
                    <ul className="list-disc list-inside space-y-1" style={NO_BREAK_STYLE}>
                      {em.operatingSuperpowers.filter(Boolean).map((sp, i) => (
                        <li key={i} style={NO_BREAK_STYLE}>{sp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {em.knownGaps && em.knownGaps.length > 0 && em.knownGaps.some(Boolean) && (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Known Gaps</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 print-field-box" style={NO_BREAK_STYLE}>
                    <ul className="list-disc list-inside space-y-1" style={NO_BREAK_STYLE}>
                      {em.knownGaps.filter(Boolean).map((gap, i) => (
                        <li key={i} style={NO_BREAK_STYLE}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Credibility Anchors</h3>
            <div className="space-y-4 pl-4">
              <div className="print-field-container">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logos / Roles That Open Doors</label>
                <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {ca.logosRoles || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Regulatory or Technical Domains</label>
                <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {ca.regulatoryDomains || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Audience Where You're Already Trusted</label>
                <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {ca.audienceTrusted || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Scorecard */}
      {scorecard.length > 0 && (
        <div className="mb-8 print-major-section print-section-new-page">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
            4. Personal Deal Scorecard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold text-gray-700">Factor</th>
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold text-gray-700">Definition</th>
                  <th className="border border-gray-400 px-3 py-2 text-center text-sm font-semibold text-gray-700">Weight (%)</th>
                </tr>
              </thead>
              <tbody>
                {scorecard.map((factor) => (
                  <tr key={factor.id}>
                    <td className="border border-gray-400 px-3 py-2">{factor.name || 'Untitled'}</td>
                    <td className="border border-gray-400 px-3 py-2">{factor.definition || 'No definition'}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{factor.weight || 0}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={2} className="border border-gray-400 px-3 py-2 text-right">TOTAL:</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {scorecard.reduce((sum, f) => sum + (f.weight || 0), 0).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Priorities & Non-Negotiables */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          5. Priorities & Non-Negotiables
        </h2>
        <div className="space-y-4">
          <div className="print-field-container">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Priority Stack</h3>
            <div className="border border-gray-300 p-4 bg-gray-50 print-field-box" style={NO_BREAK_STYLE}>
              <ol className="list-decimal space-y-2 pl-6" style={NO_BREAK_STYLE}>
                {orderedPriorities.map((p) => (
                  <li key={p.key} className="pl-2" style={NO_BREAK_STYLE}>{p.label}</li>
                ))}
              </ol>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Non-Negotiables (Hard Stops)</h3>
            <div className="space-y-3 pl-4">
              {nn.industryExclusions && nn.industryExclusions.length > 0 ? (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Industry/Vertical Exclusions</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                    {formatListJSX(nn.industryExclusions)}
                  </div>
                </div>
              ) : null}
              {nn.businessModelExclusions && nn.businessModelExclusions.length > 0 ? (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Model Exclusions</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                    {formatListJSX(nn.businessModelExclusions)}
                  </div>
                </div>
              ) : null}
              {nn.customerMixExclusions && nn.customerMixExclusions.length > 0 ? (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Mix Exclusions</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                    {formatListJSX(nn.customerMixExclusions)}
                  </div>
                </div>
              ) : null}
              {nn.contractRevExclusions && nn.contractRevExclusions.length > 0 ? (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contract/Revenue Exclusions</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                    {formatListJSX(nn.contractRevExclusions)}
                  </div>
                </div>
              ) : null}
              {nn.peopleRiskExclusions && nn.peopleRiskExclusions.length > 0 ? (
                <div className="print-field-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">People Risk Exclusions</label>
                  <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                    {formatListJSX(nn.peopleRiskExclusions)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Search Constraints */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          6. Search Constraints
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue Range</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {sc.revenueMin || sc.revenueMax
                  ? `$${sc.revenueMin || 0}M - $${sc.revenueMax || '∞'}M`
                  : ''}
              </div>
            </div>
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">EBITDA Range</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {sc.ebitdaMin || sc.ebitdaMax || sc.ebitdaMarginMin || sc.ebitdaMarginMax
                  ? `$${sc.ebitdaMin || 0}M - $${sc.ebitdaMax || '∞'}M${sc.ebitdaMarginMin || sc.ebitdaMarginMax ? ` (${sc.ebitdaMarginMin || 0}% - ${sc.ebitdaMarginMax || '∞'}% margin)` : ''}`
                  : ''}
              </div>
            </div>
          </div>
          {sc.headcountMax ? (
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Headcount Max</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                {sc.headcountMax}
              </div>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Geography: Must-Have</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {formatListJSX(sc.geographyMustHave)}
              </div>
            </div>
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Geography: Nice-to-Have</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {formatListJSX(sc.geographyNiceToHave)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Age / Profile</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {sc.ownerAge || ''}
              </div>
            </div>
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Intent</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {sc.ownerIntent || ''}
              </div>
            </div>
          </div>
          {sc.dealStructures ? (
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deal Structures OK</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {Object.entries(sc.dealStructures)
                  .filter(([_, v]) => v)
                  .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'))
                  .join(', ') || ''}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right-to-Win Mechanics */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          7. Right-to-Win Mechanics
        </h2>
        <div className="space-y-4">
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Channels & Communities</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {rtw.existingChannels || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Referrers / Advisors You Already Have</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {rtw.referrersAdvisors || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Proof Points (Case Studies, Ops Wins)</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {rtw.proofPoints || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Synergies with Current Platform/Team</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {rtw.synergies || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">90-Day Post-Close Advantages (Be Concrete)</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[60px] whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {rtw.ninetyDayAdvantages || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Niche Identification */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          8. Sub-Niche Identification
        </h2>
        <div className="space-y-4">
          {sn.coreNicheCandidates && sn.coreNicheCandidates.length > 0 && sn.coreNicheCandidates.some(Boolean) && (
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Core Niche Candidates (top 3)</label>
              <div className="border border-gray-300 p-3 bg-gray-50 print-field-box" style={NO_BREAK_STYLE}>
                <ol className="list-decimal list-inside space-y-1" style={NO_BREAK_STYLE}>
                  {sn.coreNicheCandidates.filter(Boolean).map((niche, i) => (
                    <li key={i} className="text-gray-900" style={NO_BREAK_STYLE}>{niche}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          {sn.adjacencyMatrix && sn.adjacencyMatrix.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adjacency Matrix</label>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 px-2 py-1 text-left">Sub-Niche</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Same Buyer</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Same Deliverable</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Same Channel</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Margin Upside</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sn.adjacencyMatrix.filter(Boolean).map((row, i) => (
                      <tr key={i}>
                        <td className="border border-gray-400 px-2 py-1">{row.subNiche || ''}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{row.sameBuyer ? '✓' : '✗'}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{row.sameDeliverable ? '✓' : '✗'}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{row.sameChannel ? '✓' : '✗'}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{row.marginUpside ? '✓' : '✗'}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{row.priority || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Keyword Cluster A</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {sn.keywordClusterA || ''}
            </div>
          </div>
          <div className="print-field-container">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Keyword Cluster B</label>
            <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {sn.keywordClusterB || ''}
            </div>
          </div>
          {sn.similarToSeedList && sn.similarToSeedList.length > 0 ? (
            <div className="print-field-container">
              <label className="block text-sm font-semibold text-gray-700 mb-2">"Similar to" Seed List (5-10 anchors)</label>
              <div className="border border-gray-300 p-3 bg-gray-50 min-h-[40px] text-gray-900 whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
                {formatListJSX(sn.similarToSeedList)}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Torchlight Team Responsibility Notice */}
      <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 print-field-box">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Torchlight Team Responsibility</h3>
        <p className="text-sm text-yellow-700">
          The following four sections (Deal Flow Sufficiency Test, Operating Plan Hooks, Funnel & KPI, and Decision Gate) are primarily the responsibility of the Torchlight team. However, you may fill in information if you have relevant insights or preferences.
        </p>
      </div>

      {/* Deal Flow Sufficiency */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          9. Deal Flow Sufficiency Test
        </h2>
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">
            Goal: ensure ≥ 150 qualifying targets within 1–5M revenue that match scorecard ≥ 360/500.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Readiness</h3>
            <div className="space-y-3">
              {([
                { key: 'clearKeywordSet', label: 'Clear keyword set?' },
                { key: 'exclusionsDefined', label: 'Exclusions defined?' },
                { key: 'naicsSicMapped', label: 'NAICS/SIC mapped?' },
                { key: 'geoFocusWorkable', label: 'Geo focus workable?' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded flex items-center justify-center">
                    {dfs.queryReadiness?.[key] ? '✓' : ''}
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume & Quality</h3>
            <div className="space-y-3">
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Est. TAM (companies in band)</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white print-field-box" style={NO_BREAK_STYLE}>
                  {dfs.volumeQuality?.estTAM || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualifying after exclusions</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white print-field-box" style={NO_BREAK_STYLE}>
                  {dfs.volumeQuality?.qualifyingAfterExclusions || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Top-quartile "fit" count</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white print-field-box" style={NO_BREAK_STYLE}>
                  {dfs.volumeQuality?.topQuartileFitCount || ''}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
                <div className="flex gap-4">
                  {(['sufficient', 'borderline', 'insufficient'] as const).map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center">
                        {dfs.volumeQuality?.conclusion === option ? '✓' : ''}
                      </div>
                      <span className="text-sm text-gray-700">
                        {option === 'sufficient' && '✅ Sufficient'}
                        {option === 'borderline' && '⚠️ Borderline'}
                        {option === 'insufficient' && '❌ Insufficient'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Plan Hooks */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          10. Operating Plan Hooks
        </h2>
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">Pre-LOI thinking about value creation.</p>
          
          <div className="print-field-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              100-Day Value Plan (three moves)
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-2 print-field-box">
                  <span className="text-gray-500 w-8">{index + 1}.</span>
                  <div className="flex-1 border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white" style={NO_BREAK_STYLE}>
                    {oph.hundredDayValuePlan?.[index] || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="print-field-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retention Plan for Key Staff
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] bg-white whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {oph.retentionPlan || ''}
            </div>
          </div>

          <div className="print-field-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pricing/Uplift Levers
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] bg-white whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {oph.pricingUpliftLevers || ''}
            </div>
          </div>

          <div className="print-field-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cross-Sell with Existing Assets
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] bg-white whitespace-pre-wrap print-field-box" style={NO_BREAK_STYLE}>
              {oph.crossSellAssets || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel & KPI */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          11. Funnel & KPI
        </h2>
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">KPIs for both search and post-close operations.</p>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search KPIs</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Targets Added</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.searchKPIs?.weeklyTargetsAdded || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Convos/Week</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.searchKPIs?.newConvosPerWeek || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">IOIs/Month</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.searchKPIs?.ioIsPerMonth || ''}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Close KPIs</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">MRR/Retainer %</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.postCloseKPIs?.mrrRetainerPercent || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gross Margin (%)</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.postCloseKPIs?.grossMargin || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Utilization (%)</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.postCloseKPIs?.utilization || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">NRR/Expansion (%)</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.postCloseKPIs?.nrrExpansion || ''}
                </div>
              </div>
              <div className="print-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Coverage (× months)</label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] bg-white text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
                  {fkpi.postCloseKPIs?.pipelineCoverageMonths || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Gate */}
      <div className="mb-8 print-major-section print-section-new-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          12. Decision Gate
        </h2>
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">Final decision point and next actions.</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fit Verdict *
            </label>
            <div className="flex gap-4">
              {(['proceed', 'fix-reevaluate', 'pass'] as const).map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center ${
                    dg.fitVerdict === option ? 'bg-torchlight-600 border-torchlight-600' : ''
                  }`}>
                    {dg.fitVerdict === option ? '✓' : ''}
                  </div>
                  <span className="text-sm text-gray-700">
                    {option === 'proceed' && '✅ Proceed'}
                    {option === 'fix-reevaluate' && '⚠️ Fix & Re-evaluate'}
                    {option === 'pass' && '❌ Pass'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="print-field-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rationale
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[100px] bg-white whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {dg.rationale || ''}
            </div>
          </div>
          
          <div className="print-field-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Actions
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[100px] bg-white whitespace-pre-wrap text-gray-900 print-field-box" style={NO_BREAK_STYLE}>
              {dg.nextActions || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>Torchlight - Operating System for ETA</p>
        <p className="mt-1">This document was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Close button - hidden when printing */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

