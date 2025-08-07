'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCompany } from './CompanyContext';
import { useProducts } from '../hooks/useProducts';
import { useSequences } from '../hooks/useSequences';

interface DataContextType {
  dataLoaded: boolean;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { activeCompany } = useCompany();
  
  // Solo inicializar los hooks, no los usamos aquí
  useProducts();
  useSequences();

  useEffect(() => {
    if (activeCompany?.id && !dataLoaded && !loading) {
      setLoading(true);
      // Dar tiempo para que los hooks se ejecuten
      setTimeout(() => {
        setDataLoaded(true);
        setLoading(false);
      }, 1000);
    }
  }, [activeCompany?.id, dataLoaded, loading]);

  return (
    <DataContext.Provider value={{ dataLoaded, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};