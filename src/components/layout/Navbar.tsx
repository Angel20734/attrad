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
} from 'lucide-react';
import { ClientReportModal } from '../reports/ClientReportModal';

interface NavbarProps {
  onOpenMagicLink?: (token: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMagicLink }) => {
  const {
    userRole,
    activeTab,
    setActiveTab,
    clientSpaces,
    activeClientSpaceId,
    setActiveClientSpaceId,
    activeClientSpace,
    logout,
    resetAllData,
    switchRoleQuickDemo,
  } = useAttrad();

  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <header className="navbar-wrapper">
        <div className="navbar-container">
          {/* Marca y Logotipo */}
          <div className="brand-section">
            <div className="brand-logo">
              <Sparkles className="brand-icon" size={22} />
            </div>
            <div>
              <div className="brand-title">
                ATTRAD
              </div>
              <div className="brand-subtitle">First-Touch Ad Attribution</div>
            </div>
          </div>

          {/* Selector de Espacio de Cliente (Solo si está autenticado como Empresa de Marketing) */}
          {userRole === 'agency_user' && clientSpaces.length > 0 && (
            <div className="client-switcher-section">
              <span className="client-switcher-label">Cliente Activo:</span>
              <div className="client-select-wrapper">
                <span className="client-emoji-badge">{activeClientSpace?.logoEmoji || '🏢'}</span>
                <select
                  value={activeClientSpaceId}
                  onChange={(e) => setActiveClientSpaceId(e.target.value)}
                  className="client-select"
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

          {/* Navegación por Pestañas */}
          <nav className="nav-tabs">
            {userRole === 'super_admin' ? (
              <button
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldAlert size={16} />
                Panel Super Admin
              </button>
            ) : (
              <>
                <button
                  className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clients')}
                >
                  <Layers size={16} />
                  Mis Clientes ({clientSpaces.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ads')}
                >
                  <LayoutGrid size={16} />
                  Hub de Anuncios
                </button>
                <button
                  className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pipeline')}
                >
                  <Kanban size={16} />
                  Pipeline Comercial
                </button>
              </>
            )}
          </nav>

          {/* Botón de Reporte & Perfil de Usuario */}
          <div className="controls-section">
            {userRole === 'agency_user' && activeClientSpace && (
              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-primary btn-sm report-btn"
                title="Generar reporte ejecutivo imprimible para el cliente"
              >
                <FileText size={15} />
                Reporte para Cliente
              </button>
            )}

            {userRole === 'agency_user' && onOpenMagicLink && (
              <button
                onClick={() => onOpenMagicLink('tok_sonrisas_8f14b2')}
                className="btn btn-secondary btn-sm"
                title="Probar Magic Link de Recepción (Clínica Sonrisas)"
                style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ShieldCheck size={14} style={{ color: '#818cf8' }} />
                <span>Magic Link</span>
              </button>
            )}

            {/* Selector Rápido de Rol (Testing) */}
            <div className="role-switcher-box">
              <span className="role-switcher-label">MODO TEST:</span>
              <button
                className={`role-btn ${userRole === 'super_admin' ? 'active' : ''}`}
                onClick={() => switchRoleQuickDemo('super_admin')}
                title="Super Admin: Gestiona agencias, suscripciones y asigna credenciales"
              >
                Super Admin
              </button>
              <button
                className={`role-btn ${userRole === 'agency_user' ? 'active' : ''}`}
                onClick={() => switchRoleQuickDemo('agency_user')}
                title="Agencia de Marketing: Gestiona espacios de clientes, vincula redes y revisa atribución"
              >
                Agencia
              </button>
            </div>

            {/* Botón Reset Demo */}
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar todos los datos demo iniciales?')) {
                  resetAllData();
                }
              }}
              className="btn btn-secondary btn-sm"
              title="Restaurar datos de prueba originales"
            >
              <RotateCcw size={14} />
            </button>

            {/* Cerrar Sesión */}
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm logout-btn"
              title="Cerrar Sesión e ir a pantalla de Login"
            >
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          </div>
        </div>

        <style>{`
          .navbar-wrapper {
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 0.75rem 1.5rem;
          }
          .navbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1750px;
            margin: 0 auto;
            gap: 1.25rem;
          }
          .brand-section {
            display: flex;
            align-items: center;
            gap: 0.85rem;
          }
          .brand-logo {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          }
          .brand-title {
            font-family: var(--font-heading, sans-serif);
            font-size: 1.2rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #ffffff;
            line-height: 1.1;
          }
          .brand-title span {
            color: #06b6d4;
          }
          .brand-subtitle {
            font-size: 0.72rem;
            color: #94a3b8;
          }
          .client-switcher-section {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.35rem 0.75rem;
            border-radius: 12px;
          }
          .client-switcher-label {
            font-size: 0.72rem;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
          }
          .client-select-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
          }
          .client-emoji-badge {
            font-size: 1.1rem;
          }
          .client-select {
            background: transparent;
            border: none;
            color: #ffffff;
            font-weight: 700;
            font-size: 0.88rem;
            cursor: pointer;
            padding-right: 1.5rem;
            appearance: none;
          }
          .client-select:focus {
            outline: none;
          }
          .client-select-arrow {
            position: absolute;
            right: 0;
            pointer-events: none;
            color: #94a3b8;
          }
          .nav-tabs {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(30, 41, 59, 0.4);
            padding: 0.3rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .tab-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.95rem;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 600;
            color: #94a3b8;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .tab-btn:hover {
            color: #f1f5f9;
            background: rgba(255, 255, 255, 0.05);
          }
          .tab-btn.active {
            color: #ffffff;
            background: #6366f1;
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
          }
          .controls-section {
            display: flex;
            align-items: center;
            gap: 0.65rem;
          }
          .report-btn {
            background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
            border: none;
            box-shadow: 0 2px 10px rgba(5, 150, 105, 0.3);
          }
          .role-switcher-box {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.25rem 0.45rem;
            border-radius: 8px;
          }
          .role-switcher-label {
            font-size: 0.65rem;
            font-weight: 800;
            color: #64748b;
          }
          .role-btn {
            padding: 0.25rem 0.6rem;
            font-size: 0.72rem;
            font-weight: 700;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            background: transparent;
            color: #94a3b8;
            transition: all 0.2s;
          }
          .role-btn:hover {
            color: #f1f5f9;
          }
          .role-btn.active {
            background: rgba(6, 182, 212, 0.2);
            color: #22d3ee;
            border: 1px solid rgba(6, 182, 212, 0.4);
          }
          .logout-btn {
            color: #fca5a5;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }
          .logout-btn:hover {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.4);
          }
        `}</style>
      </header>

      {/* Modal de Reporte */}
      {showReportModal && <ClientReportModal onClose={() => setShowReportModal(false)} />}
    </>
  );
};
