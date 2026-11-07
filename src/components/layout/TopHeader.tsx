import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import {
  Menu,
  Search,
  Plus,
  ShieldCheck,
  FileText,
  ChevronDown,
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
  const {
    activeTab,
    activeClientSpace,
    activeClientSpaceId,
    setActiveClientSpaceId,
    clientSpaces,
    currentUser,
    userRole,
  } = useAttrad();

  const [searchQuery, setSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Token del cliente activo
  const activeClientToken =
    activeClientSpaceId === 'client-inmobiliaria-01'
      ? 'tok_valle_3c99a1'
      : activeClientSpaceId === 'client-dental-01'
      ? 'tok_sonrisas_8f14b2'
      : activeClientSpaceId === 'client-joyeria-01'
      ? 'tok_aura_7e52d9'
      : 'tok_sonrisas_8f14b2';

  const getPageTitle = () => {
    switch (activeTab) {
      case 'pipeline':
        return 'Deals';
      case 'roi':
        return 'Atribución & ROI';
      case 'ads':
        return 'Anuncios & Creativos';
      case 'clients':
        return 'Espacios de Clientes';
      case 'admin':
        return 'Super Admin';
      default:
        return 'Deals';
    }
  };

  return (
    <header className="pipedrive-top-header">
      {/* 1. Lado Izquierdo: Botón Menú Móvil + Título Principal */}
      <div className="header-left-zone">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden mobile-hamburger-btn"
          title="Abrir barra lateral"
        >
          <Menu size={20} />
        </button>

        <h1 className="header-page-title">{getPageTitle()}</h1>
      </div>

      {/* 2. Centro: Barra de Búsqueda Global Redondeada Estilo Pipedrive */}
      <div className="header-search-zone">
        <div className="search-bar-pill">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search Attrad (deals, clients, ads)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
        </div>

        {/* Botón Circular (+) para creación rápida */}
        <button
          onClick={() => {
            const event = new CustomEvent('attrad:open-quick-deal-modal');
            window.dispatchEvent(event);
          }}
          className="quick-add-circle-btn"
          title="Crear nuevo trato o registro rápido"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 3. Lado Derecho: Selector de Cliente + Perfil de Usuario */}
      <div className="header-profile-zone">
        {/* Selector de Cliente Activo */}
        {userRole === 'agency_user' && clientSpaces.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowClientDropdown(!showClientDropdown)}
              className="client-selector-pill"
              title="Cambiar cliente activo"
            >
              <span className="client-emoji">{activeClientSpace?.logoEmoji || '🏢'}</span>
              <span className="client-name-text">{activeClientSpace?.name || 'Cliente'}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showClientDropdown && (
              <div className="client-dropdown-menu">
                <div className="dropdown-label">CLIENTE ACTIVO</div>
                {clientSpaces.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => {
                      setActiveClientSpaceId(cs.id);
                      setShowClientDropdown(false);
                    }}
                    className={`dropdown-item ${cs.id === activeClientSpaceId ? 'selected' : ''}`}
                  >
                    <span>{cs.logoEmoji}</span>
                    <span className="flex-1 text-left">{cs.name}</span>
                    {cs.id === activeClientSpaceId && <span className="selected-dot" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Acceso Rápido Magic Link & Reporte */}
        {onOpenMagicLink && (
          <button
            onClick={() => onOpenMagicLink(activeClientToken)}
            className="magic-link-top-btn hidden sm:flex"
            title="Abrir enlace de recepción sin contraseñas"
          >
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Magic Link</span>
          </button>
        )}

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="magic-link-top-btn hidden md:flex"
            style={{ borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)' }}
            title="Generar reporte ejecutivo"
          >
            <FileText size={16} className="text-indigo-400" />
            <span>Reporte</span>
          </button>
        )}

        {/* Tarjeta de Perfil de Usuario (Estilo Phyllis Yang - Silicon Links Inc) */}
        <div className="user-profile-widget">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
            alt="User Avatar"
            className="user-avatar-img"
          />
          <div className="user-text-col hidden md:flex">
            <span className="user-display-name">
              {currentUser?.name?.split('(')[0]?.trim() || 'Phyllis Yang'}
            </span>
            <span className="user-company-name">
              {activeClientSpace?.name || 'Silicon Links Inc'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .pipedrive-top-header {
          height: 60px;
          background: #0f1422;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
          gap: 1rem;
          z-index: 30;
        }

        .header-left-zone {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-width: 140px;
        }

        .mobile-hamburger-btn {
          padding: 0.45rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }

        .header-page-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.02em;
          margin: 0;
        }

        /* Zona de Búsqueda Central */
        .header-search-zone {
          flex: 1;
          max-width: 540px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .search-bar-pill {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #192033;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 0.45rem 1rem;
          transition: all 0.2s ease;
        }

        .search-bar-pill:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          background: #1e263d;
        }

        .search-icon {
          color: #64748b;
        }

        .search-input-field {
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 0.85rem;
          width: 100%;
          outline: none;
        }

        .search-input-field::placeholder {
          color: #64748b;
        }

        .quick-add-circle-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }

        .quick-add-circle-btn:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
          transform: scale(1.05);
        }

        /* Lado Derecho */
        .header-profile-zone {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .client-selector-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #192033;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          padding: 0.35rem 0.85rem;
          color: #e2e8f0;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .client-selector-pill:hover {
          background: #232b45;
        }

        .client-name-text {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .client-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: #131929;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 0.5rem;
          min-width: 230px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          z-index: 100;
        }

        .dropdown-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #64748b;
          padding: 0.35rem 0.65rem;
          letter-spacing: 0.05em;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.5rem 0.65rem;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .dropdown-item.selected {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .selected-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3b82f6;
        }

        .magic-link-top-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .magic-link-top-btn:hover {
          background: rgba(16, 185, 129, 0.2);
        }

        .user-profile-widget {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding-left: 0.5rem;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
        }

        .user-avatar-img {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .user-text-col {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .user-display-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .user-company-name {
          font-size: 0.7rem;
          color: #94a3b8;
        }
      `}</style>
    </header>
  );
};
