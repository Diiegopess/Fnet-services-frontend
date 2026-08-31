export interface AssignedTechnician {
  id: string;
  email: string;
  full_name?: string;
}

export interface Client {
  id: string;
  name: string;
  tax_id?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  assigned_technicians: AssignedTechnician[];
  created_at: string;
  updated_at: string;
}

export interface ClientCreatePayload {
  name: string;
  tax_id?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface ClientUpdatePayload {
  name?: string;
  tax_id?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface AssignTechniciansPayload {
  technician_ids: string[];
}