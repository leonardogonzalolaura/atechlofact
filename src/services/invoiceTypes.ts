export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  document_type: 'invoice' | 'receipt';
  series: string;
  currency: 'PEN' | 'USD';
  issue_date: string;
  due_date?: string;
  notes?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  sunat_status: 'pending' | 'sent' | 'accepted' | 'rejected';
  sunat_response_code?: string;
  sunat_response_message?: string;
  xml_path?: string;
  pdf_path?: string;
  customer: {
    id: number;
    name: string;
    document_type: string;
    document_number: string;
    email?: string;
    address?: string;
  };
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount_rate: number;
  discount_amount: number;
  subtotal: number;
  tax_amount: number;
  total: number;
}

export interface CreateInvoiceData {
  customer_id: number;
  document_type: 'invoice' | 'receipt';
  series: string;
  currency: 'PEN' | 'USD';
  issue_date: string;
  due_date?: string;
  notes?: string;
  items: CreateInvoiceItem[];
}

export interface CreateInvoiceItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_rate?: number;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  sunat_status?: 'pending' | 'sent' | 'accepted' | 'rejected';
  date_from?: string;
  date_to?: string;
  customer_id?: number;
  search?: string;
}

export interface InvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
    totals: {
      total_amount: number;
      count_by_status: Record<string, number>;
    };
  };
}

export interface CreateInvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}

export interface InvoiceResponse {
  success: boolean;
  data: Invoice;
}

export interface SunatStatusResponse {
  success: boolean;
  data: {
    invoice_number: string;
    status: string;
    sunat_status: string;
    sunat_response_code?: string;
    sunat_response_message?: string;
    xml_path?: string;
    pdf_path?: string;
  };
}

export interface GenerateXmlResponse {
  success: boolean;
  message: string;
  data: {
    xml_path: string;
    xml_content?: string;
  };
}

export interface SendSunatResponse {
  success: boolean;
  message: string;
  data: {
    sunat_status: string;
    sunat_response_code: string;
    sunat_response_message: string;
    cdr_path?: string;
  };
}