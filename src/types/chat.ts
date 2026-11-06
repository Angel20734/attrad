export type MessageSender = 'lead' | 'business';

export interface ChatMessage {
  id: string;
  leadId: string;
  tenantId: string;
  sender: MessageSender;
  content: string;
  timestamp: string; // ISO date
  status: 'sent' | 'delivered' | 'read';
}

export interface QuickTemplate {
  id: string;
  title: string;
  content: string;
  category: 'bienvenida' | 'seguimiento' | 'oferta' | 'cierre';
}
