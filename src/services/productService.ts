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

export const productService = {
  async getProducts(companyId: string, filters?: ProductFilters): Promise<ProductResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.active !== undefined) params.append('active', filters.active.toString());

    const queryString = params.toString();
    const url = `https://tools.apis.atechlo.com/apisunat/companies/${companyId}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
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
      if (response.status === 404) {
        // No hay productos registrados, devolver array vacío
        return { success: true, data: [] };
      }
      throw new Error('Error obteniendo productos');
    }

    const data = await response.json();
    return data;
  },

  async createProduct(companyId: string, productData: CreateProductData): Promise<CreateProductResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      throw new Error(data.message || 'Error creando producto');
    }

    return data;
  },

  async updateProduct(companyId: string, productId: number, productData: Partial<CreateProductData>): Promise<{ success: boolean; message: string; data: Product }> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      throw new Error(data.message || 'Error actualizando producto');
    }

    return data;
  },

  async deleteProduct(companyId: string, productId: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`https://tools.apis.atechlo.com/apisunat/companies/${companyId}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      throw new Error(data.message || 'Error eliminando producto');
    }

    return data;
  }
};