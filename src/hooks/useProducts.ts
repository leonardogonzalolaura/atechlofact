import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product, ProductFilters } from '../services/productTypes';
import { useCompany } from '../contexts/CompanyContext';
import { useNotificationHelpers } from './useNotificationHelpers';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeCompany } = useCompany();
  const { notifyLowStock, notifyOutOfStock, clearNotificationsByType } = useNotificationHelpers();

  const loadProducts = useCallback(async () => {
    if (!activeCompany?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(activeCompany.id, filters);
      const productsData = response.data || [];
      setProducts(productsData);
      
      // Check for stock alerts (only if no specific filters to avoid spam)
      if (!filters?.search && !filters?.category) {
        const preferences = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
        
        if (preferences.enableStockAlerts !== false) {
          // Clear previous stock notifications
          clearNotificationsByType('stock-alert');
          clearNotificationsByType('out-of-stock');
          
          // Check for low stock products
          const lowStockProducts = productsData.filter(product => 
            product.product_type === 'product' && 
            product.stock !== undefined && 
            product.min_stock !== undefined &&
            product.stock <= product.min_stock &&
            product.stock > 0
          ).map(p => ({
            id: p.id.toString(),
            name: p.name,
            stock: p.stock || 0,
            minStock: p.min_stock || 0
          }));
          
          // Check for out of stock products
          const outOfStockProducts = productsData.filter(product => 
            product.product_type === 'product' && 
            product.stock === 0
          ).map(p => ({
            id: p.id.toString(),
            name: p.name
          }));
          
          // Send notifications
          if (lowStockProducts.length > 0) {
            notifyLowStock(lowStockProducts);
          }
          
          if (outOfStockProducts.length > 0) {
            notifyOutOfStock(outOfStockProducts);
          }
        }
      }
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
    // No ejecutar en página de login
    if (typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
      if (isLoginPage) return;
    }
    
    if (activeCompany?.id) {
      loadProducts();
    }
  }, [activeCompany?.id, filters?.search, filters?.category, filters?.type, filters?.active]);
  
  useEffect(() => {
    const handleProductCreated = () => {
      if (activeCompany?.id) {
        loadProducts();
      }
    };
    
    window.addEventListener('productCreated', handleProductCreated);
    
    return () => {
      window.removeEventListener('productCreated', handleProductCreated);
    };
  }, [activeCompany?.id]);

  return {
    products,
    loading,
    error,
    loadProducts,
    searchProducts
  };
};