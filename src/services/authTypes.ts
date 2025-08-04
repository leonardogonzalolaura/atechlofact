export interface LoginCredentials {
  login: string;
  password: string;
}

export interface LoginResponse {
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

export interface RegisterCredentials {
  email: string;
  username: string;
  fullname: string;
  password: string;
  company_id?: number | null;
}

export interface RegisterResponse {
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

export interface ApiError {
  error: string;
}