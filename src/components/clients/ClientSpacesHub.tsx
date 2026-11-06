import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import { ClientSpace, ClientCategory } from '../../types/tenant';
import {
  Building2,
  Plus,
  Share2,
  Kanban,
  LayoutGrid,
  CheckCircle2,
  X,
  DollarSign,
  Users,
  Award,
  Settings2,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface ClientSpacesHubProps {
  onOpenMagicLink?: (token: string) => void;
}

export const ClientSpacesHub: React.FC<ClientSpacesHubProps> = ({ onOpenMagicLink }) => {
  const {
    clientSpaces,
    activeClientSpaceId,
    setActiveClientSpaceId,
    setActiveTab,
    createClientSpace,
    updateConnectedNetworks,
    currentUser,
  } = useAttrad();

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClientNetworks, setEditingClientNetworks] = useState<ClientSpace | null>(null);
  const [showSdkModal, setShowSdkModal] = useState<ClientSpace | null>(null);
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Formulario nuevo cliente
  const [formData, setFormData] = useState({
    name: '',
    category: 'inmobiliaria' as ClientCategory,
    contactName: '',
    contactEmail: '',
    metaConnected: true,
    metaAccountName: 'Act_89412 - Meta Ads',
    googleConnected: true,
    googleAccountName: 'AW-91823 - Google Search',
    tiktokConnected: false,
    tiktokAccountName: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Por favor ingresa el nombre de la empresa del cliente.');
      return;
    }
    createClientSpace(formData);
    setShowCreateModal(false);
    setFormData({
      name: '',
      category: 'inmobiliaria',
      contactName: '',
      contactEmail: '',
      metaConnected: true,
      metaAccountName: '',
      googleConnected: true,
      googleAccountName: '',
      tiktokConnected: false,
      tiktokAccountName: '',
    });
  };

  const handleSelectAndOpen = (clientId: string, targetTab: 'ads' | 'pipeline') => {
    setActiveClientSpaceId(clientId);
    setActiveTab(targetTab);
  };

  // Métricas agregadas de todos los clientes de la agencia
  const totalSpend = clientSpaces.reduce((acc, c) => acc + c.monthlyAdSpend, 0);
  const totalLeads = clientSpaces.reduce((acc, c) => acc + c.monthlyLeads, 0);
  const totalRevenue = clientSpaces.reduce((acc, c) => acc + c.revenueGenerated, 0);
  const totalContracts = clientSpaces.reduce((acc, c) => acc + c.contractsClosed, 0);

  return (
    <div className="client-hub-container animate-fade-in">
      {/* Encabezado Principal */}
      <div className="hub-header-row">
        <div>
          <div className="hub-badge">
            <Building2 size={14} />
            Portafolio Multicliente — {currentUser?.name?.split('(')[0] || 'Empresa de Marketing'}
          </div>
          <h1 className="hub-title">Espacios de Clientes</h1>
          <p className="hub-subtitle">
            Gestiona cada cliente de forma aislada, supervisa sus cuentas publicitarias conectadas y rastrea qué anuncios generan sus ventas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Crear Nuevo Espacio de Cliente
        </button>
      </div>

      {/* Barra de Estadísticas Agregadas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-clients">
            <Building2 size={22} />
          </div>
          <div>
            <div className="stat-label">Clientes Activos</div>
            <div className="stat-value">{clientSpaces.length}</div>
            <div className="stat-subtext">Espacios con cuentas vinculadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-spend">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="stat-label">Inversión Publicitaria Total</div>
            <div className="stat-value">${totalSpend.toLocaleString()} USD</div>
            <div className="stat-subtext">Presupuesto activo este mes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-leads">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-label">Leads Totales Capturados</div>
            <div className="stat-value">{totalLeads}</div>
            <div className="stat-subtext">Con atribución First-Touch</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-revenue">
            <Award size={22} />
          </div>
          <div>
            <div className="stat-label">Ventas Cerradas por Anuncios</div>
            <div className="stat-value">${totalRevenue.toLocaleString()} USD</div>
            <div className="stat-subtext">{totalContracts} contratos cerrados</div>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Clientes */}
      <div className="clients-grid">
        {clientSpaces.map((client) => {
          const isSelected = client.id === activeClientSpaceId;
          const roas = client.monthlyAdSpend > 0 ? (client.revenueGenerated / client.monthlyAdSpend).toFixed(1) : '0.0';

          return (
            <div
              key={client.id}
              className={`client-card ${isSelected ? 'selected-border' : ''}`}
            >
              {isSelected && (
                <div className="active-tag-banner">
                  <CheckCircle2 size={12} /> Cliente Actualmente Activo
                </div>
              )}

              {/* Cabecera de la Tarjeta */}
              <div className="client-card-header">
                <div className="client-avatar-emoji">{client.logoEmoji}</div>
                <div className="client-card-info">
                  <h3 className="client-name">{client.name}</h3>
                  <div className="client-category-tag">{client.categoryLabel}</div>
                </div>
              </div>

              {/* Cuentas de Redes Publicitarias Conectadas */}
              <div className="networks-box">
                <div className="networks-title">
                  <Share2 size={13} />
                  <span>Cuentas Publicitarias Vinculadas:</span>
                </div>
                <div className="networks-badges-list">
                  {/* Meta Ads */}
                  <div className={`network-badge ${client.connectedNetworks.metaAds ? 'connected' : 'disconnected'}`}>
                    <span className="dot" />
                    <strong>Meta Ads</strong>
                    <span className="acc-name">
                      {client.connectedNetworks.metaAds
                        ? client.networkAccounts.metaAccountName || 'Cuenta Activa'
                        : 'No Vinculada'}
                    </span>
                  </div>

                  {/* Google Ads */}
                  <div className={`network-badge ${client.connectedNetworks.googleAds ? 'connected' : 'disconnected'}`}>
                    <span className="dot" />
                    <strong>Google Ads</strong>
                    <span className="acc-name">
                      {client.connectedNetworks.googleAds
                        ? client.networkAccounts.googleAccountName || 'Cuenta Activa'
                        : 'No Vinculada'}
                    </span>
                  </div>

                  {/* TikTok Ads */}
                  <div className={`network-badge ${client.connectedNetworks.tiktokAds ? 'connected' : 'disconnected'}`}>
                    <span className="dot" />
                    <strong>TikTok Ads</strong>
                    <span className="acc-name">
                      {client.connectedNetworks.tiktokAds
                        ? client.networkAccounts.tiktokAccountName || 'Cuenta Activa'
                        : 'No Vinculada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas de Rendimiento y Atribución */}
              <div className="client-metrics-summary">
                <div className="metric-box">
                  <span className="m-label">Inversión Ads</span>
                  <span className="m-val">${client.monthlyAdSpend.toLocaleString()}</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">Leads</span>
                  <span className="m-val font-accent">{client.monthlyLeads}</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">Ventas ($)</span>
                  <span className="m-val font-success">${client.revenueGenerated.toLocaleString()}</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">ROAS</span>
                  <span className="m-val font-roas">{roas}x</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="client-card-actions">
                <button
                  onClick={() => handleSelectAndOpen(client.id, 'ads')}
                  className="btn btn-primary btn-sm flex-1"
                >
                  <LayoutGrid size={15} />
                  Anuncios & ROI
                </button>
                <button
                  onClick={() => handleSelectAndOpen(client.id, 'pipeline')}
                  className="btn btn-secondary btn-sm"
                  title="Ver pipeline de ventas de este cliente"
                >
                  <Kanban size={15} />
                  Pipeline
                </button>
                <button
                  onClick={() => {
                    const token = client.id === 'client-01' ? 'tok_sonrisas_8f14b2' : client.id === 'client-02' ? 'tok_valle_3c99a1' : `tok_${client.id}`;
                    onOpenMagicLink?.(token);
                  }}
                  className="btn btn-secondary btn-sm"
                  title="Abrir Magic Link de recepción sin contraseñas"
                  style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ShieldCheck size={14} style={{ color: '#818cf8' }} />
                  Magic Link
                </button>
                <button
                  onClick={() => setShowSdkModal(client)}
                  className="btn btn-icon btn-secondary btn-sm"
                  title="Ver código de instalación SDK para la landing"
                >
                  <Code2 size={15} style={{ color: '#38bdf8' }} />
                </button>
                <button
                  onClick={() => setEditingClientNetworks(client)}
                  className="btn btn-icon btn-secondary btn-sm"
                  title="Configurar cuentas de redes publicitarias"
                >
                  <Settings2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAR NUEVO ESPACIO DE CLIENTE */}
      {showCreateModal && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-window max-w-650">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Crear Nuevo Espacio de Cliente</h2>
                <p className="modal-subtitle">
                  Configura a tu cliente y vincula las cuentas de redes publicitarias donde corren sus anuncios.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-icon btn-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">Nombre del Cliente / Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Inmobiliaria Prime o Dr. Roberto Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Giro / Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ClientCategory })}
                    className="form-input"
                  >
                    <option value="inmobiliaria">🏢 Bienes Raíces & Preventas</option>
                    <option value="salud_dental">🦷 Salud & Odontología</option>
                    <option value="ecommerce">🛍️ E-commerce & Tienda Online</option>
                    <option value="servicios">💼 Servicios Profesionales / B2B</option>
                    <option value="otro">⭐ Negocio Independiente</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">Nombre de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. Roberto Fontana"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">Correo de Notificaciones</label>
                  <input
                    type="email"
                    placeholder="cliente@empresa.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Sección Vinculación de Redes */}
              <div className="networks-connection-setup">
                <h4 className="setup-title">
                  <Share2 size={16} /> Vincular Cuentas Publicitarias para este Cliente
                </h4>
                <p className="setup-subtitle">
                  Activa las plataformas donde este cliente tiene anuncios en circulación:
                </p>

                {/* Meta Ads */}
                <div className="network-connect-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.metaConnected}
                      onChange={(e) => setFormData({ ...formData, metaConnected: e.target.checked })}
                    />
                    <span>Meta Ads (Facebook & Instagram)</span>
                  </label>
                  {formData.metaConnected && (
                    <input
                      type="text"
                      placeholder="Nombre o ID de cuenta (ej. Act_89412 - Prime Real Estate)"
                      value={formData.metaAccountName}
                      onChange={(e) => setFormData({ ...formData, metaAccountName: e.target.value })}
                      className="form-input network-acc-input"
                    />
                  )}
                </div>

                {/* Google Ads */}
                <div className="network-connect-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.googleConnected}
                      onChange={(e) => setFormData({ ...formData, googleConnected: e.target.checked })}
                    />
                    <span>Google Ads (Search, YouTube, PMax)</span>
                  </label>
                  {formData.googleConnected && (
                    <input
                      type="text"
                      placeholder="Nombre o ID de cuenta (ej. AW-918230192)"
                      value={formData.googleAccountName}
                      onChange={(e) => setFormData({ ...formData, googleAccountName: e.target.value })}
                      className="form-input network-acc-input"
                    />
                  )}
                </div>

                {/* TikTok Ads */}
                <div className="network-connect-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.tiktokConnected}
                      onChange={(e) => setFormData({ ...formData, tiktokConnected: e.target.checked })}
                    />
                    <span>TikTok Ads Manager</span>
                  </label>
                  {formData.tiktokConnected && (
                    <input
                      type="text"
                      placeholder="Nombre o ID de anunciante (ej. TT_Adv_44921)"
                      value={formData.tiktokAccountName}
                      onChange={(e) => setFormData({ ...formData, tiktokAccountName: e.target.value })}
                      className="form-input network-acc-input"
                    />
                  )}
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
                  <Plus size={16} /> Crear Espacio de Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR REDES CONECTADAS */}
      {editingClientNetworks && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-window max-w-550">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Redes Publicitarias: {editingClientNetworks.name}</h2>
                <p className="modal-subtitle">
                  Administra las cuentas de redes sociales vinculadas a este espacio.
                </p>
              </div>
              <button
                onClick={() => setEditingClientNetworks(null)}
                className="btn btn-icon btn-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-form">
              <div className="networks-connection-setup">
                {/* Meta */}
                <div className="network-connect-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingClientNetworks.connectedNetworks.metaAds}
                      onChange={(e) =>
                        setEditingClientNetworks({
                          ...editingClientNetworks,
                          connectedNetworks: {
                            ...editingClientNetworks.connectedNetworks,
                            metaAds: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Meta Ads (Facebook & Instagram)</span>
                  </label>
                  {editingClientNetworks.connectedNetworks.metaAds && (
                    <input
                      type="text"
                      value={editingClientNetworks.networkAccounts.metaAccountName || ''}
                      onChange={(e) =>
                        setEditingClientNetworks({
                          ...editingClientNetworks,
                          networkAccounts: {
                            ...editingClientNetworks.networkAccounts,
                            metaAccountName: e.target.value,
                          },
                        })
                      }
                      className="form-input network-acc-input"
                      placeholder="Nombre o ID de cuenta publicitaria"
                    />
                  )}
                </div>

                {/* Google */}
                <div className="network-connect-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingClientNetworks.connectedNetworks.googleAds}
                      onChange={(e) =>
                        setEditingClientNetworks({
                          ...editingClientNetworks,
                          connectedNetworks: {
                            ...editingClientNetworks.connectedNetworks,
                            googleAds: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Google Ads</span>
                  </label>
                  {editingClientNetworks.connectedNetworks.googleAds && (
                    <input
                      type="text"
                      value={editingClientNetworks.networkAccounts.googleAccountName || ''}
                      onChange={(e) =>
                        setEditingClientNetworks({
                          ...editingClientNetworks,
                          networkAccounts: {
                            ...editingClientNetworks.networkAccounts,
                            googleAccountName: e.target.value,
                          },
                        })
                      }
                      className="form-input network-acc-input"
                      placeholder="Nombre o ID de cuenta Google Ads"
                    />
                  )}
                </div>

                {/* TikTok */}
                <div className="network-connect-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingClientNetworks.connectedNetworks.tiktokAds}
                      onChange={(e) =>
                        setEditingClientNetworks({
                          ...editingClientNetworks,
                          connectedNetworks: {
                            ...editingClientNetworks.connectedNetworks,
                            tiktokAds: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>TikTok Ads Manager</span>
                  </label>
                  {editingClientNetworks.connectedNetworks.tiktokAds && (
                    <input
                      type="text"
                      value={editingClientNetworks.networkAccounts.tiktokAccountName || ''}
                      onChange={(e) =>
                        setEditingClientNetworks({
                          ...editingClientNetworks,
                          networkAccounts: {
                            ...editingClientNetworks.networkAccounts,
                            tiktokAccountName: e.target.value,
                          },
                        })
                      }
                      className="form-input network-acc-input"
                      placeholder="Nombre o ID de anunciante TikTok"
                    />
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingClientNetworks(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateConnectedNetworks(
                      editingClientNetworks.id,
                      editingClientNetworks.connectedNetworks,
                      editingClientNetworks.networkAccounts
                    );
                    setEditingClientNetworks(null);
                  }}
                  className="btn btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CÓDIGO SDK DE CAPTURA */}
      {showSdkModal && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-window max-w-550">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Código SDK de Atribución (3 KB)</h2>
                <p className="modal-subtitle">
                  {showSdkModal.name} • Instalación para Webflow, WordPress, Elementor o Shopify
                </p>
              </div>
              <button
                onClick={() => setShowSdkModal(null)}
                className="btn btn-icon btn-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                  Magic Link de Recepción (para enviar por WhatsApp a la clínica):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?token=${showSdkModal.id === 'client-01' ? 'tok_sonrisas_8f14b2' : showSdkModal.id === 'client-02' ? 'tok_valle_3c99a1' : `tok_${showSdkModal.id}`}`}
                    className="form-input font-mono"
                    style={{ fontSize: '0.78rem', color: '#a5b4fc', flex: 1 }}
                  />
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/?token=${showSdkModal.id === 'client-01' ? 'tok_sonrisas_8f14b2' : showSdkModal.id === 'client-02' ? 'tok_valle_3c99a1' : `tok_${showSdkModal.id}`}`;
                      navigator.clipboard.writeText(link);
                      setCopiedLink(showSdkModal.id);
                      setTimeout(() => setCopiedLink(null), 2500);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    {copiedLink === showSdkModal.id ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                    {copiedLink === showSdkModal.id ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div>
                <span className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                  Pega esta línea antes del cierre de <code>&lt;/body&gt;</code> en la landing page:
                </span>
                <pre style={{
                  background: 'rgba(10, 15, 30, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.78rem',
                  color: '#34d399',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
{`<!-- Attrad Attribution SDK -->
<script async defer src="${window.location.origin}/sdk/attrad.min.js" data-api-key="attrad_live_${showSdkModal.id}_pk92"></script>`}
                </pre>
              </div>

              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.78rem',
                color: '#c7d2fe'
              }}>
                ℹ️ El script pesa &lt; 3.2 KB, respeta el <strong>First-Touch por 30 días</strong> e inyecta dinámicamente el código <code>[Ref: #XXX]</code> en el botón de WhatsApp para que la recepcionista identifique la venta con exactitud.
              </div>

              <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                <a
                  href="/test-landing.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: 'auto' }}
                >
                  <ExternalLink size={14} />
                  Probar Landing Demo
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const snippet = `<!-- Attrad Attribution SDK -->\n<script async defer src="${window.location.origin}/sdk/attrad.min.js" data-api-key="attrad_live_${showSdkModal.id}_pk92"></script>`;
                    navigator.clipboard.writeText(snippet);
                    setCopiedSdk(true);
                    setTimeout(() => setCopiedSdk(false), 2500);
                  }}
                  className="btn btn-primary"
                >
                  {copiedSdk ? <Check size={16} /> : <Copy size={16} />}
                  {copiedSdk ? '¡Código Copiado!' : 'Copiar Script'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .client-hub-container {
          padding: 2rem 1.5rem;
          max-width: 1600px;
          margin: 0 auto;
        }
        .hub-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .hub-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.35);
          color: #22d3ee;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .hub-title {
          font-family: var(--font-heading, sans-serif);
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 0.45rem;
        }
        .hub-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          max-width: 750px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }
        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-clients {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
        }
        .icon-spend {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }
        .icon-leads {
          background: rgba(6, 182, 212, 0.2);
          color: #22d3ee;
        }
        .icon-revenue {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
        .stat-label {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          margin: 0.15rem 0;
        }
        .stat-subtext {
          font-size: 0.72rem;
          color: #64748b;
        }
        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 1.5rem;
        }
        .client-card {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .client-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }
        .selected-border {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.2) !important;
        }
        .active-tag-banner {
          position: absolute;
          top: 0;
          right: 0;
          background: #06b6d4;
          color: #080d1a;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.25rem 0.85rem;
          border-bottom-left-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .client-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .client-avatar-emoji {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .client-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }
        .client-category-tag {
          display: inline-block;
          font-size: 0.72rem;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
        }
        .networks-box {
          background: rgba(10, 15, 30, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 0.85rem;
        }
        .networks-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .networks-badges-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .network-badge {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.75rem;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
        }
        .network-badge.connected {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #a7f3d0;
        }
        .network-badge.disconnected {
          background: rgba(100, 116, 139, 0.1);
          border: 1px solid rgba(100, 116, 139, 0.2);
          color: #64748b;
        }
        .network-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .network-badge.connected .dot {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .network-badge.disconnected .dot {
          background: #64748b;
        }
        .network-badge .acc-name {
          margin-left: auto;
          font-size: 0.68rem;
          opacity: 0.8;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .client-metrics-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(30, 41, 59, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 0.75rem;
          text-align: center;
        }
        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .m-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .m-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
        }
        .font-accent {
          color: #22d3ee;
        }
        .font-success {
          color: #34d399;
        }
        .font-roas {
          color: #f59e0b;
        }
        .client-card-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-top: auto;
        }
        .flex-1 {
          flex: 1;
        }

        /* Modales */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1.5rem;
        }
        .modal-window {
          width: 100%;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
          max-height: 90vh;
          overflow-y: auto;
        }
        .max-w-650 {
          max-width: 650px;
        }
        .max-w-550 {
          max-width: 550px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }
        .modal-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
        }
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
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .field-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #cbd5e1;
        }
        .form-input {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 0.65rem 0.85rem;
          color: #ffffff;
          font-size: 0.88rem;
        }
        .form-input:focus {
          outline: none;
          border-color: #06b6d4;
        }
        .networks-connection-setup {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .setup-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
        }
        .setup-subtitle {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-bottom: 0.35rem;
        }
        .network-connect-row {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          background: rgba(30, 41, 59, 0.4);
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #f1f5f9;
          cursor: pointer;
        }
        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: #06b6d4;
        }
        .network-acc-input {
          font-size: 0.8rem;
          padding: 0.5rem 0.75rem;
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
