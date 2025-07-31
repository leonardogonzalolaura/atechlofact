export const API_CONFIG = {
  BASE_URL: 'https://tools.apis.atechlo.com/apisunat',
  ENDPOINTS: {
    LOGIN: '/login',
  }
};

export const getApiUrl = (endpoint: string) => {
  console.log('[DEBUG] Full API URL:', `${API_CONFIG.BASE_URL}${endpoint}`);
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};