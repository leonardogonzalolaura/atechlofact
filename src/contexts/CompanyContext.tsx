'use client'
import React, { createContext, useContext } from 'react';
import { useActiveCompany } from '../hooks/useActiveCompany';

interface CompanyData {
  ruc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: string;
}

interface Company {
  id: string;
  name: string;
  business_name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
}

interface CompanyContextType {
  companyData: CompanyData;
  updateCompanyData: (data: Partial<CompanyData>) => void;
  activeCompany: Company | null;
  companies: Company[];
  loading: boolean;
  error: string | null;
  selectCompany: (company: Company) => void;
  reloadCompanies: () => void;
  hasCompanies: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeCompany,
    companies,
    loading,
    error,
    selectCompany,
    reloadCompanies,
    hasCompanies
  } = useActiveCompany();

  // Convertir datos de empresa activa al formato legacy
  const companyData: CompanyData = activeCompany ? {
    ruc: activeCompany.ruc,
    razonSocial: activeCompany.business_name || activeCompany.name,
    direccion: activeCompany.address,
    telefono: activeCompany.phone,
    email: activeCompany.email,
    logo: activeCompany.logo_url
  } : {
    ruc: '',
    razonSocial: '',
    direccion: '',
    telefono: '',
    email: '',
    logo: ''
  };

  console.log('CompanyContext state:', { 
    hasCompanies, 
    companiesCount: companies.length, 
    activeCompany: activeCompany?.name,
    loading 
  });

  const updateCompanyData = (data: Partial<CompanyData>) => {
    // Esta función se mantiene para compatibilidad pero no hace nada
    // Los datos reales se actualizan a través de Settings
    console.log('updateCompanyData called with:', data);
  };

  return (
    <CompanyContext.Provider value={{
      companyData,
      updateCompanyData,
      activeCompany,
      companies,
      loading,
      error,
      selectCompany,
      reloadCompanies,
      hasCompanies: !loading && companies.length > 0
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};