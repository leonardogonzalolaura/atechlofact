interface LoginCredentials {
  login: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    subscription_plan: string;
    is_trial: boolean;
    trial_end_date: string;
  };
}

interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  company_id?: number | null;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    email: string;
    username: string;
    is_trial: boolean;
    subscription_plan: string;
    trial_end_date: string;
    is_active: boolean;
  };
}

interface ApiError {
  error: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {

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
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
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
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }
};