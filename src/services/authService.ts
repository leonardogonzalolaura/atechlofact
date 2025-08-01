interface LoginCredentials {
  user: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface ApiError {
  error: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Modo test - usuario especial que no requiere validación API
    if (credentials.user === 'test' && credentials.password === 'test123') {
      const testToken = btoa(JSON.stringify({ id: 'test', exp: Date.now() + 86400000 }));
      return { token: `header.${testToken}.signature` };
    }

    // Si estamos en modo estático (GitHub Pages), solo permitir test
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      throw new Error('Solo se permite el usuario test en GitHub Pages');
    }

    // Modo servidor - usar API externa directamente
    try {
      const response = await fetch('https://tools.apis.atechlo.com/apisunat/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Credenciales inválidas');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
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
      return payload.id;
    } catch {
      return null;
    }
  }
};