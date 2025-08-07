import { withApiErrorHandling } from '../utils/apiWrapper';
import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, ApiError } from './authTypes';

export const authService = {
  async forgotPassword(email: string): Promise<void> {
    return withApiErrorHandling(async () => {
      const response = await fetch('https://tools.apis.atechlo.com/apisunat/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para realizar esta acción');
        }
        if (response.status === 404) {
          throw new Error('Email no encontrado en el sistema');
        }
        throw new Error(data.message || 'Error al enviar solicitud de recuperación');
      }
    });
  },
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return withApiErrorHandling(async () => {
      const response = await fetch('https://tools.apis.atechlo.com/apisunat/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      return data;
    });
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('activeCompanyId');
    // Limpiar todos los caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sequences_') || key.startsWith('customers_') || key.startsWith('products_')) {
        localStorage.removeItem(key);
      }
    });
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('isAuthenticated - token:', token ? 'EXISTS' : 'NO TOKEN');
    if (!token) return false;
    
    try {
      // Verificar si el token no está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      console.log('Token payload:', payload);
      console.log('Token exp:', payload.exp, 'Now:', now);
      if (payload.exp && payload.exp < now) {
        console.log('Token expirado, removiendo...');
        localStorage.removeItem('token');
        return false;
      }
      console.log('Token válido');
      return true;
    } catch (error) {
      console.log('Error validando token:', error);
      localStorage.removeItem('token');
      return false;
    }
  },

  getUserFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || payload.id?.toString() || null;
    } catch {
      return null;
    }
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    return withApiErrorHandling(async () => {
      const response = await fetch('https://tools.apis.atechlo.com/apisunat/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    });
  }
};