'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SeriesConfig {
  facturas: { serie: string; numero: number };
  boletas: { serie: string; numero: number };
  notasCredito: { serie: string; numero: number };
  notasDebito: { serie: string; numero: number };
  guiasRemision: { serie: string; numero: number };
}

interface SeriesContextType {
  seriesConfig: SeriesConfig;
  getNextNumber: (tipo: keyof SeriesConfig) => string;
  updateSeries: (tipo: keyof SeriesConfig, serie: string, numero: number) => void;
}

const defaultSeriesConfig: SeriesConfig = {
  facturas: { serie: 'F001', numero: 1 },
  boletas: { serie: 'B001', numero: 1 },
  notasCredito: { serie: 'FC01', numero: 1 },
  notasDebito: { serie: 'FD01', numero: 1 },
  guiasRemision: { serie: 'T001', numero: 1 }
};

const getStoredSeriesConfig = (): SeriesConfig => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('seriesConfig');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return defaultSeriesConfig;
};

const SeriesContext = createContext<SeriesContextType | undefined>(undefined);

export const SeriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seriesConfig, setSeriesConfig] = useState<SeriesConfig>(getStoredSeriesConfig());

  // Guardar en localStorage cuando cambie la configuración
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seriesConfig', JSON.stringify(seriesConfig));
    }
  }, [seriesConfig]);

  const getNextNumber = (tipo: keyof SeriesConfig): string => {
    const config = seriesConfig[tipo];
    const numeroFormateado = config.numero.toString().padStart(6, '0');
    
    // Incrementar el número para la próxima vez
    setSeriesConfig(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        numero: prev[tipo].numero + 1
      }
    }));
    
    return `${config.serie}-${numeroFormateado}`;
  };

  const updateSeries = (tipo: keyof SeriesConfig, serie: string, numero: number) => {
    setSeriesConfig(prev => ({
      ...prev,
      [tipo]: { serie, numero }
    }));
  };

  return (
    <SeriesContext.Provider value={{
      seriesConfig,
      getNextNumber,
      updateSeries
    }}>
      {children}
    </SeriesContext.Provider>
  );
};

export const useSeries = (): SeriesContextType => {
  const context = useContext(SeriesContext);
  if (context === undefined) {
    throw new Error('useSeries must be used within a SeriesProvider');
  }
  return context;
};

export default SeriesContext;