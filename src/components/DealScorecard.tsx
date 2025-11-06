import React, { useState } from 'react';
import { ScorecardFactor, PRE_BUILT_SCORECARD_FACTORS } from '../types';
import { Plus, X, Edit2, Save, XCircle } from 'lucide-react';

interface DealScorecardProps {
  factors: ScorecardFactor[];
  onChange: (factors: ScorecardFactor[]) => void;
}

export const DealScorecard: React.FC<DealScorecardProps> = ({ factors, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFactorName, setNewFactorName] = useState('');
  const [newFactorDefinition, setNewFactorDefinition] = useState('');

  // Initialize with pre-built factors if empty
  React.useEffect(() => {
    if (factors.length === 0) {
      const initialFactors: ScorecardFactor[] = PRE_BUILT_SCORECARD_FACTORS.map((factor) => ({
        ...factor,
        weight: 10, // 10 factors, 10% each = 100%
        score: 0,
        weighted: 0,
      }));
      onChange(initialFactors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factors.length]);

  const updateFactor = (id: string, field: 'weight' | 'score' | 'name' | 'definition', value: number | string) => {
    const updated = factors.map((factor) => {
      if (factor.id === id) {
        return { ...factor, [field]: value };
      }
      return factor;
    });
    onChange(updated);
  };

  const addFactor = () => {
    if (newFactorName.trim()) {
      const newFactor: ScorecardFactor = {
        id: `custom-${Date.now()}`,
        name: newFactorName.trim(),
        definition: newFactorDefinition.trim() || '',
        weight: 0,
        score: 0,
        weighted: 0,
      };
      onChange([...factors, newFactor]);
      setNewFactorName('');
      setNewFactorDefinition('');
    }
  };

  const removeFactor = (id: string) => {
    onChange(factors.filter(f => f.id !== id));
  };

  const [editValues, setEditValues] = useState<{ name: string; definition: string }>({ name: '', definition: '' });

  const startEditing = (factor: ScorecardFactor) => {
    setEditingId(factor.id);
    setEditValues({ name: factor.name, definition: factor.definition });
  };

  const saveEdit = (id: string) => {
    updateFactor(id, 'name', editValues.name);
    updateFactor(id, 'definition', editValues.definition);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', definition: '' });
  };

  // Calculate dynamic total for weight column
  const totalWeight = factors.reduce((sum, f) => sum + (f.weight || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Instructions:</strong> Assign weight percentages to each factor. All weights must sum to 100%. You can edit, add, or remove factors.
        </p>
      </div>

      {/* Add New Factor */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Factor</label>
        <div className="space-y-2">
          <input
            type="text"
            value={newFactorName}
            onChange={(e) => setNewFactorName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFactor();
              }
            }}
            placeholder="Factor name (e.g., Market Size, Team Quality)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            value={newFactorDefinition}
            onChange={(e) => setNewFactorDefinition(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFactor();
              }
            }}
            placeholder="Definition (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addFactor}
            disabled={!newFactorName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Factor
          </button>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Factor</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Definition</th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-32">Weight (%)</th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {factors.length > 0 ? factors.map((factor) => (
              <tr key={factor.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">
                  {editingId === factor.id ? (
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(factor.id);
                        }
                        if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{factor.name}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {editingId === factor.id ? (
                    <input
                      type="text"
                      value={editValues.definition}
                      onChange={(e) => setEditValues({ ...editValues, definition: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(factor.id);
                        }
                        if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{factor.definition || <span className="text-gray-400 italic">No definition</span>}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={factor.weight || ''}
                    onChange={(e) => updateFactor(factor.id, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === factor.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(factor.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(factor)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFactor(factor.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-4 py-3 text-center text-gray-500">
                  No factors yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={2} className="border border-gray-300 px-4 py-3 text-right">
                TOTAL
              </td>
              <td className={`border border-gray-300 px-4 py-3 text-center ${
                totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {totalWeight.toFixed(1)}%
                {totalWeight !== 100 && (
                  <span className="text-xs block text-gray-500 mt-1">
                    {totalWeight < 100 ? 'Under' : 'Over'} 100%
                  </span>
                )}
              </td>
              <td className="border border-gray-300 px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Quick Suggestions */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">💡 Common additional factors:</p>
        <div className="flex flex-wrap gap-2">
          {['Market Size', 'Team Quality', 'Technology Stack', 'Customer LTV', 'Competitive Moats'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setNewFactorName(suggestion);
                setNewFactorDefinition('');
              }}
              className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 text-gray-700"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};