export interface Product {
  id: number;
  code: string;
  name: string;
  product_type: 'product' | 'service';
  description?: string;
  unit_type: string;
  price: number;
  cost?: number;
  stock?: number;
  min_stock?: number;
  tax_type: 'gravado' | 'exonerado' | 'inafecto' | 'exportacion';
  igv_rate: number;
  category?: string;
  brand?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  type?: 'product' | 'service';
  active?: boolean;
}

export interface CreateProductData {
  code: string;
  name: string;
  product_type: 'product' | 'service';
  description?: string;
  unit_type: string;
  price: number;
  cost?: number;
  stock?: number;
  min_stock?: number;
  tax_type: 'gravado' | 'exonerado' | 'inafecto' | 'exportacion';
  igv_rate: number;
  category?: string;
  brand?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
}

export interface CreateProductResponse {
  success: boolean;
  message: string;
  data: Product;
}