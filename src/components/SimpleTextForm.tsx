import React from 'react';

interface SimpleTextFormProps {
  title: string;
  description?: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder?: string;
    type?: 'text' | 'textarea' | 'number';
    rows?: number;
    suggestions?: string[];
  }>;
  values: { [key: string]: string | number };
  onChange: (values: { [key: string]: string | number }) => void;
}

export const SimpleTextForm: React.FC<SimpleTextFormProps> = ({
  description,
  fields,
  values,
  onChange,
}) => {
  const handleChange = (key: string, value: string | number) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-6">
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              rows={field.rows || 4}
              value={values[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
          ) : (
            <>
              <input
                type={field.type || 'text'}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={field.placeholder}
              />
              {field.suggestions && field.suggestions.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {field.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleChange(field.key, suggestion)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};
