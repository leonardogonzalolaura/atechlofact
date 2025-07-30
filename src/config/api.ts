export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tools.apis.atechlo.com/apisunat',
  ENDPOINTS: {
    LOGIN: '/login',
    // Agregar más endpoints aquí según sea necesario
  }
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};