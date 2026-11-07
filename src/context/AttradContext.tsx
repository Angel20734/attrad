import React, { createContext, useContext, useState, useEffect } from 'react';
import { MarketingAgency, ClientSpace, CurrentUser, UserRole, ClientCategory } from '../types/tenant';
import { AdItem, AdPlatform } from '../types/ad';
import { Lead, LifecycleStatus } from '../types/lead';
import {
  INITIAL_AGENCIES,
  INITIAL_CLIENT_SPACES,
  INITIAL_ADS,
  INITIAL_LEADS,
} from '../data/mockData';

export type ActiveTab = 'roi' | 'clients' | 'ads' | 'pipeline' | 'admin';

interface AttradContextType {
  // Autenticación
  currentUser: CurrentUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  userRole: UserRole;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Gestión de Agencias (Super Admin)
  agencies: MarketingAgency[];
  createAgency: (data: {
    name: string;
    contactName: string;
    contactEmail: string;
    subscriptionPlan: string;
    monthlyFee: number;
    loginEmail: string;
    provisionalPassword: string;
  }) => void;
  toggleAgencySubscription: (agencyId: string) => void;
  deleteAgency: (agencyId: string) => boolean;

  // Gestión de Espacios de Clientes (Empresa de Marketing)
  clientSpaces: ClientSpace[];
  activeClientSpaceId: string;
  setActiveClientSpaceId: (id: string) => void;
  activeClientSpace: ClientSpace | undefined;
  createClientSpace: (data: {
    name: string;
    category: ClientCategory;
    contactName: string;
    contactEmail: string;
    metaConnected: boolean;
    metaAccountName?: string;
    googleConnected: boolean;
    googleAccountName?: string;
    tiktokConnected: boolean;
    tiktokAccountName?: string;
  }) => void;
  updateConnectedNetworks: (
    clientId: string,
    networks: { metaAds: boolean; googleAds: boolean; tiktokAds: boolean },
    accounts: { metaAccountName?: string; googleAccountName?: string; tiktokAccountName?: string }
  ) => void;

  // Anuncios y Métricas (Filtrados por Cliente Activo)
  ads: AdItem[];
  currentClientAds: AdItem[];
  selectedPlatform: AdPlatform | 'all';
  setSelectedPlatform: (platform: AdPlatform | 'all') => void;
  toggleAdStatus: (adId: string) => void;

  // Leads y Atribución First-Touch (Filtrados por Cliente Activo)
  leads: Lead[];
  currentClientLeads: Lead[];
  selectedLeadId: string | null;
  setSelectedLeadId: (leadId: string | null) => void;
  selectedLead: Lead | undefined;
  updateLeadStatus: (leadId: string, newStatus: LifecycleStatus) => void;
  updateLeadDealValue: (leadId: string, dealValue: number) => void;

  // Utilidades Demo
  resetAllData: () => void;
  switchRoleQuickDemo: (role: UserRole) => void;

  // Alias para retrocompatibilidad
  tenants: MarketingAgency[];
  activeTenantId: string;
  activeTenant: MarketingAgency | undefined;
}

const AttradContext = createContext<AttradContextType | undefined>(undefined);

// Credenciales fijas del Super Admin para pruebas
const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@attrad.com',
  password: 'AdminMaster2026*',
  name: 'Super Administrador (Tú)',
};

export const AttradProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Estado de Autenticación
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('attrad_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Por defecto iniciamos con sesión de prueba de la Agencia Nexus Growth Media
    return {
      id: 'user-nexus-01',
      email: 'nexus@agencymedia.com',
      name: 'Alejandro Morales (Nexus Growth Media)',
      role: 'agency_user',
      agencyId: 'agency-nexus-01',
      tenantId: 'agency-nexus-01',
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [selectedPlatform, setSelectedPlatform] = useState<AdPlatform | 'all'>('all');

  // 2. Estado de Agencias (Super Admin)
  const [agencies, setAgencies] = useState<MarketingAgency[]>(() => {
    try {
      const saved = localStorage.getItem('attrad_agencies');
      return saved ? JSON.parse(saved) : INITIAL_AGENCIES;
    } catch {
      return INITIAL_AGENCIES;
    }
  });

  // 3. Estado de Espacios de Clientes (Empresas de Marketing)
  const [clientSpaces, setClientSpaces] = useState<ClientSpace[]>(() => {
    try {
      const saved = localStorage.getItem('attrad_client_spaces');
      return saved ? JSON.parse(saved) : INITIAL_CLIENT_SPACES;
    } catch {
      return INITIAL_CLIENT_SPACES;
    }
  });

  const [activeClientSpaceId, setActiveClientSpaceId] = useState<string>(() => {
    const saved = localStorage.getItem('attrad_active_client_space_id');
    return saved || 'client-inmobiliaria-01';
  });

  // 4. Estado de Anuncios
  const [ads, setAds] = useState<AdItem[]>(() => {
    try {
      const saved = localStorage.getItem('attrad_ads');
      return saved ? JSON.parse(saved) : INITIAL_ADS;
    } catch {
      return INITIAL_ADS;
    }
  });

  // 5. Estado de Leads y Compradores Finales
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('attrad_leads');
      return saved ? JSON.parse(saved) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>('lead-carlos-01');

  // Persistir en localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('attrad_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('attrad_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('attrad_agencies', JSON.stringify(agencies));
  }, [agencies]);

  useEffect(() => {
    localStorage.setItem('attrad_client_spaces', JSON.stringify(clientSpaces));
  }, [clientSpaces]);

  useEffect(() => {
    localStorage.setItem('attrad_active_client_space_id', activeClientSpaceId);
  }, [activeClientSpaceId]);

  useEffect(() => {
    localStorage.setItem('attrad_ads', JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    localStorage.setItem('attrad_leads', JSON.stringify(leads));
  }, [leads]);

  // LOGIN
  const login = (email: string, pass: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // 1. Comprobar si es el Super Admin
    if (
      trimmedEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() &&
      trimmedPass === SUPER_ADMIN_CREDENTIALS.password
    ) {
      const user: CurrentUser = {
        id: 'admin-master',
        email: SUPER_ADMIN_CREDENTIALS.email,
        name: SUPER_ADMIN_CREDENTIALS.name,
        role: 'super_admin',
      };
      setCurrentUser(user);
      setActiveTab('admin');
      return { success: true };
    }

    // 2. Comprobar si es una Empresa de Marketing (Usuario)
    const matchingAgency = agencies.find(
      (a) =>
        a.assignedCredentials.loginEmail.toLowerCase() === trimmedEmail &&
        a.assignedCredentials.provisionalPassword === trimmedPass
    );

    if (matchingAgency) {
      const user: CurrentUser = {
        id: `user-${matchingAgency.id}`,
        email: matchingAgency.assignedCredentials.loginEmail,
        name: `${matchingAgency.contactName} (${matchingAgency.name})`,
        role: 'agency_user',
        agencyId: matchingAgency.id,
        tenantId: matchingAgency.id,
      };
      setCurrentUser(user);

      // Buscar el primer cliente de esta agencia
      const firstClient = clientSpaces.find((c) => c.agencyId === matchingAgency.id);
      if (firstClient) {
        setActiveClientSpaceId(firstClient.id);
      }
      setActiveTab('clients');
      return { success: true };
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Verifica tu correo y contraseña.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('attrad_current_user');
  };

  // Atajo rápido de cambio de rol para testing
  const switchRoleQuickDemo = (role: UserRole) => {
    if (role === 'super_admin') {
      setCurrentUser({
        id: 'admin-master',
        email: SUPER_ADMIN_CREDENTIALS.email,
        name: 'Super Administrador (Tú)',
        role: 'super_admin',
      });
      setActiveTab('admin');
    } else {
      const nexusAgency = agencies.find((a) => a.id === 'agency-nexus-01') || agencies[0];
      setCurrentUser({
        id: `user-${nexusAgency.id}`,
        email: nexusAgency.assignedCredentials.loginEmail,
        name: `${nexusAgency.contactName} (${nexusAgency.name})`,
        role: 'agency_user',
        agencyId: nexusAgency.id,
        tenantId: nexusAgency.id,
      });
      const firstClient = clientSpaces.find((c) => c.agencyId === nexusAgency.id) || clientSpaces[0];
      if (firstClient) {
        setActiveClientSpaceId(firstClient.id);
      }
      setActiveTab('clients');
    }
  };

  // GESTIÓN DE AGENCIAS (SUPER ADMIN)
  const createAgency = (data: {
    name: string;
    contactName: string;
    contactEmail: string;
    subscriptionPlan: string;
    monthlyFee: number;
    loginEmail: string;
    provisionalPassword: string;
  }) => {
    const newAgencyId = `agency-${Date.now().toString(36)}`;
    const newAgency: MarketingAgency = {
      id: newAgencyId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      subscriptionPlan: data.subscriptionPlan,
      monthlyFee: data.monthlyFee,
      currency: 'USD',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      assignedCredentials: {
        loginEmail: data.loginEmail,
        provisionalPassword: data.provisionalPassword,
      },
    };

    // Crear un espacio de cliente inicial para esta agencia
    const initialClient: ClientSpace = {
      id: `client-${Date.now().toString(36)}`,
      agencyId: newAgencyId,
      name: `${data.name} - Cuenta Demo`,
      category: 'servicios',
      categoryLabel: 'Servicios Generales',
      logoEmoji: '🚀',
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      connectedNetworks: {
        metaAds: true,
        googleAds: true,
        tiktokAds: false,
      },
      networkAccounts: {
        metaAccountName: `Act_${Math.floor(10000 + Math.random() * 90000)} - Meta Ads`,
        googleAccountName: `AW-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      monthlyAdSpend: 1200,
      monthlyLeads: 15,
      contractsClosed: 1,
      revenueGenerated: 3500,
      createdAt: new Date().toISOString(),
    };

    setAgencies((prev) => [newAgency, ...prev]);
    setClientSpaces((prev) => [initialClient, ...prev]);
  };

  const toggleAgencySubscription = (agencyId: string) => {
    setAgencies((prev) =>
      prev.map((a) => {
        if (a.id === agencyId) {
          const nextStatus = a.subscriptionStatus === 'active' ? 'suspended' : 'active';
          return { ...a, subscriptionStatus: nextStatus };
        }
        return a;
      })
    );
  };

  const deleteAgency = (agencyId: string): boolean => {
    setAgencies((prev) => prev.filter((a) => a.id !== agencyId));
    setClientSpaces((prev) => prev.filter((c) => c.agencyId !== agencyId));
    return true;
  };

  // GESTIÓN DE ESPACIOS DE CLIENTES (EMPRESAS DE MARKETING)
  const createClientSpace = (data: {
    name: string;
    category: ClientCategory;
    contactName: string;
    contactEmail: string;
    metaConnected: boolean;
    metaAccountName?: string;
    googleConnected: boolean;
    googleAccountName?: string;
    tiktokConnected: boolean;
    tiktokAccountName?: string;
  }) => {
    const currentAgencyId = currentUser?.agencyId || 'agency-nexus-01';
    const categoryLabels: Record<ClientCategory, string> = {
      inmobiliaria: 'Bienes Raíces & Preventas',
      salud_dental: 'Salud & Odontología',
      ecommerce: 'E-commerce & Tienda Online',
      servicios: 'Servicios Profesionales',
      otro: 'Negocio Independiente',
    };

    const emojis: Record<ClientCategory, string> = {
      inmobiliaria: '🏢',
      salud_dental: '🦷',
      ecommerce: '🛍️',
      servicios: '💼',
      otro: '⭐',
    };

    const newClientId = `client-${Date.now().toString(36)}`;
    const newClient: ClientSpace = {
      id: newClientId,
      agencyId: currentAgencyId,
      name: data.name,
      category: data.category,
      categoryLabel: categoryLabels[data.category] || 'Cliente',
      logoEmoji: emojis[data.category] || '🏬',
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      connectedNetworks: {
        metaAds: data.metaConnected,
        googleAds: data.googleConnected,
        tiktokAds: data.tiktokConnected,
      },
      networkAccounts: {
        metaAccountName: data.metaAccountName,
        googleAccountName: data.googleAccountName,
        tiktokAccountName: data.tiktokAccountName,
      },
      monthlyAdSpend: 0,
      monthlyLeads: 0,
      contractsClosed: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString(),
    };

    setClientSpaces((prev) => [newClient, ...prev]);
    setActiveClientSpaceId(newClientId);
  };

  const updateConnectedNetworks = (
    clientId: string,
    networks: { metaAds: boolean; googleAds: boolean; tiktokAds: boolean },
    accounts: { metaAccountName?: string; googleAccountName?: string; tiktokAccountName?: string }
  ) => {
    setClientSpaces((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              connectedNetworks: networks,
              networkAccounts: accounts,
            }
          : c
      )
    );
  };

  // ANUNCIOS Y ACCIONES
  const toggleAdStatus = (adId: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a))
    );
  };

  // LEADS Y ACCIONES
  const updateLeadStatus = (leadId: string, newStatus: LifecycleStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const isNowContract = newStatus === 'cliente_contrato';
          return {
            ...l,
            lifecycleStatus: newStatus,
            contractSignedAt: isNowContract && !l.contractSignedAt ? new Date().toISOString() : l.contractSignedAt,
          };
        }
        return l;
      })
    );
  };

  const updateLeadDealValue = (leadId: string, dealValue: number) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return { ...l, dealValue };
        }
        return l;
      })
    );
  };

  // RESETEAR DATOS DE PRUEBA
  const resetAllData = () => {
    localStorage.removeItem('attrad_agencies');
    localStorage.removeItem('attrad_client_spaces');
    localStorage.removeItem('attrad_active_client_space_id');
    localStorage.removeItem('attrad_ads');
    localStorage.removeItem('attrad_leads');
    localStorage.removeItem('attrad_orgs');
    localStorage.removeItem('attrad_clients');
    localStorage.removeItem('attrad_organizations_v1');
    localStorage.removeItem('attrad_clients_v1');
    localStorage.removeItem('attrad_leads_v1');
    localStorage.removeItem('_attrad_first_touch');
    setAgencies(INITIAL_AGENCIES);
    setClientSpaces(INITIAL_CLIENT_SPACES);
    setActiveClientSpaceId('client-inmobiliaria-01');
    setAds(INITIAL_ADS);
    setLeads(INITIAL_LEADS);
    setSelectedLeadId('lead-carlos-01');
  };

  // Computados
  const userRole: UserRole = currentUser?.role || 'agency_user';
  const activeAgencyId = currentUser?.agencyId || 'agency-nexus-01';
  const activeAgency = agencies.find((a) => a.id === activeAgencyId);

  // Espacio de cliente activo con fallback seguro
  const activeClientSpace = clientSpaces.find((c) => c.id === activeClientSpaceId) || clientSpaces[0];

  // Anuncios del cliente activo
  const currentClientAds = ads.filter((a) => {
    if (a.clientSpaceId) {
      return a.clientSpaceId === activeClientSpaceId;
    }
    // Si no tiene clientSpaceId específico, comparar por agencia
    return a.agencyId === activeAgencyId || a.tenantId === activeAgencyId;
  });

  // Leads del cliente activo
  const currentClientLeads = leads.filter((l) => {
    if (l.clientSpaceId) {
      return l.clientSpaceId === activeClientSpaceId;
    }
    return l.agencyId === activeAgencyId || l.tenantId === activeAgencyId;
  });

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <AttradContext.Provider
      value={{
        currentUser,
        login,
        logout,
        userRole,
        activeTab,
        setActiveTab,

        agencies,
        createAgency,
        toggleAgencySubscription,
        deleteAgency,

        clientSpaces,
        activeClientSpaceId,
        setActiveClientSpaceId,
        activeClientSpace,
        createClientSpace,
        updateConnectedNetworks,

        ads,
        currentClientAds,
        selectedPlatform,
        setSelectedPlatform,
        toggleAdStatus,

        leads,
        currentClientLeads,
        selectedLeadId,
        setSelectedLeadId,
        selectedLead,
        updateLeadStatus,
        updateLeadDealValue,

        resetAllData,
        switchRoleQuickDemo,

        // Compatibilidad
        tenants: agencies,
        activeTenantId: activeAgencyId,
        activeTenant: activeAgency,
      }}
    >
      {children}
    </AttradContext.Provider>
  );
};

export const useAttrad = (): AttradContextType => {
  const context = useContext(AttradContext);
  if (!context) {
    throw new Error('useAttrad debe ser utilizado dentro de un AttradProvider');
  }
  return context;
};
