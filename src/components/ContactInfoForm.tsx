import React from 'react';

interface ContactInfoFormProps {
  email: string;
  onChange: (email: string) => void;
}

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ email, onChange }) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-4">We'll send a copy of your responses to this email address.</p>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your.email@example.com"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          A confirmation email with your responses will be sent to this address.
        </p>
      </div>
    </div>
  );
};
