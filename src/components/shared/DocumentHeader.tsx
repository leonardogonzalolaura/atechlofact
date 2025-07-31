import React from 'react';

interface DocumentHeaderProps {
  title: string;
  onClose: () => void;
}

const DocumentHeader = ({ title, onClose }: DocumentHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 sm:p-6 border-b">
      <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">{title}</h2>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default DocumentHeader;