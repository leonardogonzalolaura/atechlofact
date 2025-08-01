'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompanyData {
  ruc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: string;
}

interface CompanyContextType {
  companyData: CompanyData;
  updateCompanyData: (data: Partial<CompanyData>) => void;
}

const defaultCompanyData: CompanyData = {
  ruc: '20123456789',
  razonSocial: 'Mi Empresa S.A.C.',
  direccion: 'Av. Principal 123, Lima',
  telefono: '01-234-5678',
  email: 'contacto@miempresa.com'
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompanyData);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('companyData');
      if (stored) {
        setCompanyData(JSON.parse(stored));
      }
    }
  }, []);

  const updateCompanyData = (data: Partial<CompanyData>) => {
    const newData = { ...companyData, ...data };
    setCompanyData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('companyData', JSON.stringify(newData));
    }
  };

  return (
    <CompanyContext.Provider value={{ companyData, updateCompanyData }}>
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