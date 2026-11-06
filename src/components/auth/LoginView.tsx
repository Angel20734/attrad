import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import { Sparkles, Shield, Building2, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAttrad();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Credenciales inválidas.');
      }
      setIsLoading(false);
    }, 300);
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-ambient-glow glow-1" />
      <div className="login-ambient-glow glow-2" />

      <div className="login-card animate-fade-in">
        {/* Encabezado del Branding */}
        <div className="login-header">
          <div className="login-brand-logo">
            <Sparkles size={28} />
          </div>
          <h1 className="login-title">
            ATTRAD
          </h1>
          <p className="login-subtitle">
            Plataforma B2B de Atribución First-Touch para Anuncios
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="login-error-alert animate-fade-in">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="input-label">
              <Mail size={14} /> Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-correo@agencia.com"
              className="login-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">
              <Lock size={14} /> Contraseña Asignada
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="login-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              'Verificando acceso...'
            ) : (
              <>
                Ingresar al Sistema <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Accesos Rápidos Demo */}
        <div className="login-demo-section">
          <div className="demo-divider">
            <span>O ingresa en 1 clic con credenciales de prueba</span>
          </div>

          <div className="demo-buttons-grid">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@attrad.com', 'AdminMaster2026*')}
              className="demo-card-btn"
            >
              <div className="demo-icon admin-icon">
                <Shield size={16} />
              </div>
              <div className="demo-text">
                <strong>Super Admin (Tú)</strong>
                <span>admin@attrad.com</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('nexus@agencymedia.com', 'NexusMedia2026*')}
              className="demo-card-btn"
            >
              <div className="demo-icon agency-icon">
                <Building2 size={16} />
              </div>
              <div className="demo-text">
                <strong>Empresa de Marketing (Nexus)</strong>
                <span>nexus@agencymedia.com</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('martin@alphabrand.io', 'AlphaAgency2026#')}
              className="demo-card-btn suspended-demo"
            >
              <div className="demo-icon warning-icon">
                <Lock size={16} />
              </div>
              <div className="demo-text">
                <strong>Agencia Suspendida (Alpha)</strong>
                <span>martin@alphabrand.io (Probar Bloqueo)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080d1a;
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
        }
        .login-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          opacity: 0.35;
        }
        .glow-1 {
          width: 500px;
          height: 500px;
          background: #6366f1;
          top: -100px;
          left: -100px;
        }
        .glow-2 {
          width: 600px;
          height: 600px;
          background: #06b6d4;
          bottom: -150px;
          right: -150px;
        }
        .login-card {
          width: 100%;
          max-width: 480px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          position: relative;
          z-index: 10;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-brand-logo {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .login-title {
          font-family: var(--font-heading, sans-serif);
          font-size: 1.75rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 0.35rem;
        }
        .login-title span {
          color: #06b6d4;
        }
        .login-subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .login-error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .input-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .login-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 0.92rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .login-submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          border-radius: 10px;
        }
        .login-demo-section {
          margin-top: 2rem;
        }
        .demo-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin-bottom: 1.25rem;
        }
        .demo-divider::before,
        .demo-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .demo-divider span {
          padding: 0 0.75rem;
          font-size: 0.72rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .demo-buttons-grid {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .demo-card-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: rgba(30, 41, 59, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.65rem 0.85rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .demo-card-btn:hover {
          background: rgba(30, 41, 59, 0.85);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .demo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .admin-icon {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
        }
        .agency-icon {
          background: rgba(6, 182, 212, 0.2);
          color: #22d3ee;
        }
        .warning-icon {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }
        .demo-text {
          display: flex;
          flex-direction: column;
        }
        .demo-text strong {
          color: #f1f5f9;
          font-size: 0.82rem;
        }
        .demo-text span {
          color: #94a3b8;
          font-size: 0.72rem;
        }
      `}</style>
    </div>
  );
};
