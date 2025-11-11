export interface QuoteRequest {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  project_type: 'kitchen' | 'bathroom' | 'closet' | 'laundry' | 'office' | 'other';
  project_description: string;
  budget_range?: string;
  timeline?: string;
  address?: Address;
  attachments?: QuoteAttachment[];
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface QuoteAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface QuoteResponse {
  id: string;
  quote_request_id: string;
  total_cost: number;
  labor_cost: number;
  materials_cost: number;
  breakdown: QuoteLineItem[];
  notes?: string;
  valid_until: string;
  created_by: string;
  created_at: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'labor' | 'materials' | 'hardware' | 'delivery' | 'other';
}
