import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import {
  Building2,
  UserPlus,
  ShieldAlert,
  Key,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  DollarSign,
} from 'lucide-react';
import { Tenant } from '../../types/tenant';

export const SuperAdminPanel: React.FC = () => {
  const {
    agencies,
    createAgency,
    toggleAgencySubscription,
    deleteAgency,
    setActiveClientSpaceId,
    clientSpaces,
    switchRoleQuickDemo,
    setActiveTab,
  } = useAttrad();

  const tenants = agencies;
  const createTenant = createAgency;
  const toggleTenantSubscription = toggleAgencySubscription;
  const deleteTenant = deleteAgency;

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState('');

  // Formulario de nueva empresa
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    subscriptionPlan: 'Plan Enterprise Growth',
    monthlyFee: 299,
    loginEmail: '',
    provisionalPassword: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.loginEmail || !formData.provisionalPassword) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    createTenant(formData);
    setShowCreateModal(false);
    setFormData({
      name: '',
      contactName: '',
      contactEmail: '',
      subscriptionPlan: 'Plan Enterprise Growth',
      monthlyFee: 299,
      loginEmail: '',
      provisionalPassword: '',
    });
  };

  const handleConfirmDelete = () => {
    if (!tenantToDelete) return;
    if (confirmNameInput.trim().toLowerCase() !== tenantToDelete.name.trim().toLowerCase()) {
      alert('El nombre no coincide exactamente. Operación cancelada por seguridad.');
      return;
    }
    deleteTenant(tenantToDelete.id);
    setTenantToDelete(null);
    setConfirmNameInput('');
  };

  const totalMonthlyMRR = tenants.reduce((acc, t) => acc + (t.subscriptionStatus === 'active' ? t.monthlyFee : 0), 0);
  const activeCount = tenants.filter((t) => t.subscriptionStatus === 'active').length;
  const suspendedCount = tenants.filter((t) => t.subscriptionStatus === 'suspended').length;

  return (
    <div className="admin-page-container animate-fade-in">
      {/* Encabezado y Estadísticas Globales */}
      <div className="admin-header-row">
        <div>
          <div className="admin-badge">
            <ShieldAlert size={14} />
            Módulo Exclusivo Super Administrador
          </div>
          <h1 className="admin-title">Gestión de Empresas & Suscripciones</h1>
          <p className="admin-subtitle">
            Administra a tus clientes B2B, asigna credenciales provisionales y controla el estado de servicio manualmente.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <UserPlus size={18} />
          Dar de Alta Nueva Empresa
        </button>
      </div>

      {/* Tarjetas de Métricas del Negocio SaaS */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-label">Empresas Registradas</span>
            <Building2 className="metric-icon" size={20} />
          </div>
          <div className="metric-value">{tenants.length}</div>
          <div className="metric-detail">Clientes en plataforma Attrad</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-label">Suscripciones Activas</span>
            <CheckCircle2 className="metric-icon text-success" size={20} />
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-detail">{suspendedCount} cuentas en suspensión</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-label">Facturación Mensual (MRR)</span>
            <DollarSign className="metric-icon text-cyan" size={20} />
          </div>
          <div className="metric-value text-cyan">${totalMonthlyMRR.toLocaleString()} USD</div>
          <div className="metric-detail">Cobros gestionados externamente</div>
        </div>
      </div>

      {/* Tabla de Empresas Clientes */}
      <div className="glass-panel table-panel">
        <div className="table-header-bar">
          <div className="table-title">Directorio de Cuentas B2B</div>
          <div className="text-dim text-sm">Mostrando {tenants.length} empresas</div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Empresa / Negocio</th>
                <th>Contacto & Acceso</th>
                <th>Plan Asignado</th>
                <th>Cuota</th>
                <th>Estado de Acceso</th>
                <th style={{ textAlign: 'right' }}>Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className={t.subscriptionStatus === 'suspended' ? 'row-suspended' : ''}>
                  <td>
                    <div className="tenant-name-box">
                      <div className="tenant-avatar">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="tenant-title">{t.name}</div>
                        <div className="tenant-sub">Alta: {new Date(t.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="credentials-preview">
                      <div className="contact-name">{t.contactName}</div>
                      <div className="credentials-pill">
                        <Key size={12} />
                        <span>{t.assignedCredentials.loginEmail}</span>
                        <span className="password-blur" title={`Contraseña: ${t.assignedCredentials.provisionalPassword}`}>
                          ••••••••
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-purple">{t.subscriptionPlan}</span>
                  </td>

                  <td>
                    <div className="fee-amount">${t.monthlyFee} /mes</div>
                  </td>

                  <td>
                    {t.subscriptionStatus === 'active' ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Activo
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <PauseCircle size={12} /> Suspendido (Bloqueado)
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell">
                      {/* Botón para entrar a ver el negocio como el cliente */}
                      <button
                        onClick={() => {
                          switchRoleQuickDemo('agency_user');
                          const firstClient = clientSpaces.find((c) => c.agencyId === t.id);
                          if (firstClient) {
                            setActiveClientSpaceId(firstClient.id);
                          }
                          setActiveTab('clients');
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Ver plataforma como esta empresa de marketing"
                      >
                        <Eye size={14} />
                        Inspeccionar
                      </button>

                      {/* Botón para Suspender / Reactivar */}
                      <button
                        onClick={() => toggleTenantSubscription(t.id)}
                        className={`btn btn-sm ${t.subscriptionStatus === 'active' ? 'btn-danger' : 'btn-success'}`}
                        title={t.subscriptionStatus === 'active' ? 'Suspender acceso a la empresa' : 'Reactivar acceso a la empresa'}
                      >
                        {t.subscriptionStatus === 'active' ? (
                          <>
                            <PauseCircle size={14} /> Pausar
                          </>
                        ) : (
                          <>
                            <PlayCircle size={14} /> Reactivar
                          </>
                        )}
                      </button>

                      {/* Botón de Eliminación con Filtro de Seguridad */}
                      <button
                        onClick={() => {
                          setTenantToDelete(t);
                          setConfirmNameInput('');
                        }}
                        className="btn btn-secondary btn-sm text-danger"
                        title="Eliminar empresa definitivamente (requiere confirmación)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Dar de alta nueva empresa */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <div className="modal-title-group">
                <Building2 className="text-primary" size={24} />
                <h2>Dar de Alta Nueva Empresa Cliente</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nombre de la Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Inmobiliaria Panorama"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre del Dueño / Director</label>
                  <input
                    type="text"
                    placeholder="Ej. Roberto Martínez"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Plan de Suscripción</label>
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  >
                    <option value="Plan Starter Growth">Plan Starter Growth ($99/mes)</option>
                    <option value="Plan Professional Pro">Plan Professional Pro ($199/mes)</option>
                    <option value="Plan Enterprise Growth">Plan Enterprise Growth ($299/mes)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cuota Mensual Acordada (USD)</label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="credentials-create-box">
                <div className="credentials-box-title">
                  <Key size={16} /> Credenciales de Acceso para el Cliente
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Correo Electrónico de Login *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@empresa.com"
                      value={formData.loginEmail}
                      onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contraseña Provisional *</label>
                    <input
                      type="text"
                      required
                      placeholder="ContraseñaProvisional2026!"
                      value={formData.provisionalPassword}
                      onChange={(e) => setFormData({ ...formData, provisionalPassword: e.target.value })}
                    />
                  </div>
                </div>
                <div className="text-dim text-xs">
                  * Tú como Super Admin le entregarás estas credenciales directamente a tu cliente tras el acuerdo comercial.
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear y Activar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmación estricta de eliminación de empresa */}
      {tenantToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade-in modal-danger">
            <div className="modal-header">
              <div className="modal-title-group text-danger">
                <AlertTriangle size={26} />
                <h2>Confirmación de Seguridad Crítica</h2>
              </div>
              <button onClick={() => setTenantToDelete(null)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Estás a punto de eliminar definitivamente la empresa:{' '}
                <strong style={{ color: '#ffffff' }}>{tenantToDelete.name}</strong>.
              </p>
              <p style={{ marginTop: '0.5rem', color: '#f87171', fontSize: '0.9rem' }}>
                ⚠️ Esta acción destruirá permanentemente sus registros de anuncios, leads y chats en la base de datos.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Escribe exactamente <span style={{ color: '#38bdf8' }}>"{tenantToDelete.name}"</span> para autorizar:
                </label>
                <input
                  type="text"
                  placeholder={tenantToDelete.name}
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setTenantToDelete(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={confirmNameInput.trim().toLowerCase() !== tenantToDelete.name.trim().toLowerCase()}
                className="btn btn-danger"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .admin-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.5rem;
        }
        .admin-title {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }
        .admin-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .metric-card {
          padding: 1.5rem;
        }
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .metric-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .metric-value {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }
        .metric-detail {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .text-success { color: #34d399 !important; }
        .text-cyan { color: var(--accent-cyan) !important; }
        .text-danger { color: #f87171 !important; }

        .table-panel {
          padding: 1.5rem;
        }
        .table-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .table-title {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }
        .admin-table th {
          padding: 0.85rem 1rem;
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .admin-table td {
          padding: 1.1rem 1rem;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }
        .row-suspended {
          background: rgba(239, 68, 68, 0.04);
        }
        .tenant-name-box {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .tenant-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
        }
        .tenant-title {
          font-weight: 700;
          color: #ffffff;
        }
        .tenant-sub {
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .credentials-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .password-blur {
          color: var(--accent-cyan);
          letter-spacing: 0.1em;
          cursor: help;
        }
        .fee-amount {
          font-weight: 700;
          color: var(--text-main);
        }
        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        /* Modales */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }
        .modal-content {
          max-width: 650px;
          width: 100%;
          background: #0f172a;
          border: 1px solid var(--border-light);
          padding: 2rem;
        }
        .modal-danger {
          max-width: 520px;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .close-btn:hover { color: #ffffff; }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
        }
        .credentials-create-box {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .credentials-box-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};
