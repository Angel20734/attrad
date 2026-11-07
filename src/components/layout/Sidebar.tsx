import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import {
  DollarSign,
  TrendingUp,
  Megaphone,
  Layers,
  ShieldCheck,
  FileText,
  ShieldAlert,
  RotateCcw,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { ClientReportModal } from '../reports/ClientReportModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMagicLink?: (token: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenMagicLink,
}) => {
  const {
    userRole,
    activeTab,
    setActiveTab,
    clientSpaces,
    activeClientSpaceId,
    logout,
    resetAllData,
    switchRoleQuickDemo,
  } = useAttrad();

  const [showReportModal, setShowReportModal] = useState(false);

  // Token de Magic Link del cliente activo
  const activeClientToken =
    activeClientSpaceId === 'client-inmobiliaria-01'
      ? 'tok_valle_3c99a1'
      : activeClientSpaceId === 'client-dental-01'
      ? 'tok_sonrisas_8f14b2'
      : activeClientSpaceId === 'client-joyeria-01'
      ? 'tok_aura_7e52d9'
      : 'tok_sonrisas_8f14b2';

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Dock Lateral Estilo Pipedrive (Slim Icon Dock 64px) */}
      <aside
        className={`pipedrive-sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="sidebar-dock">
          {/* Logo Superior */}
          <div className="dock-logo-container">
            <div className="dock-logo-badge" title="ATTRAD Platform">
              <span className="logo-letter">P</span>
            </div>
          </div>

          {/* Menú de Iconos Verticales */}
          <nav className="dock-nav-items">
            {userRole === 'super_admin' ? (
              <button
                className={`dock-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin')}
                title="Panel Super Admin"
              >
                <ShieldAlert size={20} />
                <span className="dock-tooltip">Super Admin</span>
              </button>
            ) : (
              <>
                {/* 1. Tratos & Pipeline (Deals) */}
                <button
                  className={`dock-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
                  onClick={() => handleNavClick('pipeline')}
                  title="Pipeline de Tratos & Compradores"
                >
                  <DollarSign size={20} />
                  <span className="dock-tooltip">Tratos & Pipeline</span>
                </button>

                {/* 2. Atribución & ROI */}
                <button
                  className={`dock-btn ${activeTab === 'roi' ? 'active' : ''}`}
                  onClick={() => handleNavClick('roi')}
                  title="Atribución de Ventas & ROI"
                >
                  <TrendingUp size={20} />
                  <span className="dock-tooltip">Atribución & ROI</span>
                </button>

                {/* 3. Hub de Anuncios con Badge */}
                <button
                  className={`dock-btn ${activeTab === 'ads' ? 'active' : ''}`}
                  onClick={() => handleNavClick('ads')}
                  title="Hub de Anuncios & Creativos"
                >
                  <div className="relative">
                    <Megaphone size={20} />
                    <span className="dock-badge">27</span>
                  </div>
                  <span className="dock-tooltip">Hub de Anuncios</span>
                </button>

                {/* 4. Espacios de Clientes */}
                <button
                  className={`dock-btn ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => handleNavClick('clients')}
                  title="Espacios de Clientes"
                >
                  <div className="relative">
                    <Layers size={20} />
                    <span className="dock-badge-subtle">{clientSpaces.length}</span>
                  </div>
                  <span className="dock-tooltip">Espacios de Clientes</span>
                </button>

                {/* 5. Portal Magic Link */}
                {onOpenMagicLink && (
                  <button
                    className="dock-btn"
                    onClick={() => {
                      onOpenMagicLink(activeClientToken);
                      onClose();
                    }}
                    title="Abrir Portal Magic Link (Recepción)"
                  >
                    <ShieldCheck size={20} className="text-emerald-400" />
                    <span className="dock-tooltip">Portal Magic Link</span>
                  </button>
                )}

                {/* 6. Reportes Ejecutivos */}
                <button
                  className="dock-btn"
                  onClick={() => {
                    setShowReportModal(true);
                    onClose();
                  }}
                  title="Generar Reporte de Cliente"
                >
                  <FileText size={20} className="text-cyan-400" />
                  <span className="dock-tooltip">Reporte Ejecutivo</span>
                </button>
              </>
            )}
          </nav>

          {/* Iconos Inferiores (Herramientas, Rol, Logout) */}
          <div className="dock-bottom-items">
            {/* Alternar Rol Demo */}
            <button
              onClick={() => {
                switchRoleQuickDemo(userRole === 'super_admin' ? 'agency_user' : 'super_admin');
                onClose();
              }}
              className="dock-btn dock-btn-subtle"
              title={`Alternar a vista ${userRole === 'super_admin' ? 'Agencia' : 'Super Admin'}`}
            >
              <UserCheck size={18} />
              <span className="dock-tooltip">
                Rol: {userRole === 'super_admin' ? 'Super Admin' : 'Agencia'}
              </span>
            </button>

            {/* Reiniciar Datos */}
            <button
              onClick={() => {
                if (confirm('¿Restablecer datos demo a los valores iniciales?')) {
                  resetAllData();
                  window.location.reload();
                }
              }}
              className="dock-btn dock-btn-subtle"
              title="Restablecer Datos Demo"
            >
              <RotateCcw size={18} />
              <span className="dock-tooltip">Restablecer Datos</span>
            </button>

            {/* Cerrar Sesión */}
            <button
              onClick={logout}
              className="dock-btn dock-btn-danger"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
              <span className="dock-tooltip">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Reporte Ejecutivo */}
      {showReportModal && (
        <ClientReportModal onClose={() => setShowReportModal(false)} />
      )}

      <style>{`
        .pipedrive-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 60px;
          background: #171b26;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 50;
          transition: transform 0.25s ease-in-out;
        }

        .sidebar-dock {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          padding: 0.75rem 0.35rem;
          gap: 0.5rem;
        }

        .dock-logo-container {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 0.25rem;
        }

        .dock-logo-badge {
          width: 38px;
          height: 38px;
          background: #2b334a;
          color: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.3rem;
          letter-spacing: -0.05em;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }

        .logo-letter {
          transform: translateY(-1px);
        }

        .dock-nav-items {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          flex: 1;
          width: 100%;
        }

        .dock-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .dock-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        /* Botón Activo Estilo Pipedrive (Píldora Azul Sólida con Icono Blanco) */
        .dock-btn.active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        }

        .dock-btn-subtle {
          color: #64748b;
        }
        .dock-btn-subtle:hover {
          color: #cbd5e1;
        }

        .dock-btn-danger:hover {
          color: #f87171;
          background: rgba(239, 68, 68, 0.12);
        }

        .dock-badge {
          position: absolute;
          top: -4px;
          right: -6px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 9999px;
          border: 2px solid #171b26;
          line-height: 1;
        }

        .dock-badge-subtle {
          position: absolute;
          top: -3px;
          right: -5px;
          background: #3b82f6;
          color: white;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 9999px;
          line-height: 1;
        }

        .dock-bottom-items {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          width: 100%;
        }

        /* Tooltip flotante al pasar el cursor */
        .dock-tooltip {
          position: absolute;
          left: 56px;
          background: #0f172a;
          color: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0;
          pointer-events: none;
          transform: translateX(-4px);
          transition: all 0.15s ease;
          z-index: 100;
        }

        .dock-btn:hover .dock-tooltip {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </>
  );
};
