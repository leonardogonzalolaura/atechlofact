import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

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
      console.log('Loading companies...');
      const response = await userService.getProfile();
      console.log('Profile response:', response);
      const companiesData = response.data.companies || [];
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
      } else {
        setActiveCompany(null);
        localStorage.removeItem('activeCompanyId');
        console.log('No companies found');
      }
    } catch (err: any) {
      console.error('Error loading companies:', err);
      setError(err.message || 'Error cargando empresas');
      setActiveCompany(null);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = (company: Company) => {
    setActiveCompany(company);
    localStorage.setItem('activeCompanyId', company.id);
  };

  useEffect(() => {
    loadCompanies();
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