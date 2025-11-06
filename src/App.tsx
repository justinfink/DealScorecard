import React, { useState, useEffect, useRef } from 'react';
import { ContactInfoForm } from './components/ContactInfoForm';
import { QuickSummaryForm } from './components/QuickSummaryForm';
import { BackgroundEdgeForm } from './components/BackgroundEdgeForm';
import { DealScorecard } from './components/DealScorecard';
import { SearchConstraintsForm } from './components/SearchConstraintsForm';
import { PrioritiesNonNegotiablesForm } from './components/PrioritiesNonNegotiablesForm';
import { SimpleTextForm } from './components/SimpleTextForm';
import { FilledPrintableForm } from './components/FilledPrintableForm';
import { SidebarNavigation } from './components/SidebarNavigation';
import { OnboardingData } from './types';
import { saveOnboardingData, loadOnboardingData } from './utils/storage';
import { createInitialData } from './utils/initialData';
import { exportToPDF } from './utils/pdfExport';
import { Check, FileDown } from 'lucide-react';

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'quick-summary', label: 'Quick Summary' },
  { id: 'background-edge', label: 'Background & Edge' },
  { id: 'scorecard', label: 'Deal Scorecard' },
  { id: 'priorities', label: 'Priorities & Non-Negotiables' },
  { id: 'search-constraints', label: 'Search Constraints' },
  { id: 'right-to-win', label: 'Right-to-Win' },
  { id: 'sub-niche', label: 'Sub-Niche Identification' },
  { id: 'deal-flow', label: 'Deal Flow Sufficiency' },
  { id: 'operating-plan', label: 'Operating Plan' },
  { id: 'funnel-kpi', label: 'Funnel & KPI' },
  { id: 'decision-gate', label: 'Decision Gate' },
];

function App() {
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      return createInitialData();
    } catch (error) {
      console.error('Error creating initial data:', error);
      return createInitialData();
    }
  });
  const [showPrintableForm, setShowPrintableForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('contact');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const updateCompletedSections = (formData: OnboardingData) => {
    try {
      const completed = new Set<string>();
      
      if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        completed.add('contact');
      }
      if (formData.quickSummary?.searcherName && formData.quickSummary?.primaryThesis) {
        completed.add('quick-summary');
      }
      if (formData.backgroundEdge?.experienceMap?.functionalStrengths) {
        completed.add('background-edge');
      }
      if (formData.scorecard && formData.scorecard.length > 0 && formData.scorecard.some(f => f.weight > 0)) {
        completed.add('scorecard');
      }
      
      setCompletedSections(completed);
    } catch (error) {
      console.error('Error updating completed sections:', error);
    }
  };

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = loadOnboardingData();
      if (saved) {
        setData(saved);
        updateCompletedSections(saved);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      setData(createInitialData());
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    try {
      saveOnboardingData(data);
      updateCompletedSections(data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [data]);

  // Scroll spy for sidebar navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of SECTIONS) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      saveOnboardingData(data);

      // Use Vite proxy (configured in vite.config.ts) or direct URL
      const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      
      console.log('Submitting to:', `${API_URL}/submit`);
      console.log('Backend URL:', (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001 (via proxy)');
      
      const response = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch((fetchError) => {
        console.error('Fetch error details:', fetchError);
        throw fetchError;
      });
      
       console.log('Response status:', response.status, response.statusText);
       
       // Parse response - use json() directly which handles everything
       let result;
       if (!response.ok) {
         const errorText = await response.text().catch(() => 'Unknown error');
         throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
       }
       
       try {
         result = await response.json();
         console.log('✅ Parsed result:', { success: result.success, dbSaved: result.dbSaved, pdfGenerated: result.pdfGenerated });
       } catch (jsonError: any) {
         console.error('❌ JSON parse error:', jsonError);
         throw new Error('Invalid JSON response from server');
       }
      
      // Show appropriate success message
      let successMessage = 'Submission received successfully!';
      if (result.dbSaved) {
        successMessage += '\n✅ Saved to database';
      }
      if (result.pdfGenerated && result.pdf) {
        try {
          const pdfBlob = new Blob(
            [Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))],
            { type: 'application/pdf' }
          );
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          const emailPart = data.email ? data.email.replace('@', '-at-') : 'no-email';
          link.download = `torchlight-onboarding-${emailPart}-${new Date().toISOString().split('T')[0]}.pdf`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          successMessage += '\n📄 PDF downloaded';
        } catch (pdfError) {
          console.error('PDF download error:', pdfError);
          successMessage += '\n⚠️ PDF generation skipped (you can export manually)';
        }
      } else {
        successMessage += '\n⚠️ PDF generation skipped (you can export manually)';
      }
      
       if (!result.dbSaved) {
         successMessage += '\n⚠️ Database save skipped (data saved locally)';
       }
       
       setSubmitStatus({ type: 'success', message: successMessage });
       setIsSubmitting(false);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Check if it's a network error (server not running)
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.message?.includes('NetworkError') || 
                            error.name === 'TypeError' ||
                            error.message?.includes('ERR_INTERNET_DISCONNECTED');
      
       if (isNetworkError) {
         // Auto-generate PDF client-side as fallback
         try {
           window.scrollTo({ top: 0, behavior: 'instant' });
           setTimeout(async () => {
             try {
               const mainContent = document.querySelector('main');
               if (mainContent) {
                 const tempId = 'temp-pdf-export';
                 mainContent.id = tempId;
                 const emailPart = data.email ? data.email.replace('@', '-at-') : 'no-email';
                 await exportToPDF(tempId, `torchlight-onboarding-${emailPart}-${new Date().toISOString().split('T')[0]}.pdf`);
                 mainContent.removeAttribute('id');
                 setSubmitStatus({ 
                   type: 'success', 
                   message: 'PDF generated successfully! Your data is saved locally.\n\nTo save to Supabase, start the backend server (cd server && npm start).'
                 });
               } else {
                 throw new Error('Could not find form content to export');
               }
             } catch (pdfError) {
               console.error('Client PDF error:', pdfError);
               setSubmitStatus({ 
                 type: 'error', 
                 message: 'Backend server is not reachable. Failed to generate PDF. Please use the Export PDF button in the header instead.'
               });
             }
           }, 300);
         } catch (pdfError) {
           setSubmitStatus({ 
             type: 'error', 
             message: 'Backend server is not reachable. Your data is saved locally. Please use the Export PDF button or try again later.'
           });
         }
       } else {
         setSubmitStatus({ 
           type: 'error', 
           message: `Submission error: ${errorMessage}\n\nYour data is saved locally.\n\nTo troubleshoot:\n1. Check if backend server is running (cd server && npm start)\n2. Check browser console (F12) for details\n3. You can export PDF manually using the Export PDF button`
         });
       }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleExportPDF = async () => {
    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      
      console.log('Exporting PDF via:', `${API_URL}/generate-pdf`);
      
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Export PDF response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Export PDF error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log('Export PDF result:', { success: result.success, hasPdf: !!result.pdf });
      
      if (result.success && result.pdf) {
        const pdfBlob = new Blob(
          [Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))],
          { type: 'application/pdf' }
        );
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `torchlight-onboarding-form-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ PDF exported successfully');
      } else {
        console.error('Export PDF failed:', result);
        throw new Error(result.error || result.message || 'PDF generation failed');
      }
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      alert(`Failed to export PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const renderSection = (id: string, title: string, number: string, content: React.ReactNode) => (
    <section
      id={`${id}-section`}
      ref={(el) => (sectionRefs.current[id] = el as HTMLDivElement | null)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-gray-900">{number}</span>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="ml-11 h-1 w-20 bg-torchlight-600 rounded"></div>
      </div>
      {content}
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <img 
                src="/Torch.png" 
                alt="Torchlight Logo" 
                className="h-10 w-10 object-contain"
              />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Torchlight</h1>
              <p className="text-sm text-gray-600">Operating System for ETA</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-torchlight-600 text-white rounded-lg hover:bg-torchlight-700 flex items-center gap-2 transition-colors"
              title="Export to PDF"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        sections={SECTIONS}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        completedSections={completedSections}
      />

      {/* Main Content - Infinite Scroll */}
      <main className="ml-64 pt-20">
        <div className="max-w-4xl mx-auto px-8 py-8 space-y-16">
          {/* Contact Section */}
          {renderSection('contact', 'Contact Information', '1', (
            <ContactInfoForm
              email={data.email}
              onChange={(email) => setData({ ...data, email })}
            />
          ))}

          {/* Quick Summary */}
          {renderSection('quick-summary', 'Quick Summary', '2', (
            <QuickSummaryForm
              data={data.quickSummary}
              onChange={(quickSummary) => setData({ ...data, quickSummary })}
            />
          ))}

          {/* Background & Edge */}
          {renderSection('background-edge', 'Background & Edge', '3', (
            <BackgroundEdgeForm
              data={data.backgroundEdge}
              onChange={(backgroundEdge) => setData({ ...data, backgroundEdge })}
            />
          ))}

          {/* Deal Scorecard */}
          {renderSection('scorecard', 'Personal Deal Scorecard', '4', (
            <DealScorecard
              factors={data.scorecard}
              onChange={(scorecard) => setData({ ...data, scorecard })}
            />
          ))}

          {/* Priorities & Non-Negotiables */}
          {renderSection('priorities', 'Priorities & Non-Negotiables', '5', (
            <PrioritiesNonNegotiablesForm
              data={data.prioritiesNonNegotiables}
              onChange={(prioritiesNonNegotiables) => setData({ ...data, prioritiesNonNegotiables })}
            />
          ))}

          {/* Search Constraints */}
          {renderSection('search-constraints', 'Search Constraints', '6', (
            <SearchConstraintsForm
              data={data.searchConstraints}
              onChange={(searchConstraints) => setData({ ...data, searchConstraints })}
            />
          ))}

          {/* Right-to-Win Mechanics */}
          {renderSection('right-to-win', 'Right-to-Win Mechanics', '7', (
            <SimpleTextForm
              title="Right-to-Win Mechanics"
              description="How you'll win deals vs. other buyers."
              fields={[
                { key: 'existingChannels', label: 'Existing Channels & Communities', type: 'textarea', rows: 3 },
                { key: 'referrersAdvisors', label: 'Referrers / Advisors You Already Have', type: 'textarea', rows: 2 },
                { key: 'proofPoints', label: 'Proof Points (Case Studies, Ops Wins)', type: 'textarea', rows: 3 },
                { key: 'synergies', label: 'Synergies with Current Platform/Team', type: 'textarea', rows: 2 },
                { key: 'ninetyDayAdvantages', label: '90-Day Post-Close Advantages (Be Concrete)', type: 'textarea', rows: 3 },
              ]}
              values={data.rightToWinMechanics as any}
              onChange={(values) => setData({ ...data, rightToWinMechanics: values as any })}
            />
          ))}

          {/* Sub-Niche Identification */}
          {renderSection('sub-niche', 'Sub-Niche Identification', '8', (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">Identify core niches and adjacencies you can credibly win in 90 days.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Core Niche Candidates (top 3)
                </label>
                <div className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <input
                      key={index}
                      type="text"
                      value={data.subNicheIdentification.coreNicheCandidates[index] || ''}
                      onChange={(e) => {
                        const updated = [...data.subNicheIdentification.coreNicheCandidates];
                        updated[index] = e.target.value;
                        setData({
                          ...data,
                          subNicheIdentification: { ...data.subNicheIdentification, coreNicheCandidates: updated },
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                      placeholder={`Niche ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keyword Cluster A
                </label>
                <input
                  type="text"
                  value={data.subNicheIdentification.keywordClusterA}
                  onChange={(e) => setData({
                    ...data,
                    subNicheIdentification: { ...data.subNicheIdentification, keywordClusterA: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="e.g., healthcare consulting, medical billing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keyword Cluster B
                </label>
                <input
                  type="text"
                  value={data.subNicheIdentification.keywordClusterB}
                  onChange={(e) => setData({
                    ...data,
                    subNicheIdentification: { ...data.subNicheIdentification, keywordClusterB: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="e.g., compliance services, regulatory consulting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Similar to" Seed List (5-10 anchors)
                </label>
                <textarea
                  rows={3}
                  value={data.subNicheIdentification.similarToSeedList.join(', ')}
                  onChange={(e) => setData({
                    ...data,
                    subNicheIdentification: {
                      ...data.subNicheIdentification,
                      similarToSeedList: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="Company A, Company B, Company C..."
                />
              </div>
            </div>
          ))}

          {/* Torchlight Team Responsibility Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Torchlight Team Responsibility
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  The following four sections (Deal Flow Sufficiency Test, Operating Plan Hooks, Funnel & KPI, and Decision Gate) are primarily the responsibility of the Torchlight team. However, you may fill in information if you have relevant insights or preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Deal Flow Sufficiency */}
          {renderSection('deal-flow', 'Deal Flow Sufficiency Test', '9', (
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
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.dealFlowSufficiency.queryReadiness[key]}
                        onChange={(e) => setData({
                          ...data,
                          dealFlowSufficiency: {
                            ...data.dealFlowSufficiency,
                            queryReadiness: {
                              ...data.dealFlowSufficiency.queryReadiness,
                              [key]: e.target.checked,
                            },
                          },
                        })}
                        className="w-4 h-4 text-torchlight-600 border-gray-300 rounded focus:ring-torchlight-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume & Quality</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Est. TAM (companies in band)</label>
                    <input
                      type="text"
                      value={data.dealFlowSufficiency.volumeQuality.estTAM}
                      onChange={(e) => setData({
                        ...data,
                        dealFlowSufficiency: {
                          ...data.dealFlowSufficiency,
                          volumeQuality: {
                            ...data.dealFlowSufficiency.volumeQuality,
                            estTAM: e.target.value,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifying after exclusions</label>
                    <input
                      type="text"
                      value={data.dealFlowSufficiency.volumeQuality.qualifyingAfterExclusions}
                      onChange={(e) => setData({
                        ...data,
                        dealFlowSufficiency: {
                          ...data.dealFlowSufficiency,
                          volumeQuality: {
                            ...data.dealFlowSufficiency.volumeQuality,
                            qualifyingAfterExclusions: e.target.value,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Top-quartile "fit" count</label>
                    <input
                      type="text"
                      value={data.dealFlowSufficiency.volumeQuality.topQuartileFitCount}
                      onChange={(e) => setData({
                        ...data,
                        dealFlowSufficiency: {
                          ...data.dealFlowSufficiency,
                          volumeQuality: {
                            ...data.dealFlowSufficiency.volumeQuality,
                            topQuartileFitCount: e.target.value,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
                    <div className="flex gap-4">
                      {(['sufficient', 'borderline', 'insufficient'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="dealFlowConclusion"
                            checked={data.dealFlowSufficiency.volumeQuality.conclusion === option}
                            onChange={() => setData({
                              ...data,
                              dealFlowSufficiency: {
                                ...data.dealFlowSufficiency,
                                volumeQuality: {
                                  ...data.dealFlowSufficiency.volumeQuality,
                                  conclusion: option,
                                },
                              },
                            })}
                            className="w-4 h-4 text-torchlight-600 border-gray-300 focus:ring-torchlight-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {option === 'sufficient' && '✅ Sufficient'}
                            {option === 'borderline' && '⚠️ Borderline'}
                            {option === 'insufficient' && '❌ Insufficient'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Operating Plan Hooks */}
          {renderSection('operating-plan', 'Operating Plan Hooks', '10', (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">Pre-LOI thinking about value creation.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  100-Day Value Plan (three moves)
                </label>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-8">{index + 1}.</span>
                      <input
                        type="text"
                        value={data.operatingPlanHooks.hundredDayValuePlan[index] || ''}
                        onChange={(e) => {
                          const updated = [...data.operatingPlanHooks.hundredDayValuePlan];
                          updated[index] = e.target.value;
                          setData({
                            ...data,
                            operatingPlanHooks: { ...data.operatingPlanHooks, hundredDayValuePlan: updated },
                          });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                        placeholder={`Move ${index + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retention Plan for Key Staff
                </label>
                <textarea
                  rows={3}
                  value={data.operatingPlanHooks.retentionPlan}
                  onChange={(e) => setData({
                    ...data,
                    operatingPlanHooks: { ...data.operatingPlanHooks, retentionPlan: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="How will you retain key personnel?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing/Uplift Levers
                </label>
                <textarea
                  rows={3}
                  value={data.operatingPlanHooks.pricingUpliftLevers}
                  onChange={(e) => setData({
                    ...data,
                    operatingPlanHooks: { ...data.operatingPlanHooks, pricingUpliftLevers: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="How can you increase pricing or margins?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cross-Sell with Existing Assets
                </label>
                <textarea
                  rows={3}
                  value={data.operatingPlanHooks.crossSellAssets}
                  onChange={(e) => setData({
                    ...data,
                    operatingPlanHooks: { ...data.operatingPlanHooks, crossSellAssets: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="How can you cross-sell or leverage existing assets?"
                />
              </div>
            </div>
          ))}

          {/* Funnel & KPI */}
          {renderSection('funnel-kpi', 'Funnel & KPI', '11', (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">KPIs for both search and post-close operations.</p>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search KPIs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Targets Added</label>
                    <input
                      type="number"
                      value={data.funnelKPI.searchKPIs.weeklyTargetsAdded || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          searchKPIs: {
                            ...data.funnelKPI.searchKPIs,
                            weeklyTargetsAdded: parseInt(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Convos/Week</label>
                    <input
                      type="number"
                      value={data.funnelKPI.searchKPIs.newConvosPerWeek || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          searchKPIs: {
                            ...data.funnelKPI.searchKPIs,
                            newConvosPerWeek: parseInt(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IOIs/Month</label>
                    <input
                      type="number"
                      value={data.funnelKPI.searchKPIs.ioIsPerMonth || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          searchKPIs: {
                            ...data.funnelKPI.searchKPIs,
                            ioIsPerMonth: parseInt(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Close KPIs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">MRR/Retainer %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.funnelKPI.postCloseKPIs.mrrRetainerPercent || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          postCloseKPIs: {
                            ...data.funnelKPI.postCloseKPIs,
                            mrrRetainerPercent: parseFloat(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gross Margin (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.funnelKPI.postCloseKPIs.grossMargin || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          postCloseKPIs: {
                            ...data.funnelKPI.postCloseKPIs,
                            grossMargin: parseFloat(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Utilization (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.funnelKPI.postCloseKPIs.utilization || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          postCloseKPIs: {
                            ...data.funnelKPI.postCloseKPIs,
                            utilization: parseFloat(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NRR/Expansion (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.funnelKPI.postCloseKPIs.nrrExpansion || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          postCloseKPIs: {
                            ...data.funnelKPI.postCloseKPIs,
                            nrrExpansion: parseFloat(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Coverage (× months)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.funnelKPI.postCloseKPIs.pipelineCoverageMonths || ''}
                      onChange={(e) => setData({
                        ...data,
                        funnelKPI: {
                          ...data.funnelKPI,
                          postCloseKPIs: {
                            ...data.funnelKPI.postCloseKPIs,
                            pipelineCoverageMonths: parseFloat(e.target.value) || 0,
                          },
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Decision Gate */}
          {renderSection('decision-gate', 'Decision Gate', '12', (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">Final decision point and next actions.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fit Verdict *
                </label>
                <div className="flex gap-4">
                  {(['proceed', 'fix-reevaluate', 'pass'] as const).map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fitVerdict"
                        checked={data.decisionGate.fitVerdict === option}
                        onChange={() => setData({
                          ...data,
                          decisionGate: { ...data.decisionGate, fitVerdict: option },
                        })}
                        className="w-4 h-4 text-torchlight-600 border-gray-300 focus:ring-torchlight-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {option === 'proceed' && '✅ Proceed'}
                        {option === 'fix-reevaluate' && '⚠️ Fix & Re-evaluate'}
                        {option === 'pass' && '❌ Pass'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rationale (2–4 lines) *
                </label>
                <textarea
                  rows={4}
                  value={data.decisionGate.rationale}
                  onChange={(e) => setData({
                    ...data,
                    decisionGate: { ...data.decisionGate, rationale: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="Explain your decision..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Actions (Owner + Due Date) *
                </label>
                <textarea
                  rows={3}
                  value={data.decisionGate.nextActions}
                  onChange={(e) => setData({
                    ...data,
                    decisionGate: { ...data.decisionGate, nextActions: e.target.value },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                  placeholder="e.g., John - Complete market research by 1/15/2024"
                />
              </div>
            </div>
          ))}

           {/* Submit Section */}
           <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
             <div className="text-center space-y-6">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Submit?</h2>
                 <p className="text-gray-600">
                   Review your information above and click submit when ready. A PDF copy of your responses will be downloaded automatically.
                 </p>
               </div>
               
               {/* Status Message */}
               {submitStatus.type && (
                 <div className={`p-4 rounded-lg text-left ${
                   submitStatus.type === 'success' 
                     ? 'bg-torchlight-50 border border-torchlight-200 text-torchlight-900' 
                     : 'bg-red-50 border border-red-200 text-red-900'
                 }`}>
                   <div className="whitespace-pre-line text-sm font-medium mb-2">{submitStatus.message}</div>
                   <button
                     onClick={() => setSubmitStatus({ type: null, message: '' })}
                     className="text-xs underline hover:no-underline"
                   >
                     Dismiss
                   </button>
                 </div>
               )}
               
               <button
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 className="px-8 py-4 bg-torchlight-green-600 text-white rounded-lg hover:bg-torchlight-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg font-semibold transition-colors"
               >
                 {isSubmitting ? (
                   <>
                     <span className="animate-spin">⏳</span>
                     Submitting...
                   </>
                 ) : (
                   <>
                     <Check className="w-6 h-6" />
                     Complete Onboarding
                   </>
                 )}
               </button>
             </div>
           </section>

          {/* Bottom Spacing */}
          <div className="h-20"></div>
        </div>
      </main>

      {/* Printable Form Modal */}
      {showPrintableForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <div id="printable-form-container">
              <FilledPrintableForm data={data} onClose={() => setShowPrintableForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;