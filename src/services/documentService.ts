interface DNIResponse {
  success: boolean;
  data?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
  };
  message?: string;
}

interface RUCResponse {
  success: boolean;
  data?: {
    razonSocial: string;
    numeroDocumento: string;
    direccion: string;
    estado: string;
  };
  message?: string;
}

export const documentService = {
  async consultarDNI(dni: string): Promise<DNIResponse> {
    try {
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
    } catch (error) {
      return { success: false, message: 'Error de conexión al consultar DNI' };
    }
  },

  async consultarRUC(ruc: string): Promise<RUCResponse> {
    try {
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
    } catch (error) {
      return { success: false, message: 'Error de conexión al consultar RUC' };
    }
  }
};