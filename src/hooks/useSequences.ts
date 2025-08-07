import { useState, useEffect, useCallback } from 'react';
import { sequenceService } from '../services/sequenceService';
import { Sequence } from '../services/sequenceTypes';
import { useCompany } from '../contexts/CompanyContext';

export const useSequences = () => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { activeCompany } = useCompany();
  
  // Cache duration: 30 minutes
  const CACHE_DURATION = 30 * 60 * 1000;

  const loadSequences = useCallback(async (forceRefresh = false) => {
    if (!activeCompany?.id) return;
    
    // Check cache validity
    const now = Date.now();
    const cacheKey = `sequences_${activeCompany.id}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cachedData && cacheTimestamp) {
      const age = now - parseInt(cacheTimestamp);
      if (age < CACHE_DURATION) {
        const cached = JSON.parse(cachedData);
        setSequences(cached);
        setLastFetch(parseInt(cacheTimestamp));
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await sequenceService.getSequences(activeCompany.id);
      const sequencesData = response.data || [];
      
      setSequences(sequencesData);
      setLastFetch(now);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(sequencesData));
      localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
    } catch (err: any) {
      if (err.message === 'Sesión expirada') {
        setError('Sesión expirada');
      } else {
        setError('Error cargando correlativos');
      }
      console.error('Error loading sequences:', err);
      setSequences([]);
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id, CACHE_DURATION]);

  const createSequence = async (sequenceData: any) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await sequenceService.createSequence(activeCompany.id, sequenceData);
      
      // Clear cache and force refresh
      const cacheKey = `sequences_${activeCompany.id}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadSequences(true);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error creando correlativo');
    }
  };

  const updateSequence = async (sequenceId: number, sequenceData: any) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await sequenceService.updateSequence(activeCompany.id, sequenceId, sequenceData);
      
      // Clear cache and force refresh
      const cacheKey = `sequences_${activeCompany.id}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadSequences(true);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error actualizando correlativo');
    }
  };

  const deleteSequence = async (sequenceId: number) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await sequenceService.deleteSequence(activeCompany.id, sequenceId);
      
      // Clear cache and force refresh
      const cacheKey = `sequences_${activeCompany.id}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadSequences(true);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error eliminando correlativo');
    }
  };

  const getNextNumber = async (documentType: string, series: string) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      return await sequenceService.getNextNumber(activeCompany.id, {
        document_type: documentType as any,
        series
      });
    } catch (error: any) {
      throw new Error(error.message || 'Error obteniendo siguiente número');
    }
  };

  // Initial load
  useEffect(() => {
    // No ejecutar en página de login
    if (typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
      if (isLoginPage) return;
    }
    
    if (activeCompany?.id) {
      loadSequences();
    }
  }, [activeCompany?.id]);

  // Auto-refresh every 30 minutes if data is stale
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetch > CACHE_DURATION) {
        loadSequences(true);
      }
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [lastFetch, loadSequences, CACHE_DURATION]);

  return {
    sequences,
    loading,
    error,
    loadSequences,
    createSequence,
    updateSequence,
    deleteSequence,
    getNextNumber,
    forceRefresh: () => loadSequences(true)
  };
};