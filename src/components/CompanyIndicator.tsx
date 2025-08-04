import React from 'react';
import { useCompany } from '../contexts/CompanyContext';

const CompanyIndicator = () => {
  const { activeCompany, companies } = useCompany();

  if (!activeCompany || companies.length <= 1) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Empresa activa:</span> {activeCompany.name}
            <span className="text-blue-600 ml-2">({activeCompany.ruc})</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyIndicator;