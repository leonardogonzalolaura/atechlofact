import { useState, useEffect, useCallback } from 'react';
import { invoiceService } from '../services/invoiceService';
import { Invoice, InvoiceFilters } from '../services/invoiceTypes';
import { useCompany } from '../contexts/CompanyContext';

export const useInvoices = (filters?: InvoiceFilters) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_count: 0,
    per_page: 20
  });
  const [totals, setTotals] = useState({
    total_amount: 0,
    count_by_status: {} as Record<string, number>
  });
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { activeCompany } = useCompany();
  
  // Cache duration: 30 minutes
  const CACHE_DURATION = 30 * 60 * 1000;

  const loadInvoices = useCallback(async (forceRefresh = false) => {
    if (!activeCompany?.id) return;
    
    // Check cache validity
    const now = Date.now();
    const cacheKey = `invoices_${activeCompany.id}_${JSON.stringify(filters)}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cachedData && cacheTimestamp) {
      const age = now - parseInt(cacheTimestamp);
      if (age < CACHE_DURATION) {
        const cached = JSON.parse(cachedData);
        setInvoices(cached.invoices || []);
        setPagination(cached.pagination);
        setTotals(cached.totals);
        setLastFetch(parseInt(cacheTimestamp));
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceService.getInvoices(activeCompany.id, filters);
      const data = {
        invoices: response.data.invoices || [],
        pagination: response.data.pagination,
        totals: response.data.totals
      };
      
      setInvoices(data.invoices);
      setPagination(data.pagination);
      setTotals(data.totals);
      setLastFetch(now);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
    } catch (err: any) {
      if (err.message === 'Sesión expirada') {
        setError('Sesión expirada');
      } else {
        setError('Error cargando facturas');
      }
      console.error('Error loading invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id, filters, CACHE_DURATION]);

  const createInvoice = async (invoiceData: any) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await invoiceService.createInvoice(activeCompany.id, invoiceData);
      
      // Clear cache and force refresh
      const cacheKey = `invoices_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadInvoices(true); // Force refresh
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error creando factura');
    }
  };

  const updateInvoice = async (invoiceId: number, invoiceData: any) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await invoiceService.updateInvoice(activeCompany.id, invoiceId, invoiceData);
      
      // Clear cache and force refresh
      const cacheKey = `invoices_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadInvoices(true); // Force refresh
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error actualizando factura');
    }
  };

  const deleteInvoice = async (invoiceId: number) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await invoiceService.deleteInvoice(activeCompany.id, invoiceId);
      
      // Clear cache and force refresh
      const cacheKey = `invoices_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadInvoices(true); // Force refresh
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error eliminando factura');
    }
  };

  const generateXml = async (invoiceId: number) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      return await invoiceService.generateXml(activeCompany.id, invoiceId);
    } catch (error: any) {
      throw new Error(error.message || 'Error generando XML');
    }
  };

  const sendToSunat = async (invoiceId: number) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await invoiceService.sendToSunat(activeCompany.id, invoiceId);
      
      // Clear cache and force refresh to get updated status
      const cacheKey = `invoices_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadInvoices(true); // Force refresh
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error enviando a SUNAT');
    }
  };

  const getSunatStatus = async (invoiceId: number) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      return await invoiceService.getSunatStatus(activeCompany.id, invoiceId);
    } catch (error: any) {
      throw new Error(error.message || 'Error consultando estado SUNAT');
    }
  };

  const downloadPdf = async (invoiceId: number, filename?: string) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const blob = await invoiceService.downloadPdf(activeCompany.id, invoiceId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `factura-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.message || 'Error descargando PDF');
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);
  
  // Auto-refresh every 30 minutes if data is stale
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetch > CACHE_DURATION) {
        loadInvoices(true);
      }
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [lastFetch, loadInvoices, CACHE_DURATION]);

  useEffect(() => {
    const handleInvoiceCreated = () => {
      // Clear cache and force refresh when new invoice is created
      const cacheKey = `invoices_${activeCompany?.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      loadInvoices(true);
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, [loadInvoices, activeCompany?.id, filters]);

  return {
    invoices,
    loading,
    error,
    pagination,
    totals,
    loadInvoices,
    forceRefresh: () => loadInvoices(true),
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateXml,
    sendToSunat,
    getSunatStatus,
    downloadPdf
  };
};