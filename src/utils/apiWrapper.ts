export const withApiErrorHandling = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.');
    }
    throw error;
  }
};