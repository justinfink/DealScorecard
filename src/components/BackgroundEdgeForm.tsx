import React from 'react';
import { BackgroundEdge } from '../types';
import { Plus, X } from 'lucide-react';

interface BackgroundEdgeFormProps {
  data: BackgroundEdge;
  onChange: (data: BackgroundEdge) => void;
}

export const BackgroundEdgeForm: React.FC<BackgroundEdgeFormProps> = ({ data, onChange }) => {
  const handleChange = (section: 'experienceMap' | 'credibilityAnchors', field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value,
      },
    });
  };

  const addSuperpower = () => {
    if (data.experienceMap.operatingSuperpowers.length < 3) {
      handleChange('experienceMap', 'operatingSuperpowers', [
        ...data.experienceMap.operatingSuperpowers,
        '',
      ]);
    }
  };

  const updateSuperpower = (index: number, value: string) => {
    const updated = [...data.experienceMap.operatingSuperpowers];
    updated[index] = value;
    handleChange('experienceMap', 'operatingSuperpowers', updated);
  };

  const removeSuperpower = (index: number) => {
    const updated = data.experienceMap.operatingSuperpowers.filter((_, i) => i !== index);
    handleChange('experienceMap', 'operatingSuperpowers', updated);
  };

  const addGap = () => {
    if (data.experienceMap.knownGaps.length < 3) {
      handleChange('experienceMap', 'knownGaps', [...data.experienceMap.knownGaps, '']);
    }
  };

  const updateGap = (index: number, value: string) => {
    const updated = [...data.experienceMap.knownGaps];
    updated[index] = value;
    handleChange('experienceMap', 'knownGaps', updated);
  };

  const removeGap = (index: number) => {
    const updated = data.experienceMap.knownGaps.filter((_, i) => i !== index);
    handleChange('experienceMap', 'knownGaps', updated);
  };

  return (
    <div className="space-y-8">
      <p className="text-gray-600 mb-4">Your experience, strengths, and credibility anchors.</p>

      {/* Experience Map */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1.1 Experience Map</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Functional Strengths *
            </label>
            <input
              type="text"
              value={data.experienceMap.functionalStrengths}
              onChange={(e) => handleChange('experienceMap', 'functionalStrengths', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., GTM, ops, product, compliance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Familiarity (rank 1–5) *
            </label>
            <select
              value={data.experienceMap.industryFamiliarity}
              onChange={(e) => handleChange('experienceMap', 'industryFamiliarity', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Select...</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} - {num === 1 ? 'Novice' : num === 5 ? 'Expert' : 'Intermediate'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Exposure (if any)
            </label>
            <textarea
              rows={2}
              value={data.experienceMap.dealExposure}
              onChange={(e) => handleChange('experienceMap', 'dealExposure', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe any deal exposure or M&A experience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operating Superpowers (3)
            </label>
            {data.experienceMap.operatingSuperpowers.map((power, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={power}
                  onChange={(e) => updateSuperpower(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Superpower ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeSuperpower(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {data.experienceMap.operatingSuperpowers.length < 3 && (
              <button
                type="button"
                onClick={addSuperpower}
                className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Superpower
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Known Gaps (3)
            </label>
            {data.experienceMap.knownGaps.map((gap, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={gap}
                  onChange={(e) => updateGap(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Gap ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeGap(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {data.experienceMap.knownGaps.length < 3 && (
              <button
                type="button"
                onClick={addGap}
                className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Gap
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Credibility Anchors */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1.2 Credibility Anchors</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logos / Roles That Open Doors
            </label>
            <input
              type="text"
              value={data.credibilityAnchors.logosRoles}
              onChange={(e) => handleChange('credibilityAnchors', 'logosRoles', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Former VP at Google, IBM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regulatory or Technical Domains
            </label>
            <input
              type="text"
              value={data.credibilityAnchors.regulatoryDomains}
              onChange={(e) => handleChange('credibilityAnchors', 'regulatoryDomains', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., HIPAA, SOC2, PCI compliance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audience Where You're Already Trusted (buyers/users)
            </label>
            <input
              type="text"
              value={data.credibilityAnchors.audienceTrusted}
              onChange={(e) => handleChange('credibilityAnchors', 'audienceTrusted', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., SMB owners, healthcare execs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
