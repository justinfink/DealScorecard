import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityStack, NonNegotiables } from '../types';
import { Plus, X, GripVertical, Edit2, Save, XCircle } from 'lucide-react';

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
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Priority fields with editable labels
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

  // Store custom labels (if user edits them) - persist in localStorage
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('priority-custom-labels');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save custom labels to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('priority-custom-labels', JSON.stringify(customLabels));
    } catch (error) {
      console.error('Error saving custom labels:', error);
    }
  }, [customLabels]);

  // Convert priority stack to ordered array for drag and drop
  const [orderedPriorities, setOrderedPriorities] = useState(() => {
    return priorityFields.map((field) => ({
      ...field,
      currentRank: data.priorityStack[field.key] || 0,
    })).sort((a, b) => {
      const rankA = a.currentRank || 999;
      const rankB = b.currentRank || 999;
      return rankA - rankB || priorityFields.indexOf(a) - priorityFields.indexOf(b);
    });
  });

  // Sync when data changes externally
  useEffect(() => {
    const sorted = priorityFields.map((field) => ({
      ...field,
      currentRank: data.priorityStack[field.key] || 0,
    })).sort((a, b) => {
      const rankA = a.currentRank || 999;
      const rankB = b.currentRank || 999;
      return rankA - rankB || priorityFields.indexOf(a) - priorityFields.indexOf(b);
    });
    setOrderedPriorities(sorted);
  }, [data.priorityStack]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = orderedPriorities.findIndex(item => item.key === active.id);
    const newIndex = orderedPriorities.findIndex(item => item.key === over.id);

    const newItems = arrayMove(orderedPriorities, oldIndex, newIndex);

    // Update ranks based on new order
    const newPriorityStack: PriorityStack = { ...data.priorityStack };
    newItems.forEach((item, index) => {
      newPriorityStack[item.key] = index + 1;
    });

    setOrderedPriorities(newItems.map((item, index) => ({
      ...item,
      currentRank: index + 1,
    })));

    onChange({
      ...data,
      priorityStack: newPriorityStack,
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

  const startEditing = (key: string, currentLabel: string) => {
    setEditingPriority(key);
    setEditValue(customLabels[key] || currentLabel);
  };

  const saveEdit = (key: string) => {
    if (editValue.trim()) {
      setCustomLabels({ ...customLabels, [key]: editValue.trim() });
      setEditingPriority(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingPriority(null);
    setEditValue('');
  };

  const getPriorityLabel = (key: string, defaultLabel: string) => {
    return customLabels[key] || defaultLabel;
  };

  // Sortable Priority Item Component
  const SortablePriorityItem = ({ 
    item, 
    editingPriority, 
    editValue, 
    setEditValue, 
    startEditing, 
    saveEdit, 
    cancelEdit, 
    getPriorityLabel 
  }: {
    item: typeof priorityFields[0] & { currentRank: number };
    editingPriority: string | null;
    editValue: string;
    setEditValue: (value: string) => void;
    startEditing: (key: string, currentLabel: string) => void;
    saveEdit: (key: string) => void;
    cancelEdit: () => void;
    getPriorityLabel: (key: string, defaultLabel: string) => string;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.key });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`flex items-center gap-3 p-3 border rounded-lg bg-white cursor-grab active:cursor-grabbing ${
          isDragging ? 'shadow-lg border-torchlight-500 opacity-50' : 'border-gray-300 hover:border-torchlight-300'
        }`}
      >
        <div className="text-gray-400 hover:text-gray-600 pointer-events-none">
          <GripVertical className="w-5 h-5" />
        </div>
        {editingPriority === item.key ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveEdit(item.key);
                }
                if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-torchlight-500 focus:border-transparent text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                saveEdit(item.key);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-torchlight-600 hover:text-torchlight-800"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cancelEdit();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-gray-800"
              title="Cancel"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span 
                     className="flex-1 text-sm font-medium text-gray-900 cursor-text hover:text-torchlight-600"
              onClick={(e) => {
                e.stopPropagation();
                startEditing(item.key, item.label);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Click to edit"
            >
              {getPriorityLabel(item.key, item.label)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startEditing(item.key, item.label);
              }}
              onMouseDown={(e) => e.stopPropagation()}
                     className="text-torchlight-600 hover:text-torchlight-800"
              title="Edit label"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <p className="text-gray-600 mb-4">Rank your priorities and define hard stops.</p>

      {/* Priority Stack */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Stack</h3>
        <p className="text-sm text-gray-600 mb-4">Drag and drop to reorder priorities (top = highest priority)</p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedPriorities.map(item => item.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {orderedPriorities.map((item) => (
                <SortablePriorityItem
                  key={item.key}
                  item={item}
                  editingPriority={editingPriority}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                  getPriorityLabel={getPriorityLabel}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-torchlight-500 focus:border-transparent"
                      placeholder={placeholder}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveExclusion}
                      className="px-3 py-2 bg-torchlight-600 text-white rounded-lg hover:bg-torchlight-700"
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
                    className="px-4 py-2 text-sm text-torchlight-600 hover:text-torchlight-700 flex items-center gap-2"
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
