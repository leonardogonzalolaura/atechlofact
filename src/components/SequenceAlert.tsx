'use client'
import React, { useState, useEffect } from 'react';
import { useSeries } from '../contexts/SeriesContext';
import { useCompany } from '../contexts/CompanyContext';

interface SequenceAlertProps {
  onOpenSettings: () => void;
}

const SequenceAlert = ({ onOpenSettings }: SequenceAlertProps) => {
  const { checkSequences } = useSeries();
  const { hasCompanies, activeCompany, loading: companyLoading } = useCompany();
  const [hasSequences, setHasSequences] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkCompanySequences = async () => {
      // Wait for company context to finish loading
      if (companyLoading) return;
      
      if (!activeCompany?.id || !hasCompanies) {
        setHasSequences(true); // Don't show alert if no company
        return;
      }
      
      try {
        setLoading(true);
        const sequences = await checkSequences(activeCompany.id);
        setHasSequences(sequences);
      } catch (error) {
        console.error('Error checking sequences:', error);
        setHasSequences(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkCompanySequences();
    
    // Listen for sequence changes
    const handleSequenceChange = () => {
      if (activeCompany?.id && hasCompanies && !companyLoading) {
        checkCompanySequences();
      }
    };
    
    window.addEventListener('sequenceCreated', handleSequenceChange);
    window.addEventListener('sequenceUpdated', handleSequenceChange);
    window.addEventListener('sequenceDeleted', handleSequenceChange);
    
    return () => {
      window.removeEventListener('sequenceCreated', handleSequenceChange);
      window.removeEventListener('sequenceUpdated', handleSequenceChange);
      window.removeEventListener('sequenceDeleted', handleSequenceChange);
    };
  }, [activeCompany?.id, hasCompanies, companyLoading]);

  // No mostrar si está cargando, no hay empresas, o sí hay correlativos
  if (loading || companyLoading || !hasCompanies || hasSequences) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Correlativos Requeridos
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Para crear facturas y otros documentos, necesita configurar al menos un correlativo de numeración.
            </p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                onClick={onOpenSettings}
                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                Configurar Correlativos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceAlert;