import { withApiErrorHandling } from '../utils/apiWrapper';
import { 
  Invoice, 
  CreateInvoiceData, 
  InvoiceFilters, 
  InvoicesResponse, 
  CreateInvoiceResponse, 
  InvoiceResponse,
  SunatStatusResponse,
  GenerateXmlResponse,
  SendSunatResponse
} from './invoiceTypes';

export const invoiceService = {
  async getInvoices(companyId: string, filters?: InvoiceFilters): Promise<InvoicesResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sunat_status) params.append('sunat_status', filters.sunat_status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices${queryString ? `?${queryString}` : ''}`;

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
          return { 
            success: true, 
            data: { 
              invoices: [], 
              pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: 20 },
              totals: { total_amount: 0, count_by_status: {} }
            } 
          };
        }
        throw new Error('Error obteniendo facturas');
      }

      return await response.json();
    });
  },

  async createInvoice(companyId: string, invoiceData: CreateInvoiceData): Promise<CreateInvoiceResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error(data.message || 'Error creando factura');
      }

      return data;
    });
  },

  async getInvoice(companyId: string, invoiceId: number): Promise<InvoiceResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}`, {
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
          throw new Error('Factura no encontrada');
        }
        throw new Error('Error obteniendo factura');
      }

      return await response.json();
    });
  },

  async generateXml(companyId: string, invoiceId: number): Promise<GenerateXmlResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}/generate-xml`, {
        method: 'POST',
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
        throw new Error(data.message || 'Error generando XML');
      }

      return data;
    });
  },

  async sendToSunat(companyId: string, invoiceId: number): Promise<SendSunatResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}/send-sunat`, {
        method: 'POST',
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
        throw new Error(data.message || 'Error enviando a SUNAT');
      }

      return data;
    });
  },

  async getSunatStatus(companyId: string, invoiceId: number): Promise<SunatStatusResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}/sunat-status`, {
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
        throw new Error('Error consultando estado SUNAT');
      }

      return await response.json();
    });
  },

  async downloadPdf(companyId: string, invoiceId: number): Promise<Blob> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}/download-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error('Error descargando PDF');
      }

      return await response.blob();
    });
  },

  async updateInvoice(companyId: string, invoiceId: number, invoiceData: Partial<CreateInvoiceData>): Promise<CreateInvoiceResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error(data.message || 'Error actualizando factura');
      }

      return data;
    });
  },

  async deleteInvoice(companyId: string, invoiceId: number): Promise<{ success: boolean; message: string }> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/invoices/${invoiceId}`, {
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
        throw new Error(data.message || 'Error eliminando factura');
      }

      return data;
    });
  }
};