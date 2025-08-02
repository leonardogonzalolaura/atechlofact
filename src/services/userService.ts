interface UserProfile {
  id: number;
  email: string;
  username: string;
  subscription_plan: string;
  is_trial: boolean;
  trial_end_date: string;
  is_active: boolean;
  profile_picture?: string;
  auth_provider: string;
  last_login: string;
  created_at: string;
}

interface Company {
  id: number;
  rut: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  created_at: string;
}

interface ProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
    companies: Company[];
  };
}

interface CompanyInput {
  rut: string;
  name: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface CompanyResponse {
  success: boolean;
  message: string;
  data?: {
    company: {
      id: number;
      rut: string;
      name: string;
      phone?: string;
      address?: string;
    };
    role: string;
  };
}

export const userService = {
  async getProfile(): Promise<ProfileResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/profile', {
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
      throw new Error('Error obteniendo perfil del usuario');
    }

    return response.json();
  },

  async registerCompany(companyData: CompanyInput): Promise<CompanyResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/companies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      throw new Error(data.message || 'Error registrando empresa');
    }

    return data;
  }
};