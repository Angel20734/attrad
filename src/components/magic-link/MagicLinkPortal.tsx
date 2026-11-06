import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Users, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Edit2, 
  Check, 
  X, 
  TrendingUp, 
  Clock
} from 'lucide-react';
import { attributionStore } from '../../lib/attributionStore';
import { ClientRow, LeadRow, LeadStatus } from '../../types/database';

interface MagicLinkPortalProps {
  secureToken: string;
  onExitPortal?: () => void;
}

export const MagicLinkPortal: React.FC<MagicLinkPortalProps> = ({ secureToken, onExitPortal }) => {
  const [client, setClient] = useState<ClientRow | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState('');
  const [closingSaleLeadId, setClosingSaleLeadId] = useState<string | null>(null);
  const [saleAmountInput, setSaleAmountInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    const foundClient = attributionStore.getClientByToken(secureToken);
    setClient(foundClient);
    if (foundClient) {
      const clientLeads = attributionStore.getLeads(foundClient.id);
      setLeads(clientLeads);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = attributionStore.subscribe(loadData);
    return () => unsubscribe();
  }, [secureToken]);

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <X className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Enlace no válido o revocado</h1>
        <p className="text-slate-400 max-w-md mb-6">
          El token de acceso seguro para este negocio no existe o fue regenerado por la agencia de marketing.
        </p>
        {onExitPortal && (
          <button 
            onClick={onExitPortal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            Volver al Panel Principal
          </button>
        )}
      </div>
    );
  }

  // Filtrado por buscador (código #REF, nombre, teléfono o anuncio)
  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.ref_code.toLowerCase().includes(q) ||
      (l.customer_name && l.customer_name.toLowerCase().includes(q)) ||
      (l.customer_phone && l.customer_phone.includes(q)) ||
      (l.ad_name && l.ad_name.toLowerCase().includes(q)) ||
      l.ad_id.toLowerCase().includes(q)
    );
  });

  // Métricas rápidas del negocio
  const totalLeads = leads.length;
  const citasAgendadas = leads.filter(l => l.status === 'cita_agendada').length;
  const ventasCerradas = leads.filter(l => l.status === 'venta_cerrada');
  const totalFacturado = ventasCerradas.reduce((acc, l) => acc + (l.sale_amount || 0), 0);

  // Manejo de cambio de estado en 2 clics
  const handleStatusChange = (lead: LeadRow, newStatus: LeadStatus) => {
    if (newStatus === 'venta_cerrada') {
      setClosingSaleLeadId(lead.id);
      setSaleAmountInput(lead.sale_amount > 0 ? lead.sale_amount.toString() : '');
      return;
    }

    attributionStore.updateLeadStatus(lead.id, newStatus, 0);
    showNotice(`Estado actualizado a: ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const confirmSaleClose = (leadId: string) => {
    const amount = parseFloat(saleAmountInput) || 0;
    attributionStore.updateLeadStatus(leadId, 'venta_cerrada', amount);
    setClosingSaleLeadId(null);
    setSaleAmountInput('');
    showNotice(`✅ ¡Venta de $${amount.toLocaleString()} confirmada y atribuida con éxito!`);
  };

  const handleStartEditInfo = (lead: LeadRow) => {
    setEditingLeadId(lead.id);
    setEditingName(lead.customer_name || '');
    setEditingPhone(lead.customer_phone || '');
  };

  const handleSaveInfo = (leadId: string) => {
    attributionStore.updateLeadInfo(leadId, editingName.trim() || 'Prospecto WhatsApp', editingPhone.trim());
    setEditingLeadId(null);
    showNotice('Datos del prospecto guardados.');
  };

  const showNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de cabecera segura del cliente */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/20">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base lg:text-lg text-white tracking-tight">{client.name}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Magic Link Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">Portal de Recepción y Control de Ventas WhatsApp</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {client.whatsapp_phone && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              {client.whatsapp_phone}
            </span>
          )}
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            >
              Salir del Portal
            </button>
          )}
        </div>
      </header>

      {/* Alerta de notificación flotante */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Banner informativo de recepción */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">¿Cómo confirmar ventas en 2 clics?</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cuando un paciente te contacte con un código <code className="text-indigo-300 bg-indigo-950/80 px-1 py-0.5 rounded">#REF-XXX</code>, búscalo aquí. Al pagar su consulta o tratamiento, marca <strong>Venta Cerrada</strong> y digita el monto.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/test-landing.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Probar Landing Demo
            </a>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Chats Iniciados</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalLeads}</div>
            <div className="text-[11px] text-slate-500 mt-1">Prospectos en WhatsApp</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Citas Agendadas</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{citasAgendadas}</div>
            <div className="text-[11px] text-slate-500 mt-1">Consultas programadas</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Ventas Cerradas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{ventasCerradas.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Pacientes que pagaron</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Facturación Atribuida</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">${totalFacturado.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Generado por Anuncios
            </div>
          </div>
        </div>

        {/* Barra de búsqueda rápida */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por #REF-XXX, nombre o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-400">
            Mostrando <strong>{filteredLeads.length}</strong> de <strong>{leads.length}</strong> prospectos
          </div>
        </div>

        {/* Modal / Panel Rápido de Confirmación de Venta ($) */}
        {closingSaleLeadId && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-sm font-bold text-white">Ingresa el monto cobrado al paciente:</span>
                <p className="text-xs text-emerald-300/80">Este valor se atribuirá automáticamente al anuncio que originó el contacto.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleAmountInput}
                  onChange={(e) => setSaleAmountInput(e.target.value)}
                  className="bg-slate-900 border border-emerald-500/50 rounded-lg pl-7 pr-3 py-1.5 text-sm font-bold text-white w-32 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <button
                onClick={() => confirmSaleClose(closingSaleLeadId)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Confirmar Venta
              </button>
              <button
                onClick={() => setClosingSaleLeadId(null)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Tabla de Leads estilo Mobile-First y Desktop */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lg:text-sm">
              <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código / Fecha</th>
                  <th className="py-3 px-4">Paciente / Teléfono</th>
                  <th className="py-3 px-4">Anuncio Atribuido</th>
                  <th className="py-3 px-4">Estado (Acción 2 Clics)</th>
                  <th className="py-3 px-4 text-right">Monto Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLeads.map((lead) => {
                  const isEditingThis = editingLeadId === lead.id;
                  const dateStr = new Date(lead.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Código de referencia inyectado en el chat */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            {lead.ref_code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </div>
                      </td>

                      {/* Paciente y Teléfono con edición rápida */}
                      <td className="py-3 px-4">
                        {isEditingThis ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder="Nombre"
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-28"
                            />
                            <input
                              type="text"
                              value={editingPhone}
                              onChange={(e) => setEditingPhone(e.target.value)}
                              placeholder="Teléfono"
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-24"
                            />
                            <button
                              onClick={() => handleSaveInfo(lead.id)}
                              className="p-1 bg-emerald-600 rounded text-white hover:bg-emerald-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingLeadId(null)}
                              className="p-1 bg-slate-700 rounded text-slate-300 hover:bg-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <div>
                              <div className="font-medium text-white">{lead.customer_name || 'Prospecto WhatsApp'}</div>
                              <div className="text-xs text-slate-400">{lead.customer_phone || 'Sin número registrado'}</div>
                            </div>
                            <button
                              onClick={() => handleStartEditInfo(lead)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 transition-opacity"
                              title="Editar datos del paciente"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Origen First-Touch */}
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-slate-200">
                          {lead.ad_name || lead.ad_id}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {lead.utm_campaign || 'Campaña Meta'}
                        </div>
                      </td>

                      {/* Selector de Estado de 2 Clics */}
                      <td className="py-3 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer focus:outline-none ${
                            lead.status === 'venta_cerrada'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : lead.status === 'cita_agendada'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : lead.status === 'descartado'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          <option value="nuevo" className="bg-slate-900 text-slate-200">🔵 Nuevo Prospecto</option>
                          <option value="cita_agendada" className="bg-slate-900 text-amber-300">🟡 Cita Agendada</option>
                          <option value="venta_cerrada" className="bg-slate-900 text-emerald-300">🟢 Venta Cerrada ($)</option>
                          <option value="descartado" className="bg-slate-900 text-rose-400">⚪ Descartado</option>
                        </select>
                      </td>

                      {/* Monto de la Venta */}
                      <td className="py-3 px-4 text-right">
                        {lead.status === 'venta_cerrada' ? (
                          <span className="font-bold text-emerald-400 text-sm">
                            ${lead.sale_amount.toLocaleString()} {lead.currency}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                      No se encontraron prospectos con ese criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Pie de página seguro */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        Panel de Atribución Attrad • Acceso cifrado con token único para {client.name}
      </footer>

      <style>{`
        .min-h-screen { min-height: 100vh; }
        .bg-slate-950 { background-color: #090d16; }
        .bg-slate-900 { background-color: rgba(15, 23, 42, 0.75); }
        .border-slate-800 { border-color: rgba(255, 255, 255, 0.08); }
        .text-slate-100 { color: #f8fafc; }
        .text-slate-400 { color: #94a3b8; }
        .text-slate-500 { color: #64748b; }
        
        /* Glassmorphism y Elevaciones */
        header {
          background: rgba(15, 23, 42, 0.94) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(20px);
        }
        main {
          padding-top: 2rem;
          padding-bottom: 3rem;
        }
        .grid {
          display: grid;
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (max-width: 1023px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        /* Tarjetas de métricas */
        .grid > div {
          background: rgba(17, 24, 39, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          transition: transform 0.2s, border-color 0.2s;
        }
        .grid > div:hover {
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-2px);
        }
        
        /* Tabla */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          padding: 0.85rem 1rem;
          text-align: left;
          font-size: 0.72rem;
          text-transform: uppercase;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.5);
        }
        td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
        }
        tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        
        /* Selectores e Inputs */
        select, input[type="text"], input[type="number"] {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #ffffff;
          padding: 0.45rem 0.75rem;
          font-family: inherit;
        }
        select:focus, input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
};
