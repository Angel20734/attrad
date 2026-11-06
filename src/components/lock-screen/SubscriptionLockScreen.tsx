import React from 'react';
import { useAttrad } from '../../context/AttradContext';
import { Lock, ShieldAlert, PhoneCall, Mail, ArrowRight } from 'lucide-react';

export const SubscriptionLockScreen: React.FC = () => {
  const { activeTenant, switchRoleQuickDemo } = useAttrad();

  return (
    <div className="lockscreen-overlay">
      <div className="lockscreen-card glass-panel animate-fade-in">
        <div className="lock-icon-badge">
          <Lock size={36} className="lock-icon" />
        </div>

        <div className="lock-badge-tag">
          <ShieldAlert size={14} />
          Acceso Suspendido Temporalmente
        </div>

        <h1 className="lock-title">Cuenta en Pausa Administrativa</h1>
        <p className="lock-company">{activeTenant?.name}</p>

        <p className="lock-description">
          El acceso al panel operativo ha sido suspendido debido al estado de la suscripción.
          <strong style={{ display: 'block', marginTop: '0.5rem', color: '#38bdf8' }}>
            🔒 Tus datos, métricas de anuncios, conversaciones de WhatsApp y clientes están completamente intactos y seguros.
          </strong>
        </p>

        <div className="support-box">
          <div className="support-title">Para reactivar tu servicio de inmediato:</div>
          <div className="support-items">
            <div className="support-item">
              <Mail size={16} className="support-icon" />
              <span>contacto@attrad.com (Atención Super Admin)</span>
            </div>
            <div className="support-item">
              <PhoneCall size={16} className="support-icon" />
              <span>Soporte Directo WhatsApp: +52 55 0000 1234</span>
            </div>
          </div>
        </div>

        <div className="lock-footer">
          <div className="dev-test-hint">
            <span>¿Estás testeando la plataforma?</span>
            <button
              onClick={() => {
                switchRoleQuickDemo('super_admin');
              }}
              className="btn btn-secondary btn-sm"
            >
              Ir al Panel Super Admin y Reactivar <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .lockscreen-overlay {
          min-height: calc(100vh - 75px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(circle at center, rgba(30, 27, 75, 0.4) 0%, rgba(9, 13, 22, 0.95) 100%);
        }
        .lockscreen-card {
          max-width: 620px;
          width: 100%;
          text-align: center;
          padding: 3rem 2.5rem;
          border: 1px solid rgba(239, 68, 68, 0.25);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.1);
        }
        .lock-icon-badge {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
          color: #f87171;
        }
        .lock-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
        }
        .lock-title {
          font-size: 1.85rem;
          margin-bottom: 0.25rem;
          color: #ffffff;
        }
        .lock-company {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--accent-cyan);
          margin-bottom: 1.25rem;
        }
        .lock-description {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .support-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          text-align: left;
          margin-bottom: 2rem;
        }
        .support-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.75rem;
        }
        .support-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .support-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .support-icon {
          color: var(--primary);
        }
        .dev-test-hint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.4);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-light);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
