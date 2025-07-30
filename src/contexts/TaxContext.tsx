'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TaxConfig {
  igvRate: number;
  igvLabel: string;
  currency: string;
  currencySymbol: string;
}

interface TaxContextType {
  taxConfig: TaxConfig;
  updateTaxConfig: (config: Partial<TaxConfig>) => void;
  calculateIGV: (amount: number) => number;
  calculateTotal: (subtotal: number) => number;
}

const getStoredBillingConfig = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('billingConfig');
    if (stored) {
      const config = JSON.parse(stored);
      return {
        igvRate: (config.igv || 18) / 100, // Convertir de porcentaje a decimal
        igvLabel: 'IGV',
        currency: 'PEN',
        currencySymbol: 'S/'
      };
    }
  }
  return {
    igvRate: 0.18, // 18% por defecto
    igvLabel: 'IGV',
    currency: 'PEN',
    currencySymbol: 'S/'
  };
};

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(getStoredBillingConfig());

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setTaxConfig(getStoredBillingConfig());
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar evento personalizado para cambios internos
    window.addEventListener('billingConfigChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('billingConfigChanged', handleStorageChange);
    };
  }, []);

  const updateTaxConfig = (config: Partial<TaxConfig>) => {
    const newConfig = { ...taxConfig, ...config };
    setTaxConfig(newConfig);
    
    // Actualizar localStorage si es necesario
    if (typeof window !== 'undefined' && config.igvRate) {
      const stored = localStorage.getItem('billingConfig');
      const billingConfig = stored ? JSON.parse(stored) : {};
      billingConfig.igv = config.igvRate * 100; // Convertir a porcentaje
      localStorage.setItem('billingConfig', JSON.stringify(billingConfig));
      
      // Disparar evento para notificar cambios
      window.dispatchEvent(new Event('billingConfigChanged'));
    }
  };

  const calculateIGV = (amount: number): number => {
    return amount * taxConfig.igvRate;
  };

  const calculateTotal = (subtotal: number): number => {
    return subtotal + calculateIGV(subtotal);
  };

  return (
    <TaxContext.Provider value={{
      taxConfig,
      updateTaxConfig,
      calculateIGV,
      calculateTotal
    }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = (): TaxContextType => {
  const context = useContext(TaxContext);
  if (context === undefined) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
};

export default TaxContext;