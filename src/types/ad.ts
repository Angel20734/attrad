export type AdPlatform = 'facebook' | 'instagram' | 'tiktok' | 'google';

export interface AdItem {
  id: string;
  tenantId: string; // Para compatibilidad con agencia
  agencyId?: string;
  clientSpaceId?: string; // ID del espacio de cliente al que pertenece el anuncio
  platform: AdPlatform;
  adName: string;
  campaignName: string;
  creativeUrl: string; // Image or mock video URL
  externalPreviewUrl: string; // Direct link to view the ad live on the network
  headline: string;
  copyExcerpt: string;
  daysActive: number; // Días que lleva en circulación
  spend: number; // Inversión publicitaria ($)
  clicks: number;
  impressions: number;
  leadsGenerated: number; // 1ª métrica de ranking
  contractsClosed: number; // Ventas/contratos cerrados
  revenueGenerated: number; // 2ª métrica de ranking ($)
  costPerLead: number; // 3ª métrica de ranking ($)
  status: 'active' | 'paused';
  guardianAlert?: {
    type: 'critical_positive' | 'warning_negative' | 'neutral';
    message: string;
  };
}

export type AdSortField = 'leads' | 'revenue' | 'cpl' | 'daysActive';
