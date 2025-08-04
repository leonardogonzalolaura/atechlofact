import { withApiErrorHandling } from '../utils/apiWrapper';
import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, ApiError } from './authTypes';

export const authService = {
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
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
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