import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  Plus,
  Download,
  Eye,
  Tag,
  Copy,
  LayoutGrid,
  List,
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
  
  // Filtros y Vistas
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modales
  const [closingSaleLead, setClosingSaleLead] = useState<LeadRow | null>(null);
  const [saleAmountInput, setSaleAmountInput] = useState<string>('');
  const [saleNotesInput, setSaleNotesInput] = useState<string>('');
  
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [detailLead, setDetailLead] = useState<LeadRow | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Formulario nuevo lead manual
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadRefCode, setNewLeadRefCode] = useState('');
  const [newLeadAdName, setNewLeadAdName] = useState('Ortodoncia Invisible - Video Reel #1');
  const [newLeadStatus, setNewLeadStatus] = useState<LeadStatus>('nuevo');
  const [newLeadSaleAmount, setNewLeadSaleAmount] = useState('');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // Edición rápida inline
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState('');

  const loadData = () => {
    let foundClient = attributionStore.getClientByToken(secureToken);
    if (!foundClient) {
      const allClients = attributionStore.getClients();
      foundClient = allClients[0] || null;
    }
    setClient(foundClient);
    if (foundClient) {
      const clientLeads = attributionStore.getLeads(foundClient.id);
      setLeads(clientLeads.length > 0 ? clientLeads : attributionStore.getLeads());
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = attributionStore.subscribe(loadData);
    return () => unsubscribe();
  }, [secureToken]);

  // Si no se encuentra el cliente o el token fue revocado
  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
          <X className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Enlace de Recepción no válido o revocado</h1>
        <p className="text-slate-400 max-w-md mb-6 text-sm">
          El token seguro de este espacio fue revocado o regenerado por la agencia de marketing para proteger la seguridad.
        </p>
        {onExitPortal && (
          <button 
            onClick={onExitPortal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30"
          >
            Volver al Panel Principal
          </button>
        )}
      </div>
    );
  }

  // Filtrado de prospectos con fecha, estado y buscador
  const filteredLeads = useMemo(() => {
    const now = Date.now();
    return leads.filter((l) => {
      // 1. Filtro por Estado
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;

      // 2. Filtro por Fecha
      if (dateFilter !== 'all') {
        const leadTime = new Date(l.created_at).getTime();
        const diffDays = (now - leadTime) / (1000 * 3600 * 24);
        if (dateFilter === 'today' && diffDays > 1) return false;
        if (dateFilter === '7days' && diffDays > 7) return false;
        if (dateFilter === '30days' && diffDays > 30) return false;
      }

      // 3. Filtro por Buscador
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        l.ref_code.toLowerCase().includes(q) ||
        (l.customer_name && l.customer_name.toLowerCase().includes(q)) ||
        (l.customer_phone && l.customer_phone.includes(q)) ||
        (l.ad_name && l.ad_name.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        l.ad_id.toLowerCase().includes(q)
      );
    });
  }, [leads, statusFilter, dateFilter, searchQuery]);

  // Contadores por estado
  const countTotal = leads.length;
  const countNuevos = leads.filter((l) => l.status === 'nuevo').length;
  const countCitas = leads.filter((l) => l.status === 'cita_agendada').length;
  const countVentas = leads.filter((l) => l.status === 'venta_cerrada').length;
  const countDescartados = leads.filter((l) => l.status === 'descartado').length;

  // Facturación atribuida
  const totalFacturado = leads
    .filter((l) => l.status === 'venta_cerrada')
    .reduce((acc, l) => acc + (l.sale_amount || 0), 0);

  const ticketPromedio = countVentas > 0 ? Math.round(totalFacturado / countVentas) : 0;

  // Notificación flotante
  const showNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Manejo de cambio de estado
  const handleStatusChange = (lead: LeadRow, newStatus: LeadStatus) => {
    if (newStatus === 'venta_cerrada') {
      setClosingSaleLead(lead);
      setSaleAmountInput(lead.sale_amount > 0 ? lead.sale_amount.toString() : '');
      setSaleNotesInput(lead.notes || '');
      return;
    }
    attributionStore.updateLeadStatus(lead.id, newStatus, 0);
    showNotice(`Estado actualizado: ${getStatusLabel(newStatus)}`);
  };

  // Confirmar venta con monto
  const confirmSaleClose = () => {
    if (!closingSaleLead) return;
    const amount = parseFloat(saleAmountInput) || 0;
    attributionStore.updateLeadStatus(closingSaleLead.id, 'venta_cerrada', amount, saleNotesInput.trim() || undefined);
    setClosingSaleLead(null);
    setSaleAmountInput('');
    setSaleNotesInput('');
    showNotice(`✅ ¡Venta de $${amount.toLocaleString()} confirmada y atribuida con éxito!`);
  };

  // Copiar enlace del portal
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showNotice('Enlace del portal copiado al portapapeles.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const headers = [
      'Codigo_Ref',
      'Fecha_Contacto',
      'Paciente_Cliente',
      'Telefono',
      'Anuncio_Atribuido',
      'Campana',
      'Red_Social',
      'Estado',
      'Monto_Venta',
      'Moneda',
      'Notas'
    ];

    const rows = leads.map((l) => [
      `"${l.ref_code}"`,
      `"${new Date(l.created_at).toLocaleString('es-ES')}"`,
      `"${l.customer_name || 'Prospecto WhatsApp'}"`,
      `"${l.customer_phone || ''}"`,
      `"${l.ad_name || l.ad_id}"`,
      `"${l.utm_campaign || 'General'}"`,
      `"${l.utm_source || 'Meta'}"`,
      `"${l.status}"`,
      l.sale_amount || 0,
      `"${l.currency || 'USD'}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attrad_${client.slug}_ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('Archivo CSV descargado con éxito.');
  };

  // Crear nuevo lead manual
  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) {
      alert('Por favor ingresa el nombre del paciente o comprador.');
      return;
    }

    const created = attributionStore.createManualLead({
      client_id: client.id,
      customer_name: newLeadName,
      customer_phone: newLeadPhone,
      ref_code: newLeadRefCode.trim() || undefined,
      ad_name: newLeadAdName,
      status: newLeadStatus,
      sale_amount: parseFloat(newLeadSaleAmount) || 0,
      notes: newLeadNotes,
    });

    setShowNewLeadModal(false);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadRefCode('');
    setNewLeadSaleAmount('');
    setNewLeadNotes('');
    setNewLeadStatus('nuevo');
    showNotice(`✅ Registro guardado con código ${created.ref_code}`);
  };

  // Helper para etiquetas de estado
  function getStatusLabel(status: LeadStatus) {
    switch (status) {
      case 'nuevo': return '🔵 Nuevo Prospecto';
      case 'cita_agendada': return '🟡 Cita Agendada';
      case 'venta_cerrada': return '🟢 Venta Cerrada';
      case 'descartado': return '⚪ Descartado';
      default: return status;
    }
  }

  function getStatusBadgeClass(status: LeadStatus) {
    switch (status) {
      case 'nuevo':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'cita_agendada':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'venta_cerrada':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'descartado':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Principal del Portal */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo y Datos del Negocio */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">{client.name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Portal de Recepción Seguro
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Atribución First-Touch Activa</span>
                {client.whatsapp_phone && (
                  <span className="inline-flex items-center gap-1 text-slate-300">
                    • <MessageSquare className="w-3 h-3 text-emerald-400" /> {client.whatsapp_phone}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Acciones Rápidas del Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setNewLeadRefCode(`#REF-${Math.floor(1000 + Math.random() * 9000)}`);
                setShowNewLeadModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              title="Registrar prospecto o venta manual"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              title="Descargar lista completa en Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              title="Copiar enlace para abrir en otro dispositivo"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Copiar Enlace'}</span>
            </button>

            {onExitPortal && (
              <button
                onClick={onExitPortal}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Alerta de notificación flotante */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-semibold animate-fade-in backdrop-blur-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Contenido Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Banner Informativo y Guía Rápida */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Control de Citas y Cierre de Ventas en 2 Clics
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Cuando un cliente o paciente te escriba por WhatsApp con un código <code className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded font-mono font-bold">#REF-XXX</code>, búscalo abajo. Al concretar su pago, marca <strong className="text-emerald-300">Venta Cerrada</strong> para atribuir automáticamente el retorno de inversión al anuncio publicitario.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <a
                href="/test-landing.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Simular Clic en Anuncio
              </a>
            </div>
          </div>
        </div>

        {/* 3. Métricas Rápidas en Tarjetas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Chats Registrados</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{countTotal}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-indigo-400">● {countNuevos}</span> nuevos pendientes
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Citas Agendadas</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 tracking-tight">{countCitas}</div>
            <div className="text-[11px] text-slate-400 mt-1">Pacientes en agenda</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Ventas Concretadas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 tracking-tight">{countVentas}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {countTotal > 0 ? `${Math.round((countVentas / countTotal) * 100)}% tasa de cierre` : 'Sin ventas aún'}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium">Facturación Atribuida</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              ${totalFacturado.toLocaleString()} USD
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Ticket prom: ${ticketPromedio.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4. Barra de Filtros, Búsqueda y Pestañas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Pestañas de Estado con Contadores */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({countTotal})
              </button>
              <button
                onClick={() => setStatusFilter('nuevo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'nuevo'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-indigo-300 hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Nuevos ({countNuevos})
              </button>
              <button
                onClick={() => setStatusFilter('cita_agendada')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'cita_agendada'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Citas ({countCitas})
              </button>
              <button
                onClick={() => setStatusFilter('venta_cerrada')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'venta_cerrada'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-emerald-300 hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Ventas ({countVentas})
              </button>
              <button
                onClick={() => setStatusFilter('descartado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'descartado'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}
              >
                Descartados ({countDescartados})
              </button>
            </div>

            {/* Alternador de Vista (Tabla vs Tarjetas) */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Vista en Tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl text-xs transition-colors ${
                  viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segunda fila: Buscador y Filtro Temporal */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por #REF-XXX, nombre, teléfono o anuncio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs lg:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Fecha:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todo el Historial</option>
                <option value="today">Hoy</option>
                <option value="7days">Últimos 7 días</option>
                <option value="30days">Últimos 30 días</option>
              </select>
              <div className="text-xs text-slate-400 pl-2">
                Mostrando <strong>{filteredLeads.length}</strong> de {countTotal}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Vista de Registros: Tabla o Tarjetas */}
        {viewMode === 'table' ? (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs lg:text-sm">
                <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Código / Fecha</th>
                    <th className="py-3.5 px-4">Paciente / Cliente</th>
                    <th className="py-3.5 px-4">Anuncio Atribuido</th>
                    <th className="py-3.5 px-4">Estado (Acción 2 Clics)</th>
                    <th className="py-3.5 px-4 text-right">Monto Venta</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredLeads.map((lead) => {
                    const isEditingThis = editingLeadId === lead.id;
                    const dateStr = new Date(lead.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
                        {/* Código Ref & Hora */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {lead.ref_code}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {dateStr}
                          </div>
                        </td>

                        {/* Paciente y Teléfono con WhatsApp */}
                        <td className="py-3.5 px-4">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
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
                                onClick={() => {
                                  attributionStore.updateLeadInfo(lead.id, editingName.trim() || 'Prospecto WhatsApp', editingPhone.trim());
                                  setEditingLeadId(null);
                                  showNotice('Datos actualizados.');
                                }}
                                className="p-1 bg-emerald-600 rounded text-white hover:bg-emerald-500"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingLeadId(null)}
                                className="p-1 bg-slate-700 rounded text-slate-300 hover:bg-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{lead.customer_name || 'Prospecto WhatsApp'}</span>
                                <button
                                  onClick={() => {
                                    setEditingLeadId(lead.id);
                                    setEditingName(lead.customer_name || '');
                                    setEditingPhone(lead.customer_phone || '');
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-opacity p-0.5"
                                  title="Editar datos"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                {lead.customer_phone ? (
                                  <>
                                    <span>{lead.customer_phone}</span>
                                    <a
                                      href={`https://wa.me/${lead.customer_phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(lead.customer_name || '')},%20te%20contacto%20de%20${encodeURIComponent(client.name)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-0.5 text-[11px] font-semibold"
                                      title="Abrir chat de WhatsApp"
                                    >
                                      <MessageSquare className="w-3 h-3" /> Chat
                                    </a>
                                  </>
                                ) : (
                                  <span className="italic text-slate-400">Sin teléfono</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Origen First-Touch Atribuido */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={lead.ad_name || lead.ad_id}>
                              {lead.ad_name || lead.ad_id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="capitalize">{lead.utm_source || 'Meta'}</span>
                            {lead.utm_campaign && <span>• {lead.utm_campaign}</span>}
                          </div>
                        </td>

                        {/* Selector de Estado de 2 Clics */}
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                            className={`text-xs font-bold rounded-xl px-3 py-1.5 border transition-all cursor-pointer focus:outline-none ${getStatusBadgeClass(lead.status)}`}
                          >
                            <option value="nuevo" className="bg-slate-900 text-slate-200">🔵 Nuevo Prospecto</option>
                            <option value="cita_agendada" className="bg-slate-900 text-amber-300">🟡 Cita Agendada</option>
                            <option value="venta_cerrada" className="bg-slate-900 text-emerald-300">🟢 Venta Cerrada ($)</option>
                            <option value="descartado" className="bg-slate-900 text-rose-400">⚪ Descartado</option>
                          </select>
                        </td>

                        {/* Monto de la Venta */}
                        <td className="py-3.5 px-4 text-right">
                          {lead.status === 'venta_cerrada' ? (
                            <div>
                              <span className="font-extrabold text-emerald-400 text-sm">
                                ${lead.sale_amount.toLocaleString()} {lead.currency}
                              </span>
                              <div className="text-[10px] text-emerald-300/80 font-medium">Atribuido a Anuncio</div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setClosingSaleLead(lead);
                                setSaleAmountInput('');
                                setSaleNotesInput(lead.notes || '');
                              }}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                            >
                              + Cobrar ($)
                            </button>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setDetailLead(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Ver dossier de atribución completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        No se encontraron registros que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Vista en Tarjetas (Mobile-Friendly) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => {
              const dateStr = new Date(lead.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={lead.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4.5 space-y-3.5 transition-all shadow-lg backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {lead.ref_code}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {dateStr}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">{lead.customer_name || 'Prospecto WhatsApp'}</h3>
                    {lead.customer_phone ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{lead.customer_phone}</span>
                        <a
                          href={`https://wa.me/${lead.customer_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin teléfono registrado</span>
                    )}
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-medium">Anuncio de Origen:</div>
                    <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                      {lead.ad_name || lead.ad_id}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border ${getStatusBadgeClass(lead.status)}`}
                    >
                      <option value="nuevo">🔵 Nuevo</option>
                      <option value="cita_agendada">🟡 Cita</option>
                      <option value="venta_cerrada">🟢 Venta ($)</option>
                      <option value="descartado">⚪ Descartado</option>
                    </select>

                    <div className="text-right">
                      {lead.status === 'venta_cerrada' ? (
                        <div className="font-extrabold text-emerald-400 text-sm">
                          ${lead.sale_amount.toLocaleString()} {lead.currency}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setClosingSaleLead(lead);
                            setSaleAmountInput('');
                            setSaleNotesInput(lead.notes || '');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                          + Cobrar ($)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 6. Modal de Confirmación de Venta ($) */}
      {closingSaleLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Cobro al Paciente</h3>
                  <p className="text-xs text-slate-400">{closingSaleLead.customer_name || 'Prospecto'}</p>
                </div>
              </div>
              <button
                onClick={() => setClosingSaleLead(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Atribución Publicitaria:</div>
              <div className="text-xs font-bold text-indigo-300">{closingSaleLead.ad_name}</div>
              <div className="text-[11px] text-slate-400">Código de chat: {closingSaleLead.ref_code}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Monto Cobrado (USD $):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleAmountInput}
                  onChange={(e) => setSaleAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-4 py-3 text-xl font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Atajos rápidos de montos */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Atajos:</span>
                {[50, 150, 300, 500, 1200, 2500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSaleAmountInput(val.toString())}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Concepto / Notas del Tratamiento:</label>
              <input
                type="text"
                placeholder="Ej. Tratamiento de ortodoncia - Pago inicial"
                value={saleNotesInput}
                onChange={(e) => setSaleNotesInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setClosingSaleLead(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSaleClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal "+ Nuevo Registro Manual" */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Nuevo Prospecto o Venta</h3>
                  <p className="text-xs text-slate-400">Recepción • {client.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLead} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María Elena Delgado"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Teléfono WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Código de Chat Ref</label>
                  <input
                    type="text"
                    value={newLeadRefCode}
                    onChange={(e) => setNewLeadRefCode(e.target.value)}
                    placeholder="#REF-123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Anuncio Atribuido</label>
                <select
                  value={newLeadAdName}
                  onChange={(e) => setNewLeadAdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Ortodoncia Invisible - Video Reel #1">Ortodoncia Invisible - Video Reel #1 (Meta)</option>
                  <option value="Implantes Dentales - Carrusel Casos Reales">Implantes Dentales - Carrusel Casos Reales (Instagram)</option>
                  <option value="Blanqueamiento Láser 2x1 - TikTok Ads">Blanqueamiento Láser 2x1 (TikTok)</option>
                  <option value="Campaña Google Search - Urgencias Dentales">Google Search - Urgencias Dentales</option>
                  <option value="Recomendación / Directo en Mostrador">Recomendación / Directo en Mostrador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Estado Inicial</label>
                  <select
                    value={newLeadStatus}
                    onChange={(e) => setNewLeadStatus(e.target.value as LeadStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="nuevo">🔵 Nuevo Prospecto</option>
                    <option value="cita_agendada">🟡 Cita Agendada</option>
                    <option value="venta_cerrada">🟢 Venta Cerrada ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Monto Pagado (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={newLeadStatus !== 'venta_cerrada'}
                    placeholder={newLeadStatus === 'venta_cerrada' ? '0.00' : 'Solo si venta'}
                    value={newLeadSaleAmount}
                    onChange={(e) => setNewLeadSaleAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notas / Tratamiento Solicitado</label>
                <input
                  type="text"
                  placeholder="Ej. Interesada en cotización para sus dos hijas"
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal Dossier Completo de Atribución */}
      {detailLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Dossier First-Touch de Atribución</h3>
                  <p className="text-xs text-slate-400">Auditoría precisa de anuncio y procedencia</p>
                </div>
              </div>
              <button
                onClick={() => setDetailLead(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Código de Referencia:</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">{detailLead.ref_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Paciente / Cliente:</span>
                  <span className="font-bold text-white">{detailLead.customer_name || 'Prospecto WhatsApp'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="text-slate-200">{detailLead.customer_phone || 'Sin número registrado'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fecha y Hora de Clic:</span>
                  <span className="text-slate-200">{new Date(detailLead.created_at).toLocaleString('es-ES')}</span>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-300 flex items-center gap-1.5 pb-1 border-b border-slate-800/80">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Parámetros Publicitarios (UTMs)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Anuncio Específico:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[220px]" title={detailLead.ad_name || undefined}>
                    {detailLead.ad_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Red Publicitaria:</span>
                  <span className="font-semibold text-slate-200 uppercase">{detailLead.utm_source || 'Meta'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Campaña:</span>
                  <span className="text-slate-200">{detailLead.utm_campaign || 'campana_general'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado de Conversión:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${getStatusBadgeClass(detailLead.status)}`}>
                    {getStatusLabel(detailLead.status)}
                  </span>
                </div>
                {detailLead.status === 'venta_cerrada' && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-emerald-400 font-bold">Monto Atribuido:</span>
                    <span className="text-emerald-400 font-black text-sm">
                      ${detailLead.sale_amount.toLocaleString()} {detailLead.currency}
                    </span>
                  </div>
                )}
              </div>

              {detailLead.notes && (
                <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800">
                  <div className="text-slate-400 font-medium mb-1">Notas Internas:</div>
                  <div className="text-slate-200">{detailLead.notes}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {detailLead.customer_phone && (
                <a
                  href={`https://wa.me/${detailLead.customer_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Abrir WhatsApp
                </a>
              )}
              <button
                onClick={() => setDetailLead(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cerrar Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Footer Seguro */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-400 bg-slate-950">
        Panel de Recepción ATTRAD • Enlace protegido con token para {client.name}
      </footer>
    </div>
  );
};
