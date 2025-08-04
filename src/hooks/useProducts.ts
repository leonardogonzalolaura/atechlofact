import { useState, useEffect, useCallback } from 'react';
import { productService, Product, ProductFilters } from '../services/productService';
import { useCompany } from '../contexts/CompanyContext';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeCompany } = useCompany();

  const loadProducts = useCallback(async () => {
    if (!activeCompany?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(activeCompany.id, filters);
      setProducts(response.data || []);
    } catch (err: any) {
      // Si es error de sesión expirada, no mostrar como error de productos
      if (err.message === 'Sesión expirada') {
        setError('Sesión expirada');
      } else {
        setError('Error cargando productos');
      }
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id, filters]);

  const searchProducts = async (searchTerm: string) => {
    if (!activeCompany?.id || searchTerm.length < 2) {
      return [];
    }
    
    try {
      const response = await productService.getProducts(activeCompany.id, { 
        search: searchTerm,
        active: true 
      });
      return response.data || [];
    } catch (err: any) {
      console.error('Error searching products:', err);
      // Si es 404, no hay productos, devolver array vacío sin error
      if (err.message?.includes('404')) {
        return [];
      }
      return [];
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeCompany?.id, filters?.search, filters?.category, filters?.type, filters?.active]);
  
  useEffect(() => {
    const handleProductCreated = () => {
      loadProducts();
    };
    
    window.addEventListener('productCreated', handleProductCreated);
    
    return () => {
      window.removeEventListener('productCreated', handleProductCreated);
    };
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    searchProducts
  };
};