export interface Sequence {
  id: number;
  company_id: number;
  document_type: 'invoice' | 'receipt' | 'credit_note' | 'debit_note' | 'quotation';
  series: string;
  current_number: number;
  prefix: string;
  suffix: string;
  min_digits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSequenceData {
  document_type: 'invoice' | 'receipt' | 'credit_note' | 'debit_note' | 'quotation';
  series: string;
  current_number?: number;
  prefix?: string;
  suffix?: string;
  min_digits?: number;
}

export interface NextNumberRequest {
  document_type: 'invoice' | 'receipt' | 'credit_note' | 'debit_note' | 'quotation';
  series: string;
}

export interface SequencesResponse {
  success: boolean;
  data: Sequence[];
}

export interface CreateSequenceResponse {
  success: boolean;
  message: string;
  data: Sequence;
}

export interface NextNumberResponse {
  success: boolean;
  data: {
    next_number: number;
    formatted_number: string;
    series: string;
    document_type: string;
  };
}