import React, { useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';

const CompanySelector = () => {
  const { activeCompany, companies, selectCompany } = useCompany();
  const [isOpen, setIsOpen] = useState(false);

  if (companies.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="font-medium text-gray-900 max-w-32 truncate">
            {activeCompany?.name || 'Seleccionar empresa'}
          </span>
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">
              Seleccionar Empresa ({companies.length})
            </div>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  selectCompany(company);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeCompany?.id === company.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activeCompany?.id === company.id ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{company.name}</div>
                    <div className="text-xs text-gray-500 truncate">RUC: {company.ruc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;