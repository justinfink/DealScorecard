import React from 'react';
import { QuickSummary } from '../types';

interface QuickSummaryFormProps {
  data: QuickSummary;
  onChange: (data: QuickSummary) => void;
}

export const QuickSummaryForm: React.FC<QuickSummaryFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof QuickSummary, value: any) => {
    onChange({ ...data, [field]: value });
  };


  const updateRightToWin = (index: number, value: string) => {
    const updated = [...data.rightToWin];
    updated[index] = value;
    handleChange('rightToWin', updated);
  };

  const addNonNegotiable = () => {
    if (data.nonNegotiables.length < 5) {
      handleChange('nonNegotiables', [...data.nonNegotiables, '']);
    }
  };

  const updateNonNegotiable = (index: number, value: string) => {
    const updated = [...data.nonNegotiables];
    updated[index] = value;
    handleChange('nonNegotiables', updated);
  };

  const suggestions = {
    timezone: ['PST', 'EST', 'CST', 'MST', 'GMT', 'UTC'],
    closeWindow: ['6-12 months', '9-18 months', '12-24 months', '18-36 months'],
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-4">A quick snapshot of your search profile.</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Searcher Name *
        </label>
        <input
          type="text"
          value={data.searcherName}
          onChange={(e) => handleChange('searcherName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Home Base / Timezone *
        </label>
        <input
          type="text"
          value={data.homeBase}
          onChange={(e) => handleChange('homeBase', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., San Francisco, PST"
          list="timezone-suggestions"
        />
        <datalist id="timezone-suggestions">
          {suggestions.timezone.map((tz) => (
            <option key={tz} value={tz} />
          ))}
        </datalist>
        <div className="mt-1 flex flex-wrap gap-2">
          {suggestions.timezone.map((tz) => (
            <button
              key={tz}
              type="button"
              onClick={() => handleChange('homeBase', data.homeBase ? `${data.homeBase.split(',')[0]}, ${tz}` : `, ${tz}`)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            >
              {tz}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Close Window *
        </label>
        <input
          type="text"
          value={data.targetCloseWindow}
          onChange={(e) => handleChange('targetCloseWindow', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 9–18 months"
          list="close-window-suggestions"
        />
        <datalist id="close-window-suggestions">
          {suggestions.closeWindow.map((window) => (
            <option key={window} value={window} />
          ))}
        </datalist>
        <div className="mt-1 flex flex-wrap gap-2">
          {suggestions.closeWindow.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => handleChange('targetCloseWindow', window)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Thesis (1–2 lines) *
        </label>
        <textarea
          rows={3}
          value={data.primaryThesis}
          onChange={(e) => handleChange('primaryThesis', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of your search thesis"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Right-to-Win (3 bullets) *
        </label>
        {[0, 1, 2].map((index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-6">{index + 1}.</span>
              <input
                type="text"
                value={data.rightToWin[index] || ''}
                onChange={(e) => updateRightToWin(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Right-to-win ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Non-Negotiables (max 5)
        </label>
        {data.nonNegotiables.map((item, index) => (
          <div key={index} className="mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateNonNegotiable(index, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Non-negotiable ${index + 1}`}
            />
          </div>
        ))}
        {data.nonNegotiables.length < 5 && (
          <button
            type="button"
            onClick={addNonNegotiable}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Non-Negotiable
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Go/No-Go Snapshot *
        </label>
        <div className="flex gap-4">
          {(['go', 'conditional', 'no-go'] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="goNoGo"
                value={option}
                checked={data.goNoGo === option}
                onChange={() => handleChange('goNoGo', option)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {option === 'go' && '✅ Go'}
                {option === 'conditional' && '⚠️ Conditional'}
                {option === 'no-go' && '❌ No-Go'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
