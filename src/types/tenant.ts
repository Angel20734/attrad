export type SubscriptionStatus = 'active' | 'suspended' | 'trial' | 'expired';

export interface MarketingAgency {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactName: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: string;
  subscriptionExpiresAt: string; // ISO date
  monthlyFee: number;
  currency: string;
  createdAt: string;
  assignedCredentials: {
    loginEmail: string;
    provisionalPassword: string;
  };
  notes?: string;
}

// Alias para retrocompatibilidad
export type Tenant = MarketingAgency;

export type ClientCategory = 'inmobiliaria' | 'salud_dental' | 'ecommerce' | 'servicios' | 'otro';

export interface ClientSpace {
  id: string;
  agencyId: string;
  name: string;
  category: ClientCategory;
  categoryLabel: string;
  logoEmoji: string;
  contactName: string;
  contactEmail: string;
  connectedNetworks: {
    metaAds: boolean; // Facebook & Instagram
    googleAds: boolean;
    tiktokAds: boolean;
  };
  networkAccounts: {
    metaAccountName?: string;
    googleAccountName?: string;
    tiktokAccountName?: string;
  };
  monthlyAdSpend: number;
  monthlyLeads: number;
  contractsClosed: number;
  revenueGenerated: number;
  createdAt: string;
}

export type UserRole = 'super_admin' | 'agency_user' | 'tenant_owner';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId?: string; // ID de la agencia asociada si no es super_admin
  tenantId?: string; // Para compatibilidad
}
