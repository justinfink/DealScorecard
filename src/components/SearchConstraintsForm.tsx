import React from 'react';
import { SearchConstraints } from '../types';

interface SearchConstraintsFormProps {
  data: SearchConstraints;
  onChange: (data: SearchConstraints) => void;
}

export const SearchConstraintsForm: React.FC<SearchConstraintsFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof SearchConstraints, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleDealStructureChange = (field: keyof SearchConstraints['dealStructures'], value: boolean) => {
    onChange({
      ...data,
      dealStructures: { ...data.dealStructures, [field]: value },
    });
  };


  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-4">Define your search parameters and deal constraints.</p>

      {/* Revenue Band */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Revenue Min ($M)
          </label>
          <input
            type="number"
            step="0.5"
            value={data.revenueMin || ''}
            onChange={(e) => handleChange('revenueMin', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Revenue Max ($M)
          </label>
          <input
            type="number"
            step="0.5"
            value={data.revenueMax || ''}
            onChange={(e) => handleChange('revenueMax', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10"
          />
        </div>
      </div>

      {/* EBITDA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            EBITDA Min ($M) or Margin Min (%)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={data.ebitdaMin || ''}
              onChange={(e) => handleChange('ebitdaMin', parseFloat(e.target.value) || 0)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="$M"
            />
            <input
              type="number"
              step="1"
              value={data.ebitdaMarginMin || ''}
              onChange={(e) => handleChange('ebitdaMarginMin', parseFloat(e.target.value) || 0)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="%"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            EBITDA Max ($M) or Margin Max (%)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={data.ebitdaMax || ''}
              onChange={(e) => handleChange('ebitdaMax', parseFloat(e.target.value) || 0)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="$M"
            />
            <input
              type="number"
              step="1"
              value={data.ebitdaMarginMax || ''}
              onChange={(e) => handleChange('ebitdaMarginMax', parseFloat(e.target.value) || 0)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="%"
            />
          </div>
        </div>
      </div>

      {/* Headcount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Headcount Max
        </label>
        <input
          type="number"
          value={data.headcountMax || ''}
          onChange={(e) => handleChange('headcountMax', parseInt(e.target.value) || 0)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="100"
        />
      </div>

      {/* Geography */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geography: Must-Have
          </label>
          <input
            type="text"
            value={data.geographyMustHave.join(', ')}
            onChange={(e) => handleChange('geographyMustHave', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., US, California, Remote OK"
          />
          <p className="mt-1 text-xs text-gray-500">Comma-separated list</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geography: Nice-to-Have
          </label>
          <input
            type="text"
            value={data.geographyNiceToHave.join(', ')}
            onChange={(e) => handleChange('geographyNiceToHave', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., East Coast, Europe"
          />
        </div>
      </div>

      {/* Owner Profile */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Age / Profile
          </label>
          <input
            type="text"
            value={data.ownerAge}
            onChange={(e) => handleChange('ownerAge', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 55+, retirement age"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Intent
          </label>
          <input
            type="text"
            value={data.ownerIntent}
            onChange={(e) => handleChange('ownerIntent', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Ready to exit, succession planning"
          />
        </div>
      </div>

      {/* Deal Structures */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deal Structures OK
        </label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'sba', label: 'SBA' },
            { key: 'cash', label: 'Cash' },
            { key: 'sellerNote', label: 'Seller Note' },
            { key: 'earnout', label: 'Earnout' },
            { key: 'minority', label: 'Minority' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.dealStructures[key]}
                onChange={(e) => handleDealStructureChange(key, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
