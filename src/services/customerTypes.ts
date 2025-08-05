export interface Customer {
  id: number;
  document_type: 'dni' | 'ruc' | 'passport' | 'other';
  document_number: string;
  name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  province?: string;
  department?: string;
  country?: string;
  postal_code?: string;
  tax_condition: 'domiciliado' | 'no_domiciliado';
  is_active: boolean;
  created_at: string;
}

export interface CreateCustomerData {
  document_type: 'dni' | 'ruc' | 'passport' | 'other';
  document_number: string;
  name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  province?: string;
  department?: string;
  country?: string;
  postal_code?: string;
  tax_condition?: 'domiciliado' | 'no_domiciliado';
}

export interface CustomerFilters {
  search?: string;
  document_type?: 'dni' | 'ruc' | 'passport' | 'other';
  active?: boolean;
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
}

export interface CreateCustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface UpdateCustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
}