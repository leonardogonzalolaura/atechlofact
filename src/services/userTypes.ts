export interface UserProfile {
  id: number;
  email: string;
  username: string;
  fullname: string;
  subscription_plan: string;
  is_trial: boolean;
  trial_end_date: string;
  is_active: boolean;
  profile_picture?: string;
  auth_provider: string;
  last_login: string;
  created_at: string;
}

export interface Company {
  id: number;
  ruc: string;
  name: string;
  business_name: string;
  legal_representative: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  industry?: string;
  tax_regime?: string;
  currency?: string;
  logo_url?: string;
  sunat_user?: string;
  sunat_password?: string;
  role: string;
  created_at: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
    companies: Company[];
  };
}

export interface CompanyInput {
  ruc: string;
  name: string;
  business_name: string;
  legal_representative: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  industry?: string;
  tax_regime?: string;
  currency?: string;
  logo_url?: string;
  sunat_user?: string;
  sunat_password?: string;
  role?: string;
}

export interface CompanyResponse {
  success: boolean;
  message: string;
  data?: {
    company: {
      id: number;
      ruc: string;
      name: string;
      phone?: string;
      address?: string;
    };
    role: string;
  };
}

export interface CompanyUpdateInput {
  name: string;
  business_name: string;
  ruc: string;
  legal_representative: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  industry?: string;
  tax_regime?: string;
  currency?: string;
  logo_url?: string;
  sunat_user?: string;
  sunat_password?: string;
}