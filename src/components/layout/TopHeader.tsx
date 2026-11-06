import React from 'react';
import { useAttrad } from '../../context/AttradContext';
import {
  Menu,
  ShieldCheck,
  FileText,
  ExternalLink,
  TrendingUp,
  Layers,
  LayoutGrid,
  Kanban,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenMagicLink?: (token: string) => void;
  onOpenReportModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenMagicLink,
  onOpenReportModal,
}) => {
  const { activeTab, activeClientSpace, activeClientSpaceId, userRole } = useAttrad();

  // Token del cliente activo
  const activeClientToken =
    activeClientSpaceId === 'client-inmobiliaria-01'
      ? 'tok_valle_3c99a1'
      : activeClientSpaceId === 'client-dental-01'
      ? 'tok_sonrisas_8f14b2'
      : activeClientSpaceId === 'client-joyeria-01'
      ? 'tok_aura_7e52d9'
      : 'tok_sonrisas_8f14b2';

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'roi':
        return {
          title: 'Atribución Publicitaria & Retorno de Inversión (ROI)',
          subtitle: 'Cruce en tiempo real de presupuesto publicitario vs facturación cobrada',
          icon: <TrendingUp size={18} className="text-indigo-400" />,
        };
      case 'clients':
        return {
          title: 'Espacios de Clientes Gestionados',
          subtitle: 'Gestión multicliente, credenciales y cuentas publicitarias conectadas',
          icon: <Layers size={18} className="text-cyan-400" />,
        };
      case 'ads':
        return {
          title: 'Hub de Anuncios & Ad Guardian',
          subtitle: 'Supervisión de creativos en Meta, Google y TikTok con alertas preventivas',
          icon: <LayoutGrid size={18} className="text-emerald-400" />,
        };
      case 'pipeline':
        return {
          title: 'Pipeline Comercial & Dossier de Conversiones',
          subtitle: 'Embudo de ventas con trazabilidad de primer contacto First-Touch',
          icon: <Kanban size={18} className="text-amber-400" />,
        };
      case 'admin':
        return {
          title: 'Panel de Control Super Admin',
          subtitle: 'Supervisión de agencias suscritas, facturación MRR y estado de cuentas',
          icon: <ShieldAlert size={18} className="text-rose-400" />,
        };
      default:
        return {
          title: 'Plataforma ATTRAD',
          subtitle: 'Inteligencia de atribución de anuncios publicitarios',
          icon: <Sparkles size={18} className="text-indigo-400" />,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="top-header-bar">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa móvil */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          title="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            {headerInfo.icon}
            <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">
              {headerInfo.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
            {headerInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Controles del Cliente Activo en Header */}
      {userRole === 'agency_user' && activeClientSpace && (
        <div className="flex items-center gap-2.5">
          {/* Badge del Cliente Activo */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-sm">{activeClientSpace.logoEmoji}</span>
            <span className="font-bold text-white">{activeClientSpace.name}</span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">
              • {activeClientSpace.categoryLabel}
            </span>
          </div>

          {/* Botón Directo Magic Link */}
          {onOpenMagicLink && (
            <button
              onClick={() => onOpenMagicLink(activeClientToken)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
              title="Abrir el portal de recepción y cierre de ventas para este cliente"
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Magic Link</span>
            </button>
          )}

          {/* Botón Reporte */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              title="Generar reporte ejecutivo para el cliente"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Reporte</span>
            </button>
          )}

          {/* Enlace Landing Demo */}
          <a
            href="/test-landing.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors hidden sm:flex"
            title="Abrir landing de prueba con inyección de código WhatsApp"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      <style>{`
        .top-header-bar {
          background: rgba(11, 15, 25, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 30;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
      `}</style>
    </header>
  );
};

