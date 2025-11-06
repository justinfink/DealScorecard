import React, { useState } from 'react';
import { PriorityStack, NonNegotiables } from '../types';
import { Plus, X } from 'lucide-react';

interface PrioritiesNonNegotiablesData {
  priorityStack: PriorityStack;
  nonNegotiables: NonNegotiables;
}

interface PrioritiesNonNegotiablesFormProps {
  data: PrioritiesNonNegotiablesData;
  onChange: (data: PrioritiesNonNegotiablesData) => void;
}

export const PrioritiesNonNegotiablesForm: React.FC<PrioritiesNonNegotiablesFormProps> = ({ data, onChange }) => {
  const [newExclusion, setNewExclusion] = useState<{ type: keyof NonNegotiables; value: string } | null>(null);

  const priorityFields = [
    { key: 'growthRate' as const, label: 'Growth Rate' },
    { key: 'profitability' as const, label: 'Profitability' },
    { key: 'recurringRevenue' as const, label: 'Recurring Revenue' },
    { key: 'lowPeopleIntensity' as const, label: 'Low People Intensity' },
    { key: 'regSimplicity' as const, label: 'Reg Simplicity' },
    { key: 'ownerSuccessionTiming' as const, label: 'Owner Succession Timing' },
    { key: 'geography' as const, label: 'Geography' },
    { key: 'missionValues' as const, label: 'Mission/Values' },
  ];

  const updatePriority = (field: keyof PriorityStack, value: number) => {
    onChange({
      ...data,
      priorityStack: { ...data.priorityStack, [field]: value },
    });
  };

  const addExclusion = (type: keyof NonNegotiables) => {
    setNewExclusion({ type, value: '' });
  };

  const saveExclusion = () => {
    if (newExclusion && newExclusion.value.trim()) {
      const type = newExclusion.type;
      onChange({
        ...data,
        nonNegotiables: {
          ...data.nonNegotiables,
          [type]: [...data.nonNegotiables[type], newExclusion.value.trim()],
        },
      });
      setNewExclusion(null);
    }
  };

  const removeExclusion = (type: keyof NonNegotiables, index: number) => {
    const updated = [...data.nonNegotiables[type]];
    updated.splice(index, 1);
    onChange({
      ...data,
      nonNegotiables: { ...data.nonNegotiables, [type]: updated },
    });
  };

  return (
    <div className="space-y-8">
      <p className="text-gray-600 mb-4">Rank your priorities and define hard stops.</p>

      {/* Priority Stack */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Stack (rank 1-8)</h3>
        <div className="space-y-3">
          {priorityFields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-48 text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                min="1"
                max="8"
                value={data.priorityStack[key] || ''}
                onChange={(e) => updatePriority(key, parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                placeholder="Rank"
              />
              <span className="text-xs text-gray-500">(1 = highest priority)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Negotiables */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Non-Negotiables (Hard Stops)</h3>
        <div className="space-y-4">
          {([
            { key: 'industryExclusions' as const, label: 'Industry/Vertical Exclusions', placeholder: 'e.g., Healthcare, Food Service' },
            { key: 'businessModelExclusions' as const, label: 'Business Model Exclusions', placeholder: 'e.g., Heavy field service, Commodity agencies' },
            { key: 'customerMixExclusions' as const, label: 'Customer Mix Exclusions', placeholder: 'e.g., <Mid-market, Gov-only' },
            { key: 'contractRevExclusions' as const, label: 'Contract/Revenue Exclusions', placeholder: 'e.g., <40% recurring' },
            { key: 'peopleRiskExclusions' as const, label: 'People Risk Exclusions', placeholder: 'e.g., Single-founder key-person' },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="space-y-2">
                {data.nonNegotiables[key].map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...data.nonNegotiables[key]];
                        updated[index] = e.target.value;
                        onChange({
                          ...data,
                          nonNegotiables: { ...data.nonNegotiables, [key]: updated },
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => removeExclusion(key, index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newExclusion?.type === key ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newExclusion.value}
                      onChange={(e) => setNewExclusion({ ...newExclusion, value: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveExclusion();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={placeholder}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveExclusion}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExclusion(null)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addExclusion(key)}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exclusion
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
