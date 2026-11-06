import React, { useState, useEffect } from 'react';
import { AttradProvider, useAttrad } from './context/AttradContext';
import { Navbar } from './components/layout/Navbar';
import { LoginView } from './components/auth/LoginView';
import { SuperAdminPanel } from './components/admin/SuperAdminPanel';
import { SubscriptionLockScreen } from './components/lock-screen/SubscriptionLockScreen';
import { ClientSpacesHub } from './components/clients/ClientSpacesHub';
import { MagicLinkPortal } from './components/magic-link/MagicLinkPortal';
import { AdHub } from './components/ad-hub/AdHub';
import { PipelineKanban } from './components/pipeline/PipelineKanban';
import { AgencyROIHub } from './components/agency/AgencyROIHub';

const AppContent: React.FC = () => {
  const { currentUser, userRole, activeTab, activeTenant } = useAttrad();
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);

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
        <Navbar onOpenMagicLink={(tok) => setMagicLinkToken(tok)} />
        <main className="main-content">
          <SubscriptionLockScreen />
        </main>
      </div>
    );
  }

  // 4. Vista principal del sistema
  return (
    <div className="app-layout">
      <Navbar onOpenMagicLink={(tok: string) => setMagicLinkToken(tok)} />
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
