import { withApiErrorHandling } from '../utils/apiWrapper';
import { DNIResponse, RUCResponse } from './documentTypes';

export const documentService = {
  async consultarDNI(dni: string): Promise<DNIResponse> {
    try {
      return await withApiErrorHandling(async () => {
        const response = await fetch(`https://tools.apis.atechlo.com/apisunat/dni/${dni}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, message: data.message || 'Error al consultar DNI' };
        }

        return { success: true, data };
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión al consultar DNI' };
    }
  },

  async consultarRUC(ruc: string): Promise<RUCResponse> {
    try {
      return await withApiErrorHandling(async () => {
        const response = await fetch(`https://tools.apis.atechlo.com/apisunat/ruc/${ruc}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, message: data.message || 'Error al consultar RUC' };
        }

        return { success: true, data };
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión al consultar RUC' };
    }
  }
};