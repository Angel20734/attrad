-- ==============================================================================
-- ATTRAD - MIGRACIÓN INICIAL (FASE 1: Base de Datos y Aislamiento Multi-Tenant)
-- Motor: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM para estados de prospectos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        CREATE TYPE lead_status AS ENUM ('nuevo', 'cita_agendada', 'venta_cerrada', 'descartado');
    END IF;
END $$;

-- 3. Tabla ORGANIZATIONS (Agencias de Marketing / Tenancies Marca Blanca)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    brand_logo_url TEXT,
    brand_primary_color VARCHAR(10) DEFAULT '#6366F1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla CLIENTS (Negocios gestionados: Clínicas, Inmobiliarias, etc.)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    industry VARCHAR(100) DEFAULT 'General',
    whatsapp_phone VARCHAR(50),
    api_key VARCHAR(64) UNIQUE NOT NULL,       -- Clave pública del SDK de captura
    secure_token VARCHAR(64) UNIQUE NOT NULL,  -- Token permanente/revocable para Magic Link
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_org_client_slug UNIQUE (organization_id, slug)
);

-- 5. Tabla LEADS (Eventos de atribución First-Touch y conversiones)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ref_code VARCHAR(32) NOT NULL,            -- Código de referencia dinámico en chat (ej: #D-842)
    customer_phone VARCHAR(50),
    customer_name VARCHAR(150),
    ad_id VARCHAR(100) NOT NULL,              -- ID del anuncio en Meta Ads / Google / TikTok
    ad_name VARCHAR(255),
    utm_source VARCHAR(100) DEFAULT 'meta',
    utm_medium VARCHAR(100) DEFAULT 'paid_social',
    utm_campaign VARCHAR(150),
    utm_content VARCHAR(150),
    landing_url TEXT,
    referrer TEXT,
    ip_hash VARCHAR(64),
    status lead_status DEFAULT 'nuevo',
    sale_amount NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    attributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices para consultas de alta velocidad y atribución instantánea
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_ad_id ON leads(ad_id);
CREATE INDEX IF NOT EXISTS idx_leads_ref_code ON leads(ref_code);
CREATE INDEX IF NOT EXISTS idx_clients_api_key ON clients(api_key);
CREATE INDEX IF NOT EXISTS idx_clients_secure_token ON clients(secure_token);

-- ==============================================================================
-- POLÍTICAS DE AISLAMIENTO MULTI-TENANT (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Regla 1: Las agencias solo pueden acceder y modificar datos de su propia organización
CREATE POLICY "Agencias ven su propia organizacion" 
ON organizations FOR SELECT 
USING (id = auth.jwt() ->> 'organization_id'::uuid);

CREATE POLICY "Agencias gestionan solo sus clientes"
ON clients FOR ALL 
USING (organization_id = auth.jwt() ->> 'organization_id'::uuid);

CREATE POLICY "Agencias gestionan solo sus leads"
ON leads FOR ALL 
USING (organization_id = auth.jwt() ->> 'organization_id'::uuid);

-- Regla 2: Ingesta pública permitida con API Key válida (verificada en backend/Edge Function)
-- El Edge Function ejecuta las inserciones con la Service Role Key, blindando la BD.
