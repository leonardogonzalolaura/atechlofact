import { withApiErrorHandling } from '../utils/apiWrapper';
import { UserProfile, Company, ProfileResponse, CompanyInput, CompanyResponse, CompanyUpdateInput } from './userTypes';

export const userService = {
  async getProfile(): Promise<ProfileResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error(`Error obteniendo perfil del usuario: ${response.status}`);
      }

      return response.json();
    });
  },

  async registerCompany(companyData: CompanyInput): Promise<CompanyResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error(data.message || 'Error registrando empresa');
      }

      return data;
    });
  },

  async updateCompany(companyId: number, companyData: CompanyUpdateInput): Promise<{ success: boolean; message: string }> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/user/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error(data.message || 'Error actualizando empresa');
      }

      return data;
    });
  }
};