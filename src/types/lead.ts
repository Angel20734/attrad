export type LifecycleStatus = 'nuevo' | 'contacto' | 'demo' | 'propuesta' | 'cliente_contrato' | 'inactivo' | 'potencial';

export interface ActivityItem {
  id: string;
  type: 'call' | 'demo' | 'email' | 'meeting' | 'task';
  title: string;
  dueTime: string;
  completed: boolean;
}

export interface Touchpoint {
  id: string;
  adId: string;
  adName: string;
  platform: string;
  timestamp: string; // ISO date
  eventType: 'first_click' | 're_engagement' | 'landing_visit';
}

export interface Lead {
  id: string;
  tenantId: string; // Para compatibilidad
  agencyId?: string;
  clientSpaceId?: string; // ID del espacio de cliente al que pertenece el comprador final
  dealTitle?: string; // Título comercial del trato (ej: Bringit media agency deal)
  company?: string; // Empresa o cuenta comercial
  name: string;
  phone: string;
  email: string;
  city?: string;
  avatarUrl?: string;
  lifecycleStatus: LifecycleStatus;
  firstContactAt: string; // ISO date (Tiempo desde primer contacto)
  contractSignedAt?: string; // ISO date (Tiempo desde primer contrato/compra)
  dealValue: number; // Monto en $ para calcular ROAS
  firstTouchAdId: string; // ID del anuncio ganador donde hizo el clic determinante
  touchpointsHistory: Touchpoint[];
  tags: string[];
  notes?: string;
  assignedTo?: string;
  lastMessageAt: string;
  unreadCount?: number;
  nextActivity?: ActivityItem;
  activities?: ActivityItem[];
}
