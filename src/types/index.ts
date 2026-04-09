export type DocumentType = "invoice" | "quote";

export type DocumentStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "paid"
  | "rejected";

export interface Profile {
  id: string;
  company_name: string;
  nif: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  bank_iban: string | null;
  logo_url: string | null;
  default_iva: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_number: string;
  client_name: string | null;
  client_email: string | null;
  client_nif: string | null;
  client_address: string | null;
  subtotal: number;
  iva_percent: number;
  iva_amount: number;
  total: number;
  status: DocumentStatus;
  valid_until: string | null;
  notes: string | null;
  original_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  document_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface DocumentWithItems extends Document {
  items: DocumentItem[];
}

export interface Contact {
  id: string;
  business_name: string;
  category: string | null;
  province: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  google_maps_url: string | null;
  rating: number | null;
  source: string;
  contacted: boolean;
  contacted_at: string | null;
  outreach_email_text: string | null;
  notes: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  nif: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

// Gemini extraction response
export interface ExtractedInvoiceData {
  client_name: string | null;
  client_email: string | null;
  client_nif: string | null;
  client_address: string | null;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
  notes: string | null;
}
