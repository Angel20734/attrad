import React, { useState, useEffect } from 'react';
import { AttradProvider, useAttrad } from './context/AttradContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { LoginView } from './components/auth/LoginView';
import { SuperAdminPanel } from './components/admin/SuperAdminPanel';
import { SubscriptionLockScreen } from './components/lock-screen/SubscriptionLockScreen';
import { ClientSpacesHub } from './components/clients/ClientSpacesHub';
import { MagicLinkPortal } from './components/magic-link/MagicLinkPortal';
import { AdHub } from './components/ad-hub/AdHub';
import { PipelineKanban } from './components/pipeline/PipelineKanban';
import { AgencyROIHub } from './components/agency/AgencyROIHub';
import { ClientReportModal } from './components/reports/ClientReportModal';

const AppContent: React.FC = () => {
  const { currentUser, userRole, activeTab, activeTenant } = useAttrad();
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showGlobalReportModal, setShowGlobalReportModal] = useState(false);

  // Detección automática de token en la URL (ej: /?token=tok_sonrisas_8f14b2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setMagicLinkToken(token);
    }
  }, []);

  // 1. Acceso por Magic Link (Sin Login requerido para clientes finales)
  if (magicLinkToken) {
    return (
      <MagicLinkPortal
        secureToken={magicLinkToken}
        onExitPortal={() => {
          setMagicLinkToken(null);
          window.history.pushState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // 2. Si no hay sesión iniciada, mostrar Pantalla de Login
  if (!currentUser) {
    return <LoginView />;
  }

  // 3. Si es una Empresa de Marketing y su suscripción fue suspendida por el Super Admin
  if (userRole === 'agency_user' && activeTenant?.subscriptionStatus === 'suspended') {
    return (
      <div className="app-layout">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpenMagicLink={(tok) => setMagicLinkToken(tok)}
        />
        <div className="main-wrapper">
          <TopHeader
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenMagicLink={(tok) => setMagicLinkToken(tok)}
            onOpenReportModal={() => setShowGlobalReportModal(true)}
          />
          <main className="main-content">
            <SubscriptionLockScreen />
          </main>
        </div>
      </div>
    );
  }

  // 4. Vista principal del sistema con Barra Lateral Izquierda
  return (
    <div className="app-layout">
      {/* Barra Lateral Izquierda */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenMagicLink={(tok: string) => setMagicLinkToken(tok)}
      />

      {/* Área Principal de Contenido a la Derecha */}
      <div className="main-wrapper">
        <TopHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenMagicLink={(tok: string) => setMagicLinkToken(tok)}
          onOpenReportModal={() => setShowGlobalReportModal(true)}
        />

        <main className="main-content">
          {userRole === 'super_admin' && activeTab === 'admin' && <SuperAdminPanel />}
          {userRole === 'agency_user' && activeTab === 'roi' && (
            <AgencyROIHub
              currentAgencyId={currentUser.agencyId || 'org-nexus'}
              onOpenMagicLink={(tok: string) => setMagicLinkToken(tok)}
            />
          )}
          {userRole === 'agency_user' && activeTab === 'clients' && (
            <ClientSpacesHub onOpenMagicLink={(tok: string) => setMagicLinkToken(tok)} />
          )}
          {activeTab === 'ads' && <AdHub />}
          {activeTab === 'pipeline' && <PipelineKanban />}
        </main>
      </div>

      {/* Modal de Reporte Ejecutivo */}
      {showGlobalReportModal && (
        <ClientReportModal onClose={() => setShowGlobalReportModal(false)} />
      )}

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: #090d16;
          color: #f8fafc;
        }
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          transition: padding-left 0.3s ease;
        }
        @media (min-width: 1024px) {
          .main-wrapper {
            padding-left: 275px;
          }
        }
        .main-content {
          flex: 1;
          padding: 1.5rem;
          max-width: 1750px;
          width: 100%;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AttradProvider>
      <AppContent />
    </AttradProvider>
  );
};

export default App;
