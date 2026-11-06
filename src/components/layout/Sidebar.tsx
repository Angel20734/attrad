import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import {
  ShieldAlert,
  LayoutGrid,
  Kanban,
  RotateCcw,
  Sparkles,
  LogOut,
  FileText,
  ChevronDown,
  Layers,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  X,
  Building2,
  Copy,
  Check,
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
    setActiveClientSpaceId,
    activeClientSpace,
    currentUser,
    logout,
    resetAllData,
    switchRoleQuickDemo,
  } = useAttrad();

  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Token de Magic Link del cliente activo
  const activeClientToken =
    activeClientSpaceId === 'client-inmobiliaria-01'
      ? 'tok_valle_3c99a1'
      : activeClientSpaceId === 'client-dental-01'
      ? 'tok_sonrisas_8f14b2'
      : activeClientSpaceId === 'client-joyeria-01'
      ? 'tok_aura_7e52d9'
      : 'tok_sonrisas_8f14b2';

  const handleCopyMagicLink = () => {
    const url = `${window.location.origin}/?token=${activeClientToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

      {/* Barra Lateral Izquierda */}
      <aside
        className={`sidebar-wrapper ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="sidebar-inner">
          {/* 1. Encabezado de Marca */}
          <div className="sidebar-brand-header">
            <div className="brand-logo shadow-lg shadow-indigo-600/30">
              <Sparkles className="brand-icon" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="brand-title">ATTRAD</div>
              <div className="brand-subtitle">First-Touch Ad Intelligence</div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Selector de Cliente Activo (En modo Agencia) */}
          {userRole === 'agency_user' && clientSpaces.length > 0 && (
            <div className="client-switcher-card">
              <div className="client-switcher-label">ESPACIO DE CLIENTE ACTIVO</div>
              <div className="client-switcher-dropdown">
                <span className="client-avatar-emoji">
                  {activeClientSpace?.logoEmoji || '🏢'}
                </span>
                <select
                  value={activeClientSpaceId}
                  onChange={(e) => setActiveClientSpaceId(e.target.value)}
                  className="client-select-native"
                >
                  {clientSpaces.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.categoryLabel})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="client-select-arrow" />
              </div>
            </div>
          )}

          {/* 3. Menú de Navegación Vertical */}
          <div className="sidebar-nav-container">
            <div className="nav-group-title">
              {userRole === 'super_admin' ? 'ADMINISTRACIÓN' : 'ANÁLISIS & OPERACIONES'}
            </div>

            <nav className="sidebar-nav">
              {userRole === 'super_admin' ? (
                <button
                  className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => handleNavClick('admin')}
                >
                  <ShieldAlert size={18} />
                  <span>Panel Super Admin</span>
                </button>
              ) : (
                <>
                  <button
                    className={`nav-item ${activeTab === 'roi' ? 'active' : ''}`}
                    onClick={() => handleNavClick('roi')}
                  >
                    <TrendingUp size={18} />
                    <span>Atribución & ROI</span>
                    <span className="nav-badge-pill">Central</span>
                  </button>

                  <button
                    className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`}
                    onClick={() => handleNavClick('clients')}
                  >
                    <Layers size={18} />
                    <span>Mis Clientes</span>
                    <span className="nav-counter">{clientSpaces.length}</span>
                  </button>

                  <button
                    className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`}
                    onClick={() => handleNavClick('ads')}
                  >
                    <LayoutGrid size={18} />
                    <span>Hub de Anuncios</span>
                  </button>

                  <button
                    className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
                    onClick={() => handleNavClick('pipeline')}
                  >
                    <Kanban size={18} />
                    <span>Pipeline Comercial</span>
                  </button>
                </>
              )}
            </nav>

            {/* 4. Herramientas Rápidas del Cliente */}
            {userRole === 'agency_user' && (
              <div className="pt-4">
                <div className="nav-group-title">ACCESOS DIRECTOS CLIENTE</div>
                <div className="space-y-1.5">
                  {onOpenMagicLink && (
                    <button
                      onClick={() => {
                        onOpenMagicLink(activeClientToken);
                        onClose();
                      }}
                      className="tool-btn magic-link-tool"
                      title="Abrir portal de confirmación de ventas para recepción"
                    >
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-xs text-emerald-300">Portal Magic Link</div>
                        <div className="text-[10px] text-emerald-400/80 truncate">
                          Recepción {activeClientSpace?.name || 'Cliente'}
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      onClose();
                    }}
                    className="tool-btn report-tool"
                    title="Generar reporte ejecutivo imprimible"
                  >
                    <FileText size={16} className="text-indigo-400" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-bold text-xs text-white">Reporte Ejecutivo</div>
                      <div className="text-[10px] text-slate-400">PDF / Imprimible</div>
                    </div>
                  </button>

                  <a
                    href="/test-landing.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-btn simulator-tool"
                    title="Simular clic en anuncio con código para WhatsApp"
                  >
                    <ExternalLink size={16} className="text-cyan-400" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-bold text-xs text-white">Simular Anuncio</div>
                      <div className="text-[10px] text-slate-400">Tracking WhatsApp</div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 5. Pie de la Barra Lateral: Perfil y Controles */}
          <div className="sidebar-footer">
            <div className="user-profile-card">
              <div className="user-avatar-badge">
                {userRole === 'super_admin' ? 'SA' : 'AG'}
                <span className="online-indicator" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-white truncate">
                  {userRole === 'super_admin'
                    ? 'Super Admin (Tú)'
                    : currentUser?.name?.split('(')[0] || 'Agencia Nexus'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {userRole === 'super_admin' ? 'Dueño de Plataforma' : 'Empresa de Marketing'}
                </div>
              </div>
            </div>

            {/* Alternar Rol de Prueba */}
            <div className="role-switch-row">
              <button
                onClick={() => switchRoleQuickDemo('agency_user')}
                className={`role-tab-btn ${userRole === 'agency_user' ? 'active' : ''}`}
                title="Cambiar a vista Agencia"
              >
                <Building2 size={13} />
                <span>Agencia</span>
              </button>
              <button
                onClick={() => switchRoleQuickDemo('super_admin')}
                className={`role-tab-btn ${userRole === 'super_admin' ? 'active' : ''}`}
                title="Cambiar a vista Super Admin"
              >
                <ShieldAlert size={13} />
                <span>Admin</span>
              </button>
            </div>

            {/* Acciones de Footer */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={handleCopyMagicLink}
                className="action-btn flex-1"
                title="Copiar Magic Link de este cliente al portapapeles"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copiado' : 'Link'}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('¿Deseas restaurar todos los datos demo iniciales?')) {
                    resetAllData();
                  }
                }}
                className="action-btn"
                title="Restaurar datos demo iniciales"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={logout}
                className="action-btn text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                title="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Reporte Ejecutivo */}
      {showReportModal && <ClientReportModal onClose={() => setShowReportModal(false)} />}

      <style>{`
        .sidebar-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 275px;
          background: #0b0f19;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 50;
        }
        .sidebar-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 1.25rem 1rem;
          gap: 1rem;
        }
        .sidebar-brand-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .brand-logo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }
        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          line-height: 1.1;
        }
        .brand-subtitle {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Selector de Cliente */
        .client-switcher-card {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 0.65rem 0.75rem;
        }
        .client-switcher-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.04em;
          margin-bottom: 0.35rem;
        }
        .client-switcher-dropdown {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .client-avatar-emoji {
          font-size: 1.1rem;
        }
        .client-select-native {
          appearance: none;
          background: transparent;
          border: none;
          color: #f1f5f9;
          font-size: 0.8rem;
          font-weight: 700;
          padding-right: 1.5rem;
          cursor: pointer;
          outline: none;
          width: 100%;
        }
        .client-select-native option {
          background-color: #0f172a;
          color: #ffffff;
        }
        .client-select-arrow {
          position: absolute;
          right: 0;
          pointer-events: none;
          color: #94a3b8;
        }

        /* Navegación */
        .sidebar-nav-container {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .nav-group-title {
          font-size: 0.62rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.5rem;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #94a3b8;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-item.active {
          color: #ffffff;
          background: #4f46e5;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
        }
        .nav-badge-pill {
          margin-left: auto;
          font-size: 0.62rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
        }
        .nav-counter {
          margin-left: auto;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
        }

        /* Herramientas Rápidas */
        .tool-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 0.75rem;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-decoration: none;
        }
        .tool-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }
        .magic-link-tool {
          border-color: rgba(16, 185, 129, 0.25);
          background: rgba(16, 185, 129, 0.06);
        }
        .magic-link-tool:hover {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        /* Footer */
        .sidebar-footer {
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 0.65rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }
        .user-avatar-badge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3730a3, #4338ca);
          color: #c7d2fe;
          font-weight: 800;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .online-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          position: absolute;
          bottom: -1px;
          right: -1px;
          border: 2px solid #0f172a;
        }
        .role-switch-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
          background: rgba(15, 23, 42, 0.8);
          padding: 0.25rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .role-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.35rem;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .role-tab-btn:hover {
          color: #ffffff;
        }
        .role-tab-btn.active {
          background: #312e81;
          color: #e0e7ff;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.45rem 0.65rem;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
      `}</style>
    </>
  );
};

