import { withApiErrorHandling } from '../utils/apiWrapper';
import { 
  Sequence, 
  CreateSequenceData, 
  NextNumberRequest,
  SequencesResponse, 
  CreateSequenceResponse, 
  NextNumberResponse
} from './sequenceTypes';

export const sequenceService = {
  async getSequences(companyId: string): Promise<SequencesResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/sequences`, {
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
        throw new Error('Error obteniendo correlativos');
      }

      return await response.json();
    });
  },

  async createSequence(companyId: string, sequenceData: CreateSequenceData): Promise<CreateSequenceResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/sequences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sequenceData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        if (response.status === 409) {
          throw new Error('Ya existe una serie para este tipo de documento');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para crear correlativos');
        }
        throw new Error(data.message || 'Error creando correlativo');
      }

      return data;
    });
  },

  async getNextNumber(companyId: string, request: NextNumberRequest): Promise<NextNumberResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/sequences/next`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        if (response.status === 404) {
          throw new Error('Correlativo no encontrado para esta serie');
        }
        throw new Error(data.message || 'Error obteniendo siguiente número');
      }

      return data;
    });
  },

  async updateSequence(companyId: string, sequenceId: number, sequenceData: Partial<CreateSequenceData>): Promise<CreateSequenceResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/sequences/${sequenceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sequenceData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        if (response.status === 404) {
          throw new Error('Correlativo no encontrado');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para actualizar correlativos');
        }
        throw new Error(data.message || 'Error actualizando correlativo');
      }

      return data;
    });
  },

  async deleteSequence(companyId: string, sequenceId: number): Promise<{ success: boolean; message: string }> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/sequences/${sequenceId}`, {
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
          throw new Error('Correlativo no encontrado');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para eliminar correlativos');
        }
        throw new Error(data.message || 'Error eliminando correlativo');
      }

      return data;
    });
  }
};