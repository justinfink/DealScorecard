import React from 'react';

interface PrintableFormProps {
  onClose: () => void;
}

export const PrintableForm: React.FC<PrintableFormProps> = ({ onClose }) => {
  return (
    <div className="printable-form bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Torchlight</h1>
        <p className="text-xl text-gray-600">Operating System for ETA - Onboarding Form</p>
        <p className="text-sm text-gray-500 mt-2">Please fill out this form and return it to complete your onboarding</p>
      </div>

      {/* Section 1: Background & Interests */}
      <div className="mb-8 page-break-after">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          1. Your Background & Interests
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Professional Background *
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[120px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Please describe your professional background, education, and work experience)</div>
            <div className="h-24"></div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Interests & Goals *
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[120px] p-3">
            <div className="text-gray-400 text-sm mb-1">(What interests you about ETA? What are your goals and what type of business are you looking for?)</div>
            <div className="h-24"></div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Relevant Experience
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[120px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Any relevant experience in operations, management, or entrepreneurship?)</div>
            <div className="h-24"></div>
          </div>
        </div>
      </div>

      {/* Section 2: Deal Filters */}
      <div className="mb-8 page-break-after">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          2. Deal Filters
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Employee Count Ranges * (Check all that apply)
          </label>
          <div className="grid grid-cols-4 gap-3 mb-2">
            {['1-10', '11-25', '26-50', '51-100', '101-250', '251-500', '501-1000', '1000+'].map((range) => (
              <label key={range} className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">{range}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Revenue Ranges * (Check all that apply)
          </label>
          <div className="grid grid-cols-4 gap-3 mb-2">
            {['$0-500K', '$500K-1M', '$1M-2.5M', '$2.5M-5M', '$5M-10M', '$10M-25M', '$25M-50M', '$50M+'].map((range) => (
              <label key={range} className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">{range}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Locations
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[80px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Enter location(s) - e.g., California, New York, Remote)</div>
            <div className="h-12"></div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Customer Type
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[40px] p-3">
            <div className="text-gray-400 text-sm">(e.g., B2B, B2C, B2G, etc.)</div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Business Model (Check all that apply)
          </label>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {['SaaS', 'Services', 'Manufacturing', 'Distribution', 'E-commerce', 'Marketplace', 'Other'].map((model) => (
              <label key={model} className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">{model}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Customer
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[40px] p-3">
            <div className="text-gray-400 text-sm">(Who is the end customer? - e.g., Small businesses, Enterprise, Consumers)</div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Industry NAICS Code(s)
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[80px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Enter NAICS code(s) - e.g., 541511, 541512)</div>
            <div className="h-12"></div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Early Subindustries of Interest
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[80px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Enter subindustry/ies - e.g., Healthcare IT, Financial Services)</div>
            <div className="h-12"></div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Areas of Outreach Risk
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[80px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Enter risk area(s))</div>
            <div className="h-12"></div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deal Killers
          </label>
          <div className="border-2 border-gray-400 border-dashed min-h-[80px] p-3">
            <div className="text-gray-400 text-sm mb-1">(Enter deal killer criteria)</div>
            <div className="h-12"></div>
          </div>
        </div>
      </div>

      {/* Section 3: Scorecard */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          3. Deal Scorecard Builder
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Define your evaluation criteria, set priorities, rankings (0-10), and weights (%). Total weight should equal 100%.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-20">Priority</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold text-gray-700">Criterion</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-32">Ranking (0-10)</th>
                <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-32">Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <tr key={row}>
                  <td className="border border-gray-400 px-3 py-2">
                    <div className="h-6"></div>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <div className="h-6 border-b border-gray-300"></div>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <div className="h-6 border-b border-gray-300"></div>
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    <div className="h-6 border-b border-gray-300"></div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={2} className="border border-gray-400 px-3 py-2 text-right font-semibold">
                  Totals:
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  <div className="h-6 border-b border-gray-300"></div>
                </td>
                <td className="border border-gray-400 px-3 py-2">
                  <div className="h-6 border-b border-gray-300"></div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>List your evaluation criteria in priority order (1 = highest priority)</li>
            <li>For each criterion, assign a ranking from 0-10</li>
            <li>Assign a weight percentage - all weights should sum to 100%</li>
            <li>Example criteria: Revenue Growth, Market Size, Team Quality, Competitive Position, etc.</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>Torchlight - Operating System for ETA | Onboarding Form</p>
        <p className="mt-1">Please complete all sections and return this form</p>
      </div>

      {/* Print button - hidden when printing */}
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
