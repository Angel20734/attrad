// ==============================================================================
// Definición de Tipos de Base de Datos (Supabase Schema Types)
// Cero 'any' - Tipado estricto para entidades relacionales
// ==============================================================================

export type LeadStatus = 'nuevo' | 'cita_agendada' | 'venta_cerrada' | 'descartado';

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  custom_domain: string | null;
  brand_logo_url: string | null;
  brand_primary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  industry: string;
  whatsapp_phone: string | null;
  api_key: string;       // Clave pública usada en data-api-key del script
  secure_token: string;  // Token usado en la URL del Magic Link
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  client_id: string;
  organization_id: string;
  ref_code: string;      // Código dinámico inyectado en el WhatsApp (ej: #REF-492)
  customer_phone: string | null;
  customer_name: string | null;
  ad_id: string;         // Identificador del anuncio
  ad_name: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  utm_content: string | null;
  landing_url: string | null;
  referrer: string | null;
  ip_hash: string | null;
  status: LeadStatus;
  sale_amount: number;
  currency: string;
  notes: string | null;
  attributed_at: string;
  closed_at: string | null;
  created_at: string;
}

// Payload recibido por el endpoint de captura
export interface CaptureLeadPayload {
  api_key: string;
  ad_id: string;
  ad_name?: string;
  ref_code: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  landing_url?: string;
  referrer?: string;
  customer_phone?: string;
  customer_name?: string;
}

// Payload de respuesta de ingesta
export interface CaptureLeadResponse {
  success: boolean;
  lead_id?: string;
  ref_code?: string;
  message?: string;
  error?: string;
}
