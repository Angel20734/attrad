import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import { 
  Sparkles, 
  Shield, 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAttrad();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (targetEmail: string, targetPass: string) => {
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(targetEmail, targetPass);
      if (!res.success) {
        setErrorMsg(res.error || 'Credenciales inválidas.');
      }
      setIsLoading(false);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    performLogin(demoEmail, demoPass);
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
          <h1 className="login-title">ATTRAD</h1>
          <p className="login-subtitle">
            Plataforma B2B de Atribución First-Touch para Anuncios
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <CheckCircle2 size={12} /> Entorno de Demostración Público Activo
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="login-error-alert animate-fade-in">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Accesos Rápidos Demo (1 Clic) */}
        <div className="login-demo-section mb-5">
          <div className="demo-divider">
            <span>Ingresa en 1 clic para probar el sistema</span>
          </div>

          <div className="demo-buttons-grid">
            <button
              type="button"
              onClick={() => handleQuickLogin('nexus@agencymedia.com', 'NexusMedia2026*')}
              className="demo-card-btn highlight-demo"
            >
              <div className="demo-icon agency-icon">
                <Building2 size={16} />
              </div>
              <div className="demo-text">
                <strong>Empresa de Marketing (Nexus)</strong>
                <span>nexus@agencymedia.com • 1 Clic</span>
              </div>
              <ArrowRight size={14} className="demo-arrow" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@attrad.com', 'AdminMaster2026*')}
              className="demo-card-btn"
            >
              <div className="demo-icon admin-icon">
                <Shield size={16} />
              </div>
              <div className="demo-text">
                <strong>Super Admin (Dueño)</strong>
                <span>admin@attrad.com • 1 Clic</span>
              </div>
              <ArrowRight size={14} className="demo-arrow" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('martin@alphabrand.io', 'AlphaAgency2026#')}
              className="demo-card-btn suspended-demo"
            >
              <div className="demo-icon warning-icon">
                <Lock size={16} />
              </div>
              <div className="demo-text">
                <strong>Agencia Suspendida (Alpha)</strong>
                <span>martin@alphabrand.io (Probar Bloqueo)</span>
              </div>
              <ArrowRight size={14} className="demo-arrow" />
            </button>
          </div>
        </div>

        {/* Formulario Manual */}
        <div className="demo-divider mb-4">
          <span>O escribe tus credenciales asignadas</span>
        </div>

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

        {/* Enlaces de Demostración Directa sin Login */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            Pruebas Externas Directas
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="/?token=tok_sonrisas_8f14b2"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                Magic Link Cliente
              </span>
              <ExternalLink size={12} className="text-slate-500 shrink-0" />
            </a>

            <a
              href="/test-landing.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Sparkles size={14} className="text-indigo-400 shrink-0" />
                Simular Anuncio
              </span>
              <ExternalLink size={12} className="text-slate-500 shrink-0" />
            </a>
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
          max-width: 500px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.25rem 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          position: relative;
          z-index: 10;
        }
        .login-header {
          text-align: center;
          margin-bottom: 1.5rem;
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
          margin: 0 auto 0.75rem;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .login-title {
          font-family: var(--font-heading, sans-serif);
          font-size: 1.85rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 0.25rem;
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
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .input-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #cbd5e1;
        }
        .login-input {
          background: rgba(2, 6, 23, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 0.7rem 1rem;
          font-size: 0.875rem;
          color: #ffffff;
          transition: all 0.2s ease;
        }
        .login-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
          background: rgba(2, 6, 23, 0.85);
        }
        .login-submit-btn {
          width: 100%;
          padding: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 12px;
          margin-top: 0.25rem;
        }
        .login-demo-section {
          margin-top: 1rem;
        }
        .demo-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin-bottom: 0.75rem;
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
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .demo-buttons-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .demo-card-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }
        .demo-card-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .demo-card-btn.highlight-demo {
          border-color: rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.08);
        }
        .demo-card-btn.highlight-demo:hover {
          background: rgba(99, 102, 241, 0.16);
        }
        .demo-arrow {
          margin-left: auto;
          color: #64748b;
          transition: transform 0.2s;
        }
        .demo-card-btn:hover .demo-arrow {
          transform: translateX(3px);
          color: #ffffff;
        }
        .demo-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
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
          font-size: 0.8rem;
          font-weight: 600;
        }
        .demo-text span {
          color: #64748b;
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
};
