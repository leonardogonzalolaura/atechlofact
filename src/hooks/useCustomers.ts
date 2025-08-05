import { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerService';
import { Customer, CustomerFilters } from '../services/customerTypes';
import { useCompany } from '../contexts/CompanyContext';

export const useCustomers = (filters?: CustomerFilters) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { activeCompany } = useCompany();
  
  // Cache duration: 30 minutes
  const CACHE_DURATION = 30 * 60 * 1000;

  const loadCustomers = useCallback(async (forceRefresh = false) => {
    if (!activeCompany?.id) return;
    
    // Check cache validity
    const now = Date.now();
    const cacheKey = `customers_${activeCompany.id}_${JSON.stringify(filters)}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && cachedData && cacheTimestamp) {
      const age = now - parseInt(cacheTimestamp);
      if (age < CACHE_DURATION) {
        const cached = JSON.parse(cachedData);
        setCustomers(cached);
        setLastFetch(parseInt(cacheTimestamp));
        return;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomers(activeCompany.id, filters);
      const customersData = response.data || [];
      
      setCustomers(customersData);
      setLastFetch(now);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(customersData));
      localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
    } catch (err: any) {
      if (err.message === 'Sesión expirada') {
        setError('Sesión expirada');
      } else {
        setError('Error cargando clientes');
      }
      console.error('Error loading customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id, filters, CACHE_DURATION]);

  const createCustomer = async (customerData: any) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await customerService.createCustomer(activeCompany.id, customerData);
      
      // Clear cache and force refresh
      const cacheKey = `customers_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadCustomers(true);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error creando cliente');
    }
  };

  const updateCustomer = async (customerId: number, customerData: any) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await customerService.updateCustomer(activeCompany.id, customerId, customerData);
      
      // Clear cache and force refresh
      const cacheKey = `customers_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadCustomers(true);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error actualizando cliente');
    }
  };

  const deleteCustomer = async (customerId: number) => {
    if (!activeCompany?.id) throw new Error('No hay empresa activa');
    
    try {
      const response = await customerService.deleteCustomer(activeCompany.id, customerId);
      
      // Clear cache and force refresh
      const cacheKey = `customers_${activeCompany.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      await loadCustomers(true);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Error eliminando cliente');
    }
  };

  const searchCustomers = async (searchTerm: string) => {
    if (!activeCompany?.id) return [];
    
    try {
      const response = await customerService.getCustomers(activeCompany.id, { search: searchTerm });
      return response.data || [];
    } catch (error: any) {
      console.error('Error searching customers:', error);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Auto-refresh every 30 minutes if data is stale
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetch > CACHE_DURATION) {
        loadCustomers(true);
      }
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [lastFetch, loadCustomers, CACHE_DURATION]);

  // Listen for customer creation events
  useEffect(() => {
    const handleCustomerCreated = () => {
      // Clear cache and force refresh when new customer is created
      const cacheKey = `customers_${activeCompany?.id}_${JSON.stringify(filters)}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      loadCustomers(true);
    };
    
    window.addEventListener('customerCreated', handleCustomerCreated);
    
    return () => {
      window.removeEventListener('customerCreated', handleCustomerCreated);
    };
  }, [loadCustomers, activeCompany?.id, filters]);

  return {
    customers,
    loading,
    error,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    forceRefresh: () => loadCustomers(true)
  };
};