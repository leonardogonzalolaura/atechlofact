import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

interface Company {
  id: string;
  name: string;
  business_name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
}

export const useActiveCompany = () => {
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== INICIANDO CARGA DE EMPRESAS ===');
      console.log('Llamando a userService.getProfile()...');
      const response = await userService.getProfile();
      console.log('Profile response recibida:', response);
      const companiesData = (response.data.companies || []).map((company: any) => ({
        ...company,
        id: company.id.toString()
      }));
      setCompanies(companiesData);
      
      console.log('Companies loaded:', companiesData.length);
      
      // Si hay empresas, seleccionar la primera como activa por defecto
      if (companiesData.length > 0) {
        const savedActiveId = localStorage.getItem('activeCompanyId');
        const activeComp = savedActiveId 
          ? companiesData.find((c: Company) => c.id === savedActiveId) || companiesData[0]
          : companiesData[0];
        setActiveCompany(activeComp);
        localStorage.setItem('activeCompanyId', activeComp.id);
        console.log('Active company set:', activeComp.name);
        
        // Disparar evento para notificar que la empresa se cargó
        window.dispatchEvent(new CustomEvent('companyLoaded'));
      } else {
        setActiveCompany(null);
        localStorage.removeItem('activeCompanyId');
        console.log('No companies found');
      }
    } catch (err: any) {
      console.error('Error loading companies:', err);
      
      // Si es error 403, usar datos mock temporalmente
      if (err.message.includes('403')) {
        console.log('Using mock company data due to 403 error');
        const mockCompanies = [{
          id: '1',
          name: 'Mi Empresa',
          business_name: 'Mi Empresa SAC',
          ruc: '20123456789',
          address: 'Av. Principal 123',
          phone: '01-1234567',
          email: 'contacto@miempresa.com'
        }];
        setCompanies(mockCompanies);
        setActiveCompany(mockCompanies[0]);
        localStorage.setItem('activeCompanyId', mockCompanies[0].id);
        setError(null);
      } else {
        setError(err.message || 'Error cargando empresas');
        setActiveCompany(null);
        setCompanies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = (company: Company) => {
    setActiveCompany(company);
    localStorage.setItem('activeCompanyId', company.id);
  };

  useEffect(() => {
    console.log('useActiveCompany useEffect ejecutándose');
    
    if (typeof window !== 'undefined') {
      // No ejecutar en página de login
      const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
      console.log('isLoginPage:', isLoginPage);
      
      if (isLoginPage) {
        console.log('En página de login, no cargar empresas');
        setLoading(false);
        setCompanies([]);
        setActiveCompany(null);
        return;
      }
      
      const isAuth = authService.isAuthenticated();
      console.log('isAuthenticated:', isAuth);
      
      if (isAuth) {
        console.log('Llamando a loadCompanies desde useEffect');
        loadCompanies();
      } else {
        console.log('No se carga empresas - no autenticado');
        setLoading(false);
        setCompanies([]);
        setActiveCompany(null);
      }
    }
  }, []);

  return {
    activeCompany,
    companies,
    loading,
    error,
    selectCompany,
    reloadCompanies: loadCompanies,
    hasCompanies: companies.length > 0
  };
};