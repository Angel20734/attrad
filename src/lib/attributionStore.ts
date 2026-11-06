// ==============================================================================
// ATTRAD ATTRIBUTION STORE - Motor Reactivo Local / Adaptador Híbrido
// Permite ejecutar toda la plataforma con persistencia en LocalStorage
// y conectarse a Supabase de forma transparente.
// ==============================================================================

import { ClientRow, OrganizationRow, LeadRow, LeadStatus, CaptureLeadPayload, CaptureLeadResponse } from '../types/database';

const STORAGE_KEYS = {
  ORGS: 'attrad_organizations_v1',
  CLIENTS: 'attrad_clients_v1',
  LEADS: 'attrad_leads_v1',
};

// Datos semilla de demostración profesional
const INITIAL_ORGS: OrganizationRow[] = [
  {
    id: 'org-nexus',
    name: 'Nexus Media Agency',
    slug: 'nexus-media',
    owner_email: 'nexus@agencymedia.com',
    custom_domain: 'panel.nexusmedia.com',
    brand_logo_url: null,
    brand_primary_color: '#4F46E5', // Indigo
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'org-vanguard',
    name: 'Vanguard Growth Lab',
    slug: 'vanguard-lab',
    owner_email: 'sofia@vanguardlab.com',
    custom_domain: 'app.vanguardlab.com',
    brand_logo_url: null,
    brand_primary_color: '#0D9488', // Teal
    is_active: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_CLIENTS: ClientRow[] = [
  {
    id: 'client-dental-01',
    organization_id: 'org-nexus',
    name: 'Clínica Dental Sonrisas Especializadas',
    slug: 'clinica-sonrisas',
    industry: 'Salud y Odontología',
    whatsapp_phone: '+52 55 9182 7364',
    api_key: 'attrad_live_sonrisas_pk92',
    secure_token: 'tok_sonrisas_8f14b2',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'client-inmobiliaria-01',
    organization_id: 'org-nexus',
    name: 'Inmobiliaria Prime Real Estate',
    slug: 'valle-real',
    industry: 'Bienes Raíces & Preventas',
    whatsapp_phone: '+52 81 2940 1827',
    api_key: 'attrad_live_valle_pk38',
    secure_token: 'tok_valle_3c99a1',
    is_active: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'client-joyeria-01',
    organization_id: 'org-vanguard',
    name: 'Aura Joyería Fina & Diamantes',
    slug: 'aura-joyas',
    industry: 'E-commerce & Lujo',
    whatsapp_phone: '+52 33 4819 0284',
    api_key: 'attrad_live_aura_pk77',
    secure_token: 'tok_aura_7e52d9',
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'client-saas-01',
    organization_id: 'org-nexus',
    name: 'CloudScale Solutions B2B',
    slug: 'cloudscale',
    industry: 'Tecnología & Cloud',
    whatsapp_phone: '+1 415 892 4019',
    api_key: 'attrad_live_cloud_pk44',
    secure_token: 'tok_saas_4d88e2',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_LEADS: LeadRow[] = [
  // --- CLÍNICA DENTAL SONRISAS ---
  {
    id: 'lead-dent-1',
    client_id: 'client-dental-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-842',
    customer_phone: '+52 55 1122 3344',
    customer_name: 'Dra. Patricia Montes',
    ad_id: 'ad_meta_ortodoncia_01',
    ad_name: 'Ortodoncia Invisible - Video Reel #1',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'campana_ortodoncia_q4',
    utm_content: 'video_antes_despues',
    landing_url: 'https://clinicasonrisas.com/ortodoncia?ad_id=ad_meta_ortodoncia_01',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_8192a',
    status: 'venta_cerrada',
    sale_amount: 1450.00,
    currency: 'USD',
    notes: 'Tratamiento de alineadores pagado de contado.',
    attributed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'lead-dent-2',
    client_id: 'client-dental-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-195',
    customer_phone: '+52 55 9988 7766',
    customer_name: 'Roberto Gómez',
    ad_id: 'ad_meta_ortodoncia_01',
    ad_name: 'Ortodoncia Invisible - Video Reel #1',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'campana_ortodoncia_q4',
    utm_content: 'video_antes_despues',
    landing_url: 'https://clinicasonrisas.com/ortodoncia?ad_id=ad_meta_ortodoncia_01',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_9921b',
    status: 'cita_agendada',
    sale_amount: 0.00,
    currency: 'USD',
    notes: 'Cita de valoración y escaneo 3D confirmada para el jueves.',
    attributed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'lead-dent-3',
    client_id: 'client-dental-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-603',
    customer_phone: '+52 55 4433 2211',
    customer_name: 'Mariana Silva',
    ad_id: 'ad_meta_blanqueamiento_02',
    ad_name: 'Blanqueamiento Láser 2x1',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'promo_blanqueamiento_express',
    utm_content: 'imagen_estatica_promo',
    landing_url: 'https://clinicasonrisas.com/blanqueamiento?ad_id=ad_meta_blanqueamiento_02',
    referrer: 'https://facebook.com/',
    ip_hash: 'hash_1029c',
    status: 'nuevo',
    sale_amount: 0.00,
    currency: 'USD',
    notes: 'Hizo clic en WhatsApp hace 25 min desde Instagram Reels.',
    attributed_at: new Date(Date.now() - 25 * 60000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'lead-dent-4',
    client_id: 'client-dental-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-312',
    customer_phone: '+52 55 7766 5544',
    customer_name: 'Lic. Fernando Torres',
    ad_id: 'ad_google_implantes_03',
    ad_name: 'Implantes Dentales en 1 Sesión',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'search_implantes_urgencias',
    utm_content: 'anuncio_search_top',
    landing_url: 'https://clinicasonrisas.com/implantes?gclid=gcl_8912',
    referrer: 'https://google.com/',
    ip_hash: 'hash_4490e',
    status: 'venta_cerrada',
    sale_amount: 890.00,
    currency: 'USD',
    notes: 'Implante unitario de titanio colocado y pagado.',
    attributed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'lead-dent-5',
    client_id: 'client-dental-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-709',
    customer_phone: '+52 55 8899 0011',
    customer_name: 'Andrea Morales',
    ad_id: 'ad_meta_blanqueamiento_02',
    ad_name: 'Blanqueamiento Láser 2x1',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'promo_blanqueamiento_express',
    utm_content: 'video_experiencia_paciente',
    landing_url: 'https://clinicasonrisas.com/blanqueamiento',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_7781f',
    status: 'cita_agendada',
    sale_amount: 0.00,
    currency: 'USD',
    notes: 'Agendó cita de limpieza y blanqueamiento para el sábado.',
    attributed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },

  // --- INMOBILIARIA PRIME REAL ESTATE ---
  {
    id: 'lead-inm-1',
    client_id: 'client-inmobiliaria-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-771',
    customer_phone: '+52 81 1234 5678',
    customer_name: 'Ing. Carlos Zambrano',
    ad_id: 'ad_meta_departamentos_01',
    ad_name: 'Lofts Preventa Zona San Pedro',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'preventa_exclusiva_san_pedro',
    utm_content: 'carrusel_amenidades',
    landing_url: 'https://primerealestate.com/san-pedro?ad_id=ad_meta_departamentos_01',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_5514d',
    status: 'venta_cerrada',
    sale_amount: 4800.00,
    currency: 'USD',
    notes: 'Separación y enganche de loft en preventa.',
    attributed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'lead-inm-2',
    client_id: 'client-inmobiliaria-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-915',
    customer_phone: '+52 81 8765 4321',
    customer_name: 'Lic. Mauricio Garza',
    ad_id: 'ad_meta_penthouse_02',
    ad_name: 'Penthouse Cumbres - Entrega Inmediata',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'cumbres_luxury_living',
    utm_content: 'tour_virtual_video',
    landing_url: 'https://primerealestate.com/cumbres',
    referrer: 'https://facebook.com/',
    ip_hash: 'hash_6612g',
    status: 'venta_cerrada',
    sale_amount: 12500.00,
    currency: 'USD',
    notes: 'Firma de contrato de compraventa y comisión pagada.',
    attributed_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'lead-inm-3',
    client_id: 'client-inmobiliaria-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-420',
    customer_phone: '+52 81 2233 4455',
    customer_name: 'Arq. Valentina Herrera',
    ad_id: 'ad_meta_departamentos_01',
    ad_name: 'Lofts Preventa Zona San Pedro',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'preventa_exclusiva_san_pedro',
    utm_content: 'carrusel_amenidades',
    landing_url: 'https://primerealestate.com/san-pedro',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_8891h',
    status: 'cita_agendada',
    sale_amount: 0.00,
    currency: 'USD',
    notes: 'Recorrido físico en departamento muestra programado.',
    attributed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'lead-inm-4',
    client_id: 'client-inmobiliaria-01',
    organization_id: 'org-nexus',
    ref_code: '#REF-554',
    customer_phone: '+52 81 9900 1122',
    customer_name: 'Lic. Esteban Lozano',
    ad_id: 'ad_google_search_propiedades',
    ad_name: 'Google Search - Departamentos en Venta Monterrey',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'bienes_raices_mty_search',
    utm_content: 'anuncio_texto_top1',
    landing_url: 'https://primerealestate.com/propiedades',
    referrer: 'https://google.com/',
    ip_hash: 'hash_3319i',
    status: 'nuevo',
    sale_amount: 0.00,
    currency: 'USD',
    notes: 'Solicitó lista de precios y catálogo de preventas.',
    attributed_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },

  // --- AURA JOYERÍA FINA ---
  {
    id: 'lead-joy-1',
    client_id: 'client-joyeria-01',
    organization_id: 'org-vanguard',
    ref_code: '#REF-288',
    customer_phone: '+52 33 1122 8899',
    customer_name: 'Valeria De la Vega',
    ad_id: 'ad_meta_anillos_01',
    ad_name: 'Anillos de Compromiso Oro Blanco & Diamantes',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'compromiso_invierno_q4',
    utm_content: 'video_brillo_diamante',
    landing_url: 'https://aurajoyas.com/compromiso',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_1182j',
    status: 'venta_cerrada',
    sale_amount: 2200.00,
    currency: 'USD',
    notes: 'Anillo con diamante solitario certificado GIA entregado.',
    attributed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'lead-joy-2',
    client_id: 'client-joyeria-01',
    organization_id: 'org-vanguard',
    ref_code: '#REF-741',
    customer_phone: '+52 33 5566 7788',
    customer_name: 'Camila San Román',
    ad_id: 'ad_tiktok_joyeria_02',
    ad_name: 'Gargantilla Diamantes Luxury Drop',
    utm_source: 'tiktok',
    utm_medium: 'paid_social',
    utm_campaign: 'tiktok_luxury_lifestyle',
    utm_content: 'unboxing_packaging_lujo',
    landing_url: 'https://aurajoyas.com/collares',
    referrer: 'https://tiktok.com/',
    ip_hash: 'hash_9923k',
    status: 'venta_cerrada',
    sale_amount: 1150.00,
    currency: 'USD',
    notes: 'Compra directa vía asesoría WhatsApp.',
    attributed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    closed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'lead-joy-3',
    client_id: 'client-joyeria-01',
    organization_id: 'org-vanguard',
    ref_code: '#REF-619',
    customer_phone: '+52 33 9988 2233',
    customer_name: 'Rodrigo Benítez',
    ad_id: 'ad_meta_anillos_01',
    ad_name: 'Anillos de Compromiso Oro Blanco & Diamantes',
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'compromiso_invierno_q4',
    utm_content: 'carrusel_quilates',
    landing_url: 'https://aurajoyas.com/compromiso',
    referrer: 'https://instagram.com/',
    ip_hash: 'hash_4412l',
    status: 'cita_agendada',
    sale_amount: 0.00,
    currency: 'USD',
    notes: 'Cita en showroom privado para elección de piedra central.',
    attributed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

class AttributionStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    try {
      const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!storedClients || JSON.parse(storedClients).length < INITIAL_CLIENTS.length) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      }
      const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (!storedLeads || JSON.parse(storedLeads).length < INITIAL_LEADS.length) {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORGS)) {
        localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(INITIAL_ORGS));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in AttributionStore listener:', e);
      }
    });
  }

  // Lectura
  public getOrganizations(): OrganizationRow[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORGS);
      return raw ? JSON.parse(raw) : INITIAL_ORGS;
    } catch {
      return INITIAL_ORGS;
    }
  }

  public getClients(organizationId?: string): ClientRow[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      const list: ClientRow[] = raw ? JSON.parse(raw) : INITIAL_CLIENTS;
      return organizationId ? list.filter((c) => c.organization_id === organizationId) : list;
    } catch {
      return INITIAL_CLIENTS;
    }
  }

  public getClientByToken(secureToken: string): ClientRow | null {
    const clients = this.getClients();
    if (!secureToken) return clients[0] || null;

    // 1. Coincidencia directa por token seguro
    let found = clients.find((c) => c.secure_token === secureToken && c.is_active);
    if (found) return found;

    // 2. Coincidencia flexible por id o slug
    const normalized = secureToken.toLowerCase().replace(/^tok_/, '');
    found = clients.find((c) => 
      c.id.toLowerCase() === normalized || 
      c.id.toLowerCase().includes(normalized) ||
      normalized.includes(c.id.toLowerCase()) ||
      c.slug.toLowerCase().includes(normalized) ||
      normalized.includes(c.slug.toLowerCase()) ||
      c.secure_token.toLowerCase().includes(normalized)
    );
    if (found) return found;

    // 3. Respaldo siempre activo para que la pantalla de recepción NUNCA aparezca vacía
    return clients[0] || null;
  }

  public getClientByApiKey(apiKey: string): ClientRow | null {
    const clients = this.getClients();
    return clients.find((c) => c.api_key === apiKey && c.is_active) || clients[0] || null;
  }

  public getLeads(clientId?: string, organizationId?: string): LeadRow[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
      let list: LeadRow[] = raw ? JSON.parse(raw) : INITIAL_LEADS;
      if (!list || list.length === 0) {
        list = INITIAL_LEADS;
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      }
      if (clientId) {
        const matches = list.filter((l) => 
          l.client_id === clientId ||
          (clientId.includes('dental') && (l.client_id.includes('dental') || l.client_id.includes('sonrisas'))) ||
          (clientId.includes('inmobiliaria') && (l.client_id.includes('inmobiliaria') || l.client_id.includes('valle'))) ||
          (clientId.includes('joyeria') && (l.client_id.includes('joyeria') || l.client_id.includes('aura')))
        );
        return (matches.length > 0 ? matches : list).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      if (organizationId) {
        list = list.filter((l) => l.organization_id === organizationId);
      }
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return INITIAL_LEADS;
    }
  }

  // Captura de Leads (Utilizado por el SDK o simulador)
  public captureLead(payload: CaptureLeadPayload): CaptureLeadResponse {
    const client = this.getClientByApiKey(payload.api_key);
    if (!client) {
      return { success: false, error: 'API Key inválida o cliente inactivo.' };
    }

    const refCode = payload.ref_code || `#REF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLead: LeadRow = {
      id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      client_id: client.id,
      organization_id: client.organization_id,
      ref_code: refCode,
      customer_phone: payload.customer_phone || null,
      customer_name: payload.customer_name || 'Prospecto WhatsApp',
      ad_id: payload.ad_id,
      ad_name: payload.ad_name || 'Anuncio Meta Campaña Activa',
      utm_source: payload.utm_source || 'meta',
      utm_medium: payload.utm_medium || 'paid_social',
      utm_campaign: payload.utm_campaign || 'anuncio_whatsapp',
      utm_content: payload.utm_content || null,
      landing_url: payload.landing_url || window.location.href,
      referrer: payload.referrer || document.referrer,
      ip_hash: `ip_${Date.now().toString(36)}`,
      status: 'nuevo',
      sale_amount: 0.0,
      currency: 'USD',
      notes: 'Clic registrado en botón WhatsApp vía Attrad SDK.',
      attributed_at: new Date().toISOString(),
      closed_at: null,
      created_at: new Date().toISOString(),
    };

    const currentLeads = this.getLeads();
    const updated = [newLead, ...currentLeads];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
    this.notify();

    return {
      success: true,
      lead_id: newLead.id,
      ref_code: newLead.ref_code,
      message: 'Lead capturado con atribución First-Touch con éxito.',
    };
  }

  // Actualización de estado en 2 clics por el Magic Link
  public updateLeadStatus(leadId: string, status: LeadStatus, saleAmount: number = 0, notes?: string): boolean {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return false;

    const lead = leads[index];
    const isClosing = status === 'venta_cerrada' && lead.status !== 'venta_cerrada';

    leads[index] = {
      ...lead,
      status,
      sale_amount: status === 'venta_cerrada' ? Number(saleAmount) : 0,
      notes: notes !== undefined ? notes : lead.notes,
      closed_at: isClosing ? new Date().toISOString() : lead.closed_at,
    };

    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    this.notify();
    return true;
  }

  // Actualización de datos del prospecto desde el Magic Link (nombre / teléfono)
  public updateLeadInfo(leadId: string, customerName: string, customerPhone: string): boolean {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return false;

    leads[index] = {
      ...leads[index],
      customer_name: customerName,
      customer_phone: customerPhone,
    };

    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    this.notify();
    return true;
  }

  // Regeneración de Magic Link (Revocación inmediata del token antiguo)
  public regenerateSecureToken(clientId: string): string | null {
    const clients = this.getClients();
    const index = clients.findIndex((c) => c.id === clientId);
    if (index === -1) return null;

    const newToken = `tok_${clients[index].slug.slice(0, 8)}_${Math.random().toString(36).substring(2, 8)}`;
    clients[index] = {
      ...clients[index],
      secure_token: newToken,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    this.notify();
    return newToken;
  }

  // Alta de nuevo cliente para la agencia
  public createClient(data: {
    organization_id: string;
    name: string;
    industry: string;
    whatsapp_phone: string;
  }): ClientRow {
    const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const randomHex = Math.random().toString(36).substring(2, 6);
    const newClient: ClientRow = {
      id: `client-${Date.now()}`,
      organization_id: data.organization_id,
      name: data.name,
      slug: `${slug}-${randomHex}`,
      industry: data.industry,
      whatsapp_phone: data.whatsapp_phone,
      api_key: `attrad_live_${slug.replace(/-/g, '_').slice(0, 10)}_${Math.random().toString(36).substring(2, 8)}`,
      secure_token: `tok_${slug.slice(0, 8)}_${Math.random().toString(36).substring(2, 8)}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const clients = this.getClients();
    clients.push(newClient);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    this.notify();
    return newClient;
  }

  // Creación manual de lead desde el Magic Link (Recepción) o Panel de Agencia
  public createManualLead(data: {
    client_id: string;
    customer_name: string;
    customer_phone?: string;
    ref_code?: string;
    ad_id?: string;
    ad_name?: string;
    utm_source?: string;
    status: LeadStatus;
    sale_amount?: number;
    notes?: string;
  }): LeadRow {
    const client = this.getClients().find((c) => c.id === data.client_id);
    const refCode = data.ref_code?.trim() || `#REF-${Math.floor(1000 + Math.random() * 9000)}`;
    const isClosing = data.status === 'venta_cerrada';

    const newLead: LeadRow = {
      id: `lead-manual-${Date.now()}`,
      client_id: data.client_id,
      organization_id: client ? client.organization_id : 'org-nexus',
      ref_code: refCode,
      customer_phone: data.customer_phone?.trim() || null,
      customer_name: data.customer_name.trim() || 'Prospecto WhatsApp',
      ad_id: data.ad_id || 'manual_direct',
      ad_name: data.ad_name || 'Registro Directo en Recepción',
      utm_source: data.utm_source || 'directo',
      utm_medium: 'recepcion',
      utm_campaign: 'registro_manual',
      utm_content: null,
      landing_url: window.location.href,
      referrer: 'magic_link_portal',
      ip_hash: 'manual_entry',
      status: data.status,
      sale_amount: isClosing ? Number(data.sale_amount || 0) : 0,
      currency: 'USD',
      notes: data.notes?.trim() || 'Registrado manualmente en el Magic Link.',
      attributed_at: new Date().toISOString(),
      closed_at: isClosing ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };

    const currentLeads = this.getLeads();
    const updated = [newLead, ...currentLeads];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
    this.notify();
    return newLead;
  }

  // Eliminación o descarte permanente de lead
  public deleteLead(leadId: string): boolean {
    const leads = this.getLeads();
    const filtered = leads.filter((l) => l.id !== leadId);
    if (filtered.length === leads.length) return false;
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(filtered));
    this.notify();
    return true;
  }
}

export const attributionStore = new AttributionStore();
