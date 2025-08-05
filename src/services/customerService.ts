import { withApiErrorHandling } from '../utils/apiWrapper';
import { 
  Customer, 
  CreateCustomerData, 
  CustomerFilters, 
  CustomersResponse, 
  CreateCustomerResponse, 
  UpdateCustomerResponse,
  DeleteCustomerResponse
} from './customerTypes';

export const customerService = {
  async getCustomers(companyId: string, filters?: CustomerFilters): Promise<CustomersResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.document_type) params.append('document_type', filters.document_type);
      if (filters?.active !== undefined) params.append('active', filters.active.toString());

      const queryString = params.toString();
      const url = `https://tools.apis.atechlo.com/apisunat/companies/${companyId}/customers${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
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
        if (response.status === 404) {
          return { success: true, data: [] };
        }
        throw new Error('Error obteniendo clientes');
      }

      return await response.json();
    });
  },

  async createCustomer(companyId: string, customerData: CreateCustomerData): Promise<CreateCustomerResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        if (response.status === 409) {
          throw new Error('Ya existe un cliente con este número de documento');
        }
        throw new Error(data.message || 'Error creando cliente');
      }

      return data;
    });
  },

  async updateCustomer(companyId: string, customerId: number, customerData: Partial<CreateCustomerData>): Promise<UpdateCustomerResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        if (response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
        throw new Error(data.message || 'Error actualizando cliente');
      }

      return data;
    });
  },

  async deleteCustomer(companyId: string, customerId: number): Promise<DeleteCustomerResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        if (response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para eliminar clientes');
        }
        throw new Error(data.message || 'Error eliminando cliente');
      }

      return data;
    });
  },

  async getCustomer(companyId: string, customerId: number): Promise<{ success: boolean; data: Customer }> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/customers/${customerId}`, {
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
        if (response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
        throw new Error('Error obteniendo cliente');
      }

      return await response.json();
    });
  }
};