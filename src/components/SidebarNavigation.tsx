import React from 'react';
import { Check } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarNavigationProps {
  sections: Section[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  completedSections: Set<string>;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sections,
  activeSection,
  onSectionClick,
  completedSections,
}) => {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 pt-24 pb-8 overflow-y-auto z-30">
      <div className="px-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Sections
        </h2>
        <nav className="space-y-2">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isCompleted = completedSections.has(section.id);
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold'
                    : isCompleted
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                    }`}>
                      <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
