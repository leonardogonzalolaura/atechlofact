import { useState, useEffect, useCallback } from 'react';
import { invoiceService } from '../services/invoiceService';
import { Invoice } from '../services/invoiceTypes';
import { useCompany } from '../contexts/CompanyContext';

export const useRecentInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { activeCompany } = useCompany();
  
  // Cache duration: 30 minutes
  const CACHE_DURATION = 30 * 60 * 1000;
  const CACHE_KEY = 'recent_invoices';

  const loadRecentInvoices = useCallback(async (forceRefresh = false) => {
    if (!activeCompany?.id) return;
    
    // Check cache validity
    const now = Date.now();
    const cacheKey = `${CACHE_KEY}_${activeCompany.id}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cachedData && cacheTimestamp) {
      const age = now - parseInt(cacheTimestamp);
      if (age < CACHE_DURATION) {
        const cached = JSON.parse(cachedData);
        setInvoices(cached);
        setLastFetch(parseInt(cacheTimestamp));
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get recent invoices (last 20)
      const response = await invoiceService.getInvoices(activeCompany.id, { 
        limit: 20, 
        page: 1 
      });
      
      const recentInvoices = response.data.invoices || [];
      setInvoices(recentInvoices);
      setLastFetch(now);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(recentInvoices));
      localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
    } catch (err: any) {
      if (err.message === 'Sesión expirada') {
        setError('Sesión expirada');
      } else {
        setError('Error cargando facturas');
      }
      console.error('Error loading recent invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id, CACHE_DURATION, CACHE_KEY]);

  // Initial load
  useEffect(() => {
    loadRecentInvoices();
  }, [loadRecentInvoices]);

  // Auto-refresh every 30 minutes if data is stale
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetch > CACHE_DURATION) {
        loadRecentInvoices(true);
      }
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [lastFetch, loadRecentInvoices, CACHE_DURATION]);

  // Listen for invoice creation events
  useEffect(() => {
    const handleInvoiceCreated = () => {
      // Clear cache and force refresh when new invoice is created
      const cacheKey = `${CACHE_KEY}_${activeCompany?.id}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      loadRecentInvoices(true);
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, [loadRecentInvoices, activeCompany?.id, CACHE_KEY]);

  return {
    invoices,
    loading,
    error,
    refresh: () => loadRecentInvoices(true)
  };
};