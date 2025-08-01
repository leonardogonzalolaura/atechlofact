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

    const response = await fetch('/api/auth/login', {
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