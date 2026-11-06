import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
  X,
  Copy,
  Check,
  Building2,
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
    currentUser,
    logout,
    resetAllData,
    switchRoleQuickDemo,
  } = useAttrad();

  const [showReportModal, setShowReportModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Token de Magic Link del cliente activo
  const activeClientToken = activeClientSpaceId === 'client-inmobiliaria-01' 
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

  return (
    <>
      <header className="navbar-wrapper">
        <div className="navbar-container">
          
          {/* 1. Marca y Logotipo */}
          <div className="brand-section">
            <div className="brand-logo shadow-lg shadow-indigo-500/20">
              <Sparkles className="brand-icon" size={20} />
            </div>
            <div>
              <div className="brand-title">ATTRAD</div>
              <div className="brand-subtitle hidden sm:block">First-Touch Ad Intelligence</div>
            </div>
          </div>

          {/* 2. Selector de Espacio de Cliente Activo */}
          {userRole === 'agency_user' && clientSpaces.length > 0 && (
            <div className="client-switcher-section">
              <span className="client-switcher-label">Cliente:</span>
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

          {/* 3. Navegación por Pestañas (Desktop) */}
          <nav className="nav-tabs hidden lg:flex">
            {userRole === 'super_admin' ? (
              <button
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldAlert size={16} />
                <span>Panel Super Admin</span>
              </button>
            ) : (
              <>
                <button
                  className={`tab-btn ${activeTab === 'roi' ? 'active' : ''}`}
                  onClick={() => setActiveTab('roi')}
                  title="Análisis cruzado de inversión vs retorno real"
                >
                  <TrendingUp size={16} />
                  <span>Atribución & ROI</span>
                </button>

                <button
                  className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clients')}
                >
                  <Layers size={16} />
                  <span>Mis Clientes ({clientSpaces.length})</span>
                </button>

                <button
                  className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ads')}
                >
                  <LayoutGrid size={16} />
                  <span>Hub de Anuncios</span>
                </button>

                <button
                  className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pipeline')}
                >
                  <Kanban size={16} />
                  <span>Pipeline Comercial</span>
                </button>
              </>
            )}
          </nav>

          {/* 4. Controles y Acciones Rápidas */}
          <div className="controls-section">
            
            {/* Botón Magic Link del Cliente */}
            {userRole === 'agency_user' && onOpenMagicLink && (
              <button
                onClick={() => onOpenMagicLink(activeClientToken)}
                className="btn btn-secondary btn-sm magic-link-btn hidden md:flex items-center gap-1.5"
                title={`Abrir portal de recepción para ${activeClientSpace?.name || 'Cliente'}`}
              >
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Portal Magic Link</span>
              </button>
            )}

            {/* Botón Reporte Ejecutivo */}
            {userRole === 'agency_user' && activeClientSpace && (
              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-primary btn-sm report-btn hidden sm:flex items-center gap-1.5"
                title="Generar reporte ejecutivo imprimible para el cliente"
              >
                <FileText size={15} />
                <span>Reporte Ejecutivo</span>
              </button>
            )}

            {/* Enlace Landing Demo de Anuncio */}
            <a
              href="/test-landing.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm hidden xl:flex items-center gap-1 text-slate-300"
              title="Abrir landing de prueba con tracking de anuncios y WhatsApp"
            >
              <ExternalLink size={14} className="text-indigo-400" />
              <span>Simular Anuncio</span>
            </a>

            {/* 5. Menú de Usuario / Perfil Profesional */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="user-profile-pill"
                title="Opciones de cuenta y cambio de vista"
              >
                <div className="user-avatar-badge">
                  {userRole === 'super_admin' ? 'SA' : 'AG'}
                  <span className="online-indicator" />
                </div>
                <div className="user-info-text hidden md:block">
                  <div className="user-name-label">
                    {userRole === 'super_admin' ? 'Super Admin' : currentUser?.name?.split('(')[0] || 'Agencia'}
                  </div>
                  <div className="user-role-label">
                    {userRole === 'super_admin' ? 'Dueño de Plataforma' : 'Empresa de Marketing'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </button>

              {/* Dropdown de Usuario / Configuración */}
              {showUserDropdown && (
                <div className="user-dropdown-menu animate-fade-in">
                  <div className="dropdown-header">
                    <div className="font-bold text-white text-xs">{currentUser?.name || 'Usuario'}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-section-title">Cambiar Vista de Prueba</div>
                  
                  <button
                    onClick={() => {
                      switchRoleQuickDemo('agency_user');
                      setShowUserDropdown(false);
                    }}
                    className={`dropdown-item ${userRole === 'agency_user' ? 'active-item' : ''}`}
                  >
                    <Building2 size={15} className="text-indigo-400" />
                    <div className="text-left">
                      <div className="font-semibold text-xs">Empresa de Marketing (Nexus)</div>
                      <div className="text-[10px] text-slate-400">Ver clientes, anuncios y atribución</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      switchRoleQuickDemo('super_admin');
                      setShowUserDropdown(false);
                    }}
                    className={`dropdown-item ${userRole === 'super_admin' ? 'active-item' : ''}`}
                  >
                    <ShieldAlert size={15} className="text-amber-400" />
                    <div className="text-left">
                      <div className="font-semibold text-xs">Super Admin (Dueño)</div>
                      <div className="text-[10px] text-slate-400">Gestionar agencias y MRR</div>
                    </div>
                  </button>

                  <div className="dropdown-divider" />

                  {/* Acciones de Demo */}
                  <button
                    onClick={() => {
                      handleCopyMagicLink();
                      setShowUserDropdown(false);
                    }}
                    className="dropdown-item"
                  >
                    {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} className="text-slate-400" />}
                    <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Magic Link Activo'}</span>
                  </button>

                  <a
                    href="/test-landing.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dropdown-item"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <ExternalLink size={15} className="text-indigo-400" />
                    <span>Abrir Landing de Prueba</span>
                  </a>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas restaurar todos los datos demo iniciales?')) {
                        resetAllData();
                        setShowUserDropdown(false);
                      }
                    }}
                    className="dropdown-item"
                  >
                    <RotateCcw size={15} className="text-slate-400" />
                    <span>Restaurar Datos Iniciales</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="dropdown-item text-rose-400 hover:text-rose-300"
                  >
                    <LogOut size={15} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>

            {/* Botón Menú Móvil */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="btn btn-secondary btn-sm lg:hidden p-2"
              title="Menú de Navegación"
            >
              {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* 6. Menú Desplegable Móvil */}
        {showMobileMenu && (
          <div className="mobile-nav-drawer lg:hidden animate-fade-in">
            <div className="space-y-1.5 p-3">
              {userRole === 'super_admin' ? (
                <button
                  className={`mobile-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('admin');
                    setShowMobileMenu(false);
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>Panel Super Admin</span>
                </button>
              ) : (
                <>
                  <button
                    className={`mobile-tab-btn ${activeTab === 'roi' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('roi');
                      setShowMobileMenu(false);
                    }}
                  >
                    <TrendingUp size={16} />
                    <span>Atribución & ROI</span>
                  </button>

                  <button
                    className={`mobile-tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('clients');
                      setShowMobileMenu(false);
                    }}
                  >
                    <Layers size={16} />
                    <span>Mis Clientes ({clientSpaces.length})</span>
                  </button>

                  <button
                    className={`mobile-tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('ads');
                      setShowMobileMenu(false);
                    }}
                  >
                    <LayoutGrid size={16} />
                    <span>Hub de Anuncios</span>
                  </button>

                  <button
                    className={`mobile-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('pipeline');
                      setShowMobileMenu(false);
                    }}
                  >
                    <Kanban size={16} />
                    <span>Pipeline Comercial</span>
                  </button>
                </>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-2">
                {userRole === 'agency_user' && onOpenMagicLink && (
                  <button
                    onClick={() => {
                      onOpenMagicLink(activeClientToken);
                      setShowMobileMenu(false);
                    }}
                    className="w-full btn btn-secondary btn-sm flex items-center justify-center gap-2 py-2"
                  >
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Abrir Magic Link de Recepción</span>
                  </button>
                )}

                {userRole === 'agency_user' && (
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2 py-2"
                  >
                    <FileText size={16} />
                    <span>Generar Reporte para Cliente</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Reporte */}
        {showReportModal && (
          <ClientReportModal
            onClose={() => setShowReportModal(false)}
          />
        )}

        <style>{`
          .navbar-wrapper {
            background: rgba(11, 15, 25, 0.94);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 0.65rem 1.25rem;
          }
          .navbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1750px;
            margin: 0 auto;
            gap: 1rem;
          }
          .brand-section {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
          }
          .brand-logo {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .brand-title {
            font-size: 1.15rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #ffffff;
            line-height: 1.1;
          }
          .brand-subtitle {
            font-size: 0.68rem;
            color: #94a3b8;
            font-weight: 500;
          }

          /* Selector de Cliente */
          .client-switcher-section {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 0.25rem 0.5rem 0.25rem 0.75rem;
          }
          .client-switcher-label {
            font-size: 0.7rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
          }
          .client-select-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }
          .client-emoji-badge {
            font-size: 0.9rem;
          }
          .client-select {
            appearance: none;
            background: transparent;
            border: none;
            color: #f1f5f9;
            font-size: 0.8rem;
            font-weight: 600;
            padding-right: 1.25rem;
            cursor: pointer;
            outline: none;
          }
          .client-select option {
            background-color: #0f172a;
            color: #ffffff;
          }
          .client-select-arrow {
            position: absolute;
            right: 0;
            pointer-events: none;
            color: #94a3b8;
          }

          /* Navegación por Pestañas */
          .nav-tabs {
            align-items: center;
            gap: 0.35rem;
            background: rgba(15, 23, 42, 0.5);
            padding: 0.25rem;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .tab-btn {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.45rem 0.85rem;
            font-size: 0.8rem;
            font-weight: 600;
            color: #94a3b8;
            border-radius: 10px;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .tab-btn:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
          }
          .tab-btn.active {
            color: #ffffff;
            background: #4f46e5;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
          }

          /* Controles y Perfil */
          .controls-section {
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }
          .magic-link-btn {
            border-color: rgba(16, 185, 129, 0.3) !important;
            color: #a7f3d0 !important;
          }
          .magic-link-btn:hover {
            background: rgba(16, 185, 129, 0.1) !important;
          }
          
          .user-profile-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.25rem 0.65rem 0.25rem 0.35rem;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .user-profile-pill:hover {
            border-color: rgba(255, 255, 255, 0.18);
            background: rgba(30, 41, 59, 0.8);
          }
          .user-avatar-badge {
            width: 30px;
            height: 30px;
            border-radius: 10px;
            background: linear-gradient(135deg, #3730a3, #4338ca);
            color: #c7d2fe;
            font-weight: 800;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
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
          .user-info-text {
            text-align: left;
            line-height: 1.15;
          }
          .user-name-label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #ffffff;
          }
          .user-role-label {
            font-size: 0.65rem;
            color: #94a3b8;
          }

          /* Dropdown Menu */
          .user-dropdown-menu {
            position: absolute;
            top: calc(100% + 0.6rem);
            right: 0;
            width: 250px;
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 18px;
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
            padding: 0.6rem;
            z-index: 150;
            backdrop-filter: blur(20px);
          }
          .dropdown-header {
            padding: 0.5rem 0.6rem 0.4rem;
          }
          .dropdown-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin: 0.4rem 0;
          }
          .dropdown-section-title {
            font-size: 0.65rem;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            padding: 0.25rem 0.6rem;
          }
          .dropdown-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.5rem 0.65rem;
            border-radius: 10px;
            border: none;
            background: transparent;
            color: #e2e8f0;
            font-size: 0.78rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
          }
          .dropdown-item:hover {
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
          }
          .dropdown-item.active-item {
            background: rgba(79, 70, 229, 0.15);
            color: #a5b4fc;
          }

          /* Mobile Drawer */
          .mobile-nav-drawer {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(15, 23, 42, 0.98);
            backdrop-filter: blur(20px);
          }
          .mobile-tab-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.65rem 0.85rem;
            font-size: 0.85rem;
            font-weight: 600;
            color: #94a3b8;
            border-radius: 10px;
            border: none;
            background: transparent;
            cursor: pointer;
            text-align: left;
          }
          .mobile-tab-btn.active {
            background: #4f46e5;
            color: #ffffff;
          }
        `}</style>
      </header>
    </>
  );
};
