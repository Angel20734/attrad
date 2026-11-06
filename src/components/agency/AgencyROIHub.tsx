import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  Plus, 
  Code2, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  Eye, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { attributionStore } from '../../lib/attributionStore';
import { ClientRow, LeadRow } from '../../types/database';

interface AgencyROIHubProps {
  currentAgencyId: string;
  onOpenMagicLink: (token: string) => void;
}

export const AgencyROIHub: React.FC<AgencyROIHubProps> = ({ currentAgencyId, onOpenMagicLink }) => {
  const [activeTab, setActiveTab] = useState<'roi' | 'clients'>('roi');
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  
  // Modales
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showSdkModal, setShowSdkModal] = useState<ClientRow | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedSdk, setCopiedSdk] = useState(false);

  // Formulario nuevo cliente
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const loadData = () => {
    const orgClients = attributionStore.getClients(currentAgencyId);
    setClients(orgClients);
    const orgLeads = attributionStore.getLeads(undefined, currentAgencyId);
    setLeads(orgLeads);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = attributionStore.subscribe(loadData);
    return () => unsubscribe();
  }, [currentAgencyId]);

  // Filtrado de leads por cliente seleccionado en la pestaña de ROI
  const displayedLeads = selectedClientId === 'all' 
    ? leads 
    : leads.filter(l => l.client_id === selectedClientId);

  // Cálculo de Atribución por Anuncio
  const adAttributionMap: Record<string, {
    adId: string;
    adName: string;
    campaign: string;
    clicks: number;
    appointments: number;
    closedSales: number;
    revenue: number;
    leads: LeadRow[];
  }> = {};

  displayedLeads.forEach(lead => {
    const key = lead.ad_id;
    if (!adAttributionMap[key]) {
      adAttributionMap[key] = {
        adId: lead.ad_id,
        adName: lead.ad_name || lead.ad_id,
        campaign: lead.utm_campaign || 'Campaña General',
        clicks: 0,
        appointments: 0,
        closedSales: 0,
        revenue: 0,
        leads: [],
      };
    }
    adAttributionMap[key].clicks += 1;
    adAttributionMap[key].leads.push(lead);
    if (lead.status === 'cita_agendada') {
      adAttributionMap[key].appointments += 1;
    } else if (lead.status === 'venta_cerrada') {
      adAttributionMap[key].closedSales += 1;
      adAttributionMap[key].revenue += (lead.sale_amount || 0);
    }
  });

  const attributionList = Object.values(adAttributionMap).sort((a, b) => b.revenue - a.revenue);

  // Totales globales
  const totalClicks = displayedLeads.length;
  const totalAppointments = displayedLeads.filter(l => l.status === 'cita_agendada').length;
  const totalClosedSales = displayedLeads.filter(l => l.status === 'venta_cerrada').length;
  const totalRevenue = displayedLeads
    .filter(l => l.status === 'venta_cerrada')
    .reduce((sum, l) => sum + (l.sale_amount || 0), 0);

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRegenerateToken = (clientId: string) => {
    if (window.confirm('¿Deseas revocar el Magic Link actual y generar uno nuevo? El enlace anterior dejará de funcionar de inmediato.')) {
      attributionStore.regenerateSecureToken(clientId);
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    attributionStore.createClient({
      organization_id: currentAgencyId,
      name: newClientName.trim(),
      industry: newClientIndustry.trim() || 'General',
      whatsapp_phone: newClientPhone.trim(),
    });

    setNewClientName('');
    setNewClientIndustry('');
    setNewClientPhone('');
    setShowNewClientModal(false);
  };

  const handleCopySdkSnippet = (apiKey: string) => {
    const snippet = `<!-- Attrad Attribution SDK -->\n<script async defer src="${window.location.origin}/sdk/attrad.min.js" data-api-key="${apiKey}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Barra superior de pestañas y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('roi')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'roi'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Control de Atribución ROI
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Mis Clientes & Magic Links ({clients.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewClientModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Dar de Alta Cliente
          </button>
        </div>
      </div>

      {/* ========================================================
          PESTAÑA 1: CONTROL DE ATRIBUCIÓN ROI (ANUNCIOS VS VENTAS)
          ======================================================== */}
      {activeTab === 'roi' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Métricas consolidadas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-xs font-medium text-slate-400">Clics a WhatsApp</span>
              <div className="text-2xl font-bold text-white mt-1">{totalClicks}</div>
              <div className="text-[11px] text-slate-500 mt-1">Prospectos capturados</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-xs font-medium text-slate-400">Citas Agendadas</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{totalAppointments}</div>
              <div className="text-[11px] text-slate-500 mt-1">En seguimiento</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-xs font-medium text-slate-400">Ventas Cerradas</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{totalClosedSales}</div>
              <div className="text-[11px] text-slate-500 mt-1">Clientes que pagaron</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-xs font-medium text-slate-400">Facturación Generada</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">${totalRevenue.toLocaleString()} USD</div>
              <div className="text-[11px] text-emerald-400/90 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Atribución First-Touch Demostrada
              </div>
            </div>
          </div>

          {/* Filtro por cliente */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filtrar por Cliente:</span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todos los clientes gestionados</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500">
              {attributionList.length} anuncios activos con atribución
            </div>
          </div>

          {/* Tabla de Cruce ROI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs lg:text-sm">
                <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800 text-[11px] uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Anuncio / Creativo Meta</th>
                    <th className="py-3 px-4 text-center">Clics WA</th>
                    <th className="py-3 px-4 text-center">Citas</th>
                    <th className="py-3 px-4 text-center">Ventas Cerradas</th>
                    <th className="py-3 px-4 text-right">Facturación ($)</th>
                    <th className="py-3 px-4">Compradores Atribuidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {attributionList.map((item) => {
                    const closedLeads = item.leads.filter(l => l.status === 'venta_cerrada');
                    return (
                      <tr key={item.adId} className="hover:bg-slate-800/25 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{item.adName}</div>
                          <div className="text-[11px] font-mono text-indigo-400 mt-0.5">{item.adId}</div>
                          <div className="text-[10px] text-slate-500">{item.campaign}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{item.clicks}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-400">{item.appointments}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            {item.closedSales} ventas
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-emerald-400 text-sm">
                            ${item.revenue.toLocaleString()} USD
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {closedLeads.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {closedLeads.map(cl => (
                                <span 
                                  key={cl.id} 
                                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                                  title={`${cl.customer_name || 'Paciente'} ($${cl.sale_amount})`}
                                >
                                  {cl.ref_code} (${cl.sale_amount})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">En prospección</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {attributionList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                        No hay eventos registrados para este cliente todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: GESTIÓN DE CLIENTES & MAGIC LINKS
          ======================================================== */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
          {clients.map(client => {
            const clientLeads = leads.filter(l => l.client_id === client.id);
            const clientSales = clientLeads.filter(l => l.status === 'venta_cerrada');
            const clientRevenue = clientSales.reduce((sum, l) => sum + (l.sale_amount || 0), 0);
            const isCopied = copiedToken === client.secure_token;

            return (
              <div 
                key={client.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-white text-base tracking-tight">{client.name}</h3>
                      <span className="text-xs text-slate-400">{client.industry}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Activo
                    </span>
                  </div>

                  {/* Resumen de rendimiento del cliente */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 my-3 text-center">
                    <div>
                      <div className="text-xs text-slate-500">Chats</div>
                      <div className="text-sm font-bold text-white">{clientLeads.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Ventas</div>
                      <div className="text-sm font-bold text-emerald-400">{clientSales.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Total $</div>
                      <div className="text-sm font-bold text-emerald-400">${clientRevenue.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Sección Magic Link */}
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        Magic Link de Recepción
                      </span>
                      <button
                        onClick={() => handleRegenerateToken(client.id)}
                        className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                        title="Revocar y regenerar enlace seguro"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerar
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/?token=${client.secure_token}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(client.secure_token)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                          isCopied 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Copiar enlace para el cliente"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenMagicLink(client.secure_token)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-indigo-500/30"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Abrir Magic Link
                  </button>

                  <button
                    onClick={() => setShowSdkModal(client)}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Código SDK
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: DAR DE ALTA NUEVO CLIENTE
          ======================================================== */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h2 className="text-lg font-bold text-white mb-1">Dar de Alta Nuevo Cliente</h2>
            <p className="text-xs text-slate-400 mb-5">
              Se generará automáticamente su API Key pública y su Magic Link permanente para recepción.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Negocio</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Clínica Dental Sonrisas o Inmobiliaria Nova"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Giro / Industria</label>
                <input
                  type="text"
                  placeholder="ej. Odontología, Bienes Raíces, Estética"
                  value={newClientIndustry}
                  onChange={(e) => setNewClientIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp de Atención al Cliente</label>
                <input
                  type="text"
                  placeholder="+52 55 1234 5678"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Crear Cliente y Generar Enlaces
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CÓDIGO DE INSTALACIÓN DEL SDK (~3 KB)
          ======================================================== */}
      {showSdkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Instalación del Script de Atribución</h2>
                <p className="text-xs text-slate-400">{showSdkModal.name}</p>
              </div>
              <button
                onClick={() => setShowSdkModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">API Key Pública del Cliente:</span>
                <code className="block bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-indigo-400 font-mono select-all">
                  {showSdkModal.api_key}
                </code>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Pega esta línea antes del cierre de <code>&lt;/body&gt;</code> en Webflow, WordPress o Shopify:
                </span>
                <div className="relative">
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
{`<!-- Attrad Attribution SDK -->
<script async defer src="${window.location.origin}/sdk/attrad.min.js" data-api-key="${showSdkModal.api_key}"></script>`}
                  </pre>
                </div>
              </div>

              <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  El script pesa menos de 3 KB, no ralentiza el landing y detecta automáticamente los clics hacia WhatsApp inyectando el código de referencia en el chat.
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="/test-landing.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir landing de prueba
                </a>

                <button
                  onClick={() => handleCopySdkSnippet(showSdkModal.api_key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    copiedSdk 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {copiedSdk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSdk ? '¡Copiado al Portapapeles!' : 'Copiar Código'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
