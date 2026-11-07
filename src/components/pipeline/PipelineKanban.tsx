import React, { useState, useEffect } from 'react';
import { useAttrad } from '../../context/AttradContext';
import { LifecycleStatus, Lead } from '../../types/lead';
import {
  Kanban,
  List,
  RotateCcw,
  Plus,
  Scale,
  Edit2,
  Filter,
  CheckCircle2,
  Phone,
  Users,
  Target,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface StageConfig {
  status: LifecycleStatus;
  title: string;
  badgeClass?: string;
  dotColor?: string;
}

const STAGES: StageConfig[] = [
  { status: 'nuevo', title: 'Qualified' },
  { status: 'contacto', title: 'Contact Made' },
  { status: 'demo', title: 'Demo Scheduled' },
  { status: 'propuesta', title: 'Proposal Made' },
  { status: 'cliente_contrato', title: 'Negotiations Started' },
];

export const PipelineKanban: React.FC = () => {
  const {
    currentClientLeads,
    ads,
    updateLeadStatus,
    updateLeadDealValue,
    activeClientSpace,
    clientSpaces,
    setActiveClientSpaceId,
  } = useAttrad();

  // Estados de vista
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);

  // Estados de modales y popovers
  const [activeActivityPopoverLeadId, setActiveActivityPopoverLeadId] = useState<string | null>(null);
  const [inspectingLead, setInspectingLead] = useState<Lead | null>(null);
  const [editingDealValue, setEditingDealValue] = useState<number>(0);
  const [showAddDealModal, setShowAddDealModal] = useState(false);

  // Formulario nuevo trato
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealName, setNewDealName] = useState('');
  const [newDealValue, setNewDealValue] = useState<number>(1500);
  const [newDealStage, setNewDealStage] = useState<LifecycleStatus>('nuevo');
  const [newDealAdId, setNewDealAdId] = useState<string>('ad-05');

  // Escuchar evento global desde el header (+)
  useEffect(() => {
    const handleQuickDeal = () => setShowAddDealModal(true);
    window.addEventListener('attrad:open-quick-deal-modal', handleQuickDeal);
    return () => window.removeEventListener('attrad:open-quick-deal-modal', handleQuickDeal);
  }, []);

  // Totales globales del pipeline
  const totalPipelineValue = currentClientLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
  const totalDealsCount = currentClientLeads.length;

  const getNextStage = (current: LifecycleStatus): LifecycleStatus | null => {
    switch (current) {
      case 'nuevo':
        return 'contacto';
      case 'contacto':
        return 'demo';
      case 'demo':
        return 'propuesta';
      case 'propuesta':
        return 'cliente_contrato';
      default:
        return null;
    }
  };

  const getPrevStage = (current: LifecycleStatus): LifecycleStatus | null => {
    switch (current) {
      case 'cliente_contrato':
        return 'propuesta';
      case 'propuesta':
        return 'demo';
      case 'demo':
        return 'contacto';
      case 'contacto':
        return 'nuevo';
      default:
        return null;
    }
  };

  const handleOpenDossier = (lead: Lead) => {
    setInspectingLead(lead);
    setEditingDealValue(lead.dealValue);
    setActiveActivityPopoverLeadId(null);
  };

  const handleSaveDealValue = () => {
    if (inspectingLead) {
      updateLeadDealValue(inspectingLead.id, editingDealValue);
      setInspectingLead({ ...inspectingLead, dealValue: editingDealValue });
    }
  };

  const handleCreateDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim()) {
      alert('Por favor ingresa el título del trato.');
      return;
    }

    const newLead: Lead = {
      id: `deal-${Date.now()}`,
      tenantId: 'agency-nexus-01',
      agencyId: 'agency-nexus-01',
      clientSpaceId: activeClientSpace?.id || 'client-inmobiliaria-01',
      dealTitle: newDealTitle,
      company: newDealCompany || newDealTitle,
      name: newDealName || 'Contacto Comercial',
      phone: '+52 55 0000 0000',
      email: 'contacto@deal.com',
      lifecycleStatus: newDealStage,
      firstContactAt: new Date().toISOString(),
      dealValue: newDealValue,
      firstTouchAdId: newDealAdId,
      touchpointsHistory: [
        {
          id: `tp-${Date.now()}`,
          adId: newDealAdId,
          adName: ads.find((a) => a.id === newDealAdId)?.adName || 'Campaña Anuncio Ganador',
          platform: 'Meta Ads',
          timestamp: new Date().toISOString(),
          eventType: 'first_click',
        },
      ],
      tags: ['Nuevo Trato'],
      lastMessageAt: new Date().toISOString(),
      nextActivity: {
        id: `act-${Date.now()}`,
        type: 'call',
        title: 'Follow-up Call',
        dueTime: 'Hoy 17:00',
        completed: false,
      },
    };

    // Actualizar leads en el contexto agregando el nuevo
    try {
      const raw = localStorage.getItem('attrad_leads');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newLead);
      localStorage.setItem('attrad_leads', JSON.stringify(list));
      window.location.reload();
    } catch {
      alert('Trato creado con éxito.');
    }

    setShowAddDealModal(false);
  };

  return (
    <div className="pipedrive-deals-workspace animate-fade-in">
      {/* 1. Barra de Controles y Sub-cabecera Estilo Pipedrive */}
      <div className="deals-toolbar">
        {/* Lado Izquierdo: Conmutador de Vistas + Botón Verde + Deal */}
        <div className="toolbar-left-group">
          <div className="view-mode-buttons">
            <button
              onClick={() => setViewMode('kanban')}
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              title="Vista de Tablero Kanban"
            >
              <Kanban size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Vista de Lista de Tratos"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="view-btn"
              title="Refrescar vista"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Botón Verde + Deal de Pipedrive */}
          <button
            onClick={() => setShowAddDealModal(true)}
            className="btn-pipedrive-green"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Deal</span>
          </button>
        </div>

        {/* Lado Derecho: Total Facturado + Selector de Pipeline */}
        <div className="toolbar-right-group">
          {/* Métrica Resumen: $34,900 · 13 deals */}
          <div className="pipeline-aggregate-metrics">
            <span className="total-amount-bold">${totalPipelineValue.toLocaleString()}</span>
            <span className="metric-dot">·</span>
            <span className="total-deals-count">{totalDealsCount} deals</span>
          </div>

          {/* Selector de Pipeline */}
          <div className="relative">
            <button
              onClick={() => setShowPipelineDropdown(!showPipelineDropdown)}
              className="pipeline-selector-btn"
            >
              <Kanban size={15} className="text-slate-400" />
              <span className="pipeline-name-text">
                Sales pipeline ({activeClientSpace?.name || 'General'})
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showPipelineDropdown && (
              <div className="pipeline-menu-dropdown">
                <div className="dropdown-title">SELECCIONA PIPELINE DE CLIENTE</div>
                {clientSpaces.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => {
                      setActiveClientSpaceId(cs.id);
                      setShowPipelineDropdown(false);
                    }}
                    className={`pipeline-menu-item ${cs.id === activeClientSpace?.id ? 'active' : ''}`}
                  >
                    <span>{cs.logoEmoji}</span>
                    <span className="flex-1 text-left">{cs.name} Pipeline</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón de Edición y Filtro */}
          <button className="toolbar-icon-action" title="Editar pipeline">
            <Edit2 size={15} />
          </button>
          <button className="toolbar-icon-action" title="Filtros avanzados">
            <Filter size={15} />
          </button>
        </div>
      </div>

      {/* 2. TABLERO KANBAN CON CABECERAS CHEVRON ESTILO PIPEDRIVE */}
      {viewMode === 'kanban' ? (
        <div className="pipeline-stages-container">
          <div className="stages-row-header">
            {STAGES.map((stage, idx) => {
              const stageDeads = currentClientLeads.filter(
                (l) => l.lifecycleStatus === stage.status || (stage.status === 'contacto' && l.lifecycleStatus === 'potencial')
              );
              const stageSum = stageDeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

              return (
                <div key={stage.status} className={`stage-chevron-header ${idx === 0 ? 'first' : ''}`}>
                  <div className="chevron-content">
                    <h3 className="stage-name">{stage.title}</h3>
                    <div className="stage-metrics">
                      <Scale size={13} className="text-slate-400" />
                      <span>${stageSum.toLocaleString()} · {stageDeads.length} deals</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Columnas de Tarjetas de Tratos */}
          <div className="stages-columns-grid">
            {STAGES.map((stage) => {
              const stageDeals = currentClientLeads.filter(
                (l) => l.lifecycleStatus === stage.status || (stage.status === 'contacto' && l.lifecycleStatus === 'potencial')
              );

              return (
                <div key={stage.status} className="stage-column-lane">
                  <div className="cards-scroll-container">
                    {stageDeals.map((lead) => {
                      const attributedAd = ads.find((a) => a.id === lead.firstTouchAdId);
                      const isClosed = lead.lifecycleStatus === 'cliente_contrato';
                      const isPopoverOpen = activeActivityPopoverLeadId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          className={`deal-card-pipedrive ${isClosed ? 'won-card' : ''}`}
                          onClick={() => handleOpenDossier(lead)}
                        >
                          {/* Barra superior de color de la tarjeta */}
                          <div className={`card-top-indicator ${isClosed ? 'indicator-won' : 'indicator-meta'}`} />

                          {/* Título y Nombre de la Empresa */}
                          <div className="deal-card-body">
                            <h4 className="deal-title-text">
                              {lead.dealTitle || `${lead.name} deal`}
                            </h4>
                            <div className="deal-company-sub">
                              {lead.company || lead.name}
                            </div>

                            {/* Badge WON si el contrato está cerrado */}
                            {isClosed && (
                              <div className="won-badge-pill">
                                <span>WON</span>
                              </div>
                            )}

                            {/* Fila Inferior: Avatar + Monto + Botón de Actividad */}
                            <div className="deal-card-footer-row">
                              <div className="deal-value-box">
                                {lead.avatarUrl ? (
                                  <img
                                    src={lead.avatarUrl}
                                    alt={lead.name}
                                    className="deal-avatar-mini"
                                  />
                                ) : (
                                  <div className="deal-avatar-placeholder">
                                    {lead.name.substring(0, 1)}
                                  </div>
                                )}
                                <span className="deal-money-amount font-mono">
                                  ${(lead.dealValue || 0).toLocaleString()}
                                </span>
                              </div>

                              {/* Botón Circular de Acción / Próxima Actividad */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActivityPopoverLeadId(isPopoverOpen ? null : lead.id);
                                  }}
                                  className={`activity-action-circle-btn ${isClosed ? 'circle-green' : lead.nextActivity?.completed ? 'circle-green' : 'circle-arrow'}`}
                                  title="Ver actividad y atribución"
                                >
                                  {isClosed ? (
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                  ) : lead.nextActivity?.completed ? (
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                  ) : (
                                    <ArrowRight size={14} />
                                  )}
                                </button>

                                {/* POPOVER DE ACTIVIDADES (Idéntico al de la imagen del usuario) */}
                                {isPopoverOpen && (
                                  <div
                                    className="activity-popover-pipedrive animate-fade-in"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="popover-item completed">
                                      <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                                      <div className="popover-text">
                                        <div className="popover-title">
                                          <Phone size={13} className="inline mr-1" /> Follow-up Call
                                        </div>
                                      </div>
                                    </div>

                                    <div className="popover-item pending">
                                      <div className="pending-circle" />
                                      <div className="popover-text">
                                        <div className="popover-title">
                                          <Users size={13} className="inline mr-1" /> Product Demo
                                        </div>
                                        <div className="popover-due text-emerald-400">
                                          Tomorrow at 15:00
                                        </div>
                                      </div>
                                    </div>

                                    {/* Origen First-Touch Atribuido */}
                                    {attributedAd && (
                                      <div className="popover-attribution-box">
                                        <div className="attr-lead-title">
                                          <Target size={13} className="text-cyan-400 inline mr-1" /> Anuncio First-Touch
                                        </div>
                                        <div className="attr-ad-name" title={attributedAd.adName}>
                                          {attributedAd.platform.toUpperCase()} • {attributedAd.adName}
                                        </div>
                                      </div>
                                    )}

                                    {/* Botones de Acción dentro del Popover */}
                                    <div className="popover-actions">
                                      <button
                                        onClick={() => handleOpenDossier(lead)}
                                        className="popover-btn-blue"
                                      >
                                        <Plus size={14} /> Schedule an activity
                                      </button>

                                      {/* Mover de Etapa Directamente */}
                                      <div className="flex gap-1.5 mt-2">
                                        {getPrevStage(lead.lifecycleStatus) && (
                                          <button
                                            onClick={() => {
                                              const prev = getPrevStage(lead.lifecycleStatus);
                                              if (prev) updateLeadStatus(lead.id, prev);
                                              setActiveActivityPopoverLeadId(null);
                                            }}
                                            className="popover-stage-btn"
                                            title="Regresar a etapa anterior"
                                          >
                                            <ArrowLeft size={13} /> Anterior
                                          </button>
                                        )}
                                        {getNextStage(lead.lifecycleStatus) && (
                                          <button
                                            onClick={() => {
                                              const next = getNextStage(lead.lifecycleStatus);
                                              if (next) updateLeadStatus(lead.id, next);
                                              setActiveActivityPopoverLeadId(null);
                                            }}
                                            className="popover-stage-btn stage-next flex-1"
                                            title="Avanzar a siguiente etapa"
                                          >
                                            Avanzar Etapa <ArrowRight size={13} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <div className="stage-empty-placeholder">
                        <span>Sin tratos en esta etapa</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. VISTA EN LISTA DE TRATOS */
        <div className="deals-list-view-container">
          <table className="deals-table">
            <thead>
              <tr>
                <th>Título del Trato</th>
                <th>Empresa / Contacto</th>
                <th>Valor ($)</th>
                <th>Etapa Actual</th>
                <th>Anuncio Origen (First-Touch)</th>
                <th>Próxima Actividad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentClientLeads.map((lead) => {
                const attributedAd = ads.find((a) => a.id === lead.firstTouchAdId);
                return (
                  <tr key={lead.id} onClick={() => handleOpenDossier(lead)} className="table-row-hover">
                    <td className="font-bold text-white">
                      {lead.dealTitle || `${lead.name} deal`}
                    </td>
                    <td>{lead.company || lead.name}</td>
                    <td className="font-mono font-bold text-emerald-400">
                      ${(lead.dealValue || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className="stage-table-badge">
                        {lead.lifecycleStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="text-cyan-400 text-xs">
                      {attributedAd ? attributedAd.adName : 'Directo / Orgánico'}
                    </td>
                    <td>
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <Clock size={12} className="text-slate-500" />
                        {lead.nextActivity ? lead.nextActivity.title : 'Follow-up Call'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDossier(lead);
                        }}
                        className="btn-table-action"
                      >
                        Ver Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. MODAL CREAR NUEVO TRATO (+ Deal) */}
      {showAddDealModal && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-window max-w-600">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  +
                </div>
                <h3 className="modal-title">Crear Nuevo Trato en Pipeline</h3>
              </div>
              <button onClick={() => setShowAddDealModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Título del Trato (Deal Title)*</label>
                <input
                  type="text"
                  placeholder="Ej: Bringit media agency deal"
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Empresa / Cuenta</label>
                  <input
                    type="text"
                    placeholder="Ej: Bringit media agency"
                    value={newDealCompany}
                    onChange={(e) => setNewDealCompany(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre del Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Gómez"
                    value={newDealName}
                    onChange={(e) => setNewDealName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Valor del Trato ($ USD)</label>
                  <input
                    type="number"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Etapa Inicial</label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as LifecycleStatus)}
                    className="form-input"
                  >
                    <option value="nuevo">Qualified (Calificado)</option>
                    <option value="contacto">Contact Made (Contacto)</option>
                    <option value="demo">Demo Scheduled (Cita/Demo)</option>
                    <option value="propuesta">Proposal Made (Propuesta)</option>
                    <option value="cliente_contrato">Negotiations Started (Cierre)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Anuncio Ganador Atribuido (First-Touch)</label>
                <select
                  value={newDealAdId}
                  onChange={(e) => setNewDealAdId(e.target.value)}
                  className="form-input"
                >
                  {ads.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.platform.toUpperCase()}] {a.adName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-deal">
                  Crear Trato en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL DOSSIER DE ATRIBUCIÓN FIRST-TOUCH */}
      {inspectingLead && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-window max-w-700">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                {inspectingLead.avatarUrl ? (
                  <img src={inspectingLead.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-lg">
                    {inspectingLead.name.substring(0, 2)}
                  </div>
                )}
                <div>
                  <h2 className="modal-title">
                    {inspectingLead.dealTitle || `${inspectingLead.name} deal`}
                  </h2>
                  <div className="text-slate-400 text-xs flex items-center gap-2">
                    <span>{inspectingLead.company || inspectingLead.name}</span> • <span>{inspectingLead.phone}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setInspectingLead(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="dossier-body">
              {/* Anuncio Ganador de Origen */}
              {(() => {
                const winningAd = ads.find((a) => a.id === inspectingLead.firstTouchAdId);
                return (
                  <div className="winning-ad-dossier-card">
                    <div className="winning-ad-dossier-header">
                      <Target size={16} className="text-cyan-400" />
                      <span className="font-bold text-sm text-cyan-300">
                        ANUNCIO GANADOR DE ORIGEN (FIRST-TOUCH)
                      </span>
                    </div>

                    {winningAd ? (
                      <div className="winning-ad-dossier-content">
                        <img
                          src={winningAd.creativeUrl}
                          alt={winningAd.adName}
                          className="winning-ad-creative-image"
                        />
                        <div className="winning-ad-details">
                          <span className="platform-pill capitalize">{winningAd.platform} Ads</span>
                          <h4 className="winning-ad-headline">{winningAd.adName}</h4>
                          <p className="winning-ad-copy">"{winningAd.copyExcerpt}"</p>
                          <div className="winning-ad-campaign-tag">
                            Campaña: {winningAd.campaignName}
                          </div>

                          <div className="winning-ad-stats-mini">
                            <div>
                              <span>Inversión en Ad:</span>
                              <strong>${winningAd.spend}</strong>
                            </div>
                            <div>
                              <span>Ventas Totales del Ad:</span>
                              <strong className="text-emerald-400">${winningAd.revenueGenerated.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm">
                        Anuncio ID: {inspectingLead.firstTouchAdId}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Historial de Touchpoints */}
              <div className="touchpoints-section">
                <h4 className="section-subtitle">
                  <Clock size={15} /> Línea de Tiempo de Contactos (Touchpoints)
                </h4>
                <div className="touchpoints-timeline">
                  {inspectingLead.touchpointsHistory.map((tp, idx) => (
                    <div key={tp.id} className="timeline-item">
                      <div className="timeline-marker">{idx + 1}</div>
                      <div className="timeline-content">
                        <div className="timeline-title-row">
                          <span className="timeline-event">
                            {tp.eventType === 'first_click' ? '🎯 Primer Clic Determinante' : '🔄 Re-interacción'}
                          </span>
                          <span className="timeline-date">
                            {new Date(tp.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="timeline-ad-ref">
                          {tp.platform} — <strong>{tp.adName}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actualizador de Valor del Trato */}
              <div className="deal-value-updater-box">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Valor del Trato ($ USD)
                  </label>
                  <p className="text-xs text-slate-400">
                    Al actualizar este valor, se suma automáticamente al ROAS del anuncio original.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={editingDealValue}
                      onChange={(e) => setEditingDealValue(Number(e.target.value))}
                      className="pl-7 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold w-36"
                    />
                  </div>
                  <button onClick={handleSaveDealValue} className="btn-confirm-deal py-2 px-4 text-xs">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS PIPEDRIVE AUTHENTIC DESIGN SYSTEM */}
      <style>{`
        .pipedrive-deals-workspace {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 60px);
          background: #0b0f19;
          overflow: hidden;
        }

        /* 1. Sub-cabecera y Barra de Herramientas */
        .deals-toolbar {
          height: 52px;
          background: #111726;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
          gap: 1rem;
          flex-shrink: 0;
        }

        .toolbar-left-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .view-mode-buttons {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .view-btn {
          width: 32px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .view-btn:hover {
          color: #ffffff;
        }

        .view-btn.active {
          background: #2563eb;
          color: #ffffff;
        }

        /* Botón Verde + Deal de Pipedrive */
        .btn-pipedrive-green {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #00a86b;
          color: #ffffff;
          border: none;
          padding: 0.45rem 0.95rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          box-shadow: 0 2px 6px rgba(0, 168, 107, 0.3);
        }

        .btn-pipedrive-green:hover {
          background: #00935d;
          transform: translateY(-1px);
        }

        .toolbar-right-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pipeline-aggregate-metrics {
          font-size: 0.85rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .total-amount-bold {
          font-weight: 800;
          color: #f8fafc;
        }

        .metric-dot {
          color: #64748b;
        }

        .pipeline-selector-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .pipeline-name-text {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pipeline-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.35rem;
          background: #141c2e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 0.5rem;
          min-width: 240px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 50;
        }

        .dropdown-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #64748b;
          padding: 0.25rem 0.5rem;
          letter-spacing: 0.05em;
        }

        .pipeline-menu-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.45rem 0.65rem;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .pipeline-menu-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .pipeline-menu-item.active {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .toolbar-icon-action {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .toolbar-icon-action:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        /* 2. Contenedor de Pipeline y Chevron Headers */
        .pipeline-stages-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0.5rem 0.75rem 0.5rem 0.75rem;
        }

        .stages-row-header {
          display: grid;
          grid-template-columns: repeat(5, minmax(200px, 1fr));
          gap: 0.45rem;
          margin-bottom: 0.45rem;
          flex-shrink: 0;
        }

        /* Cabecera Chevron Estilo Pipedrive */
        .stage-chevron-header {
          position: relative;
          background: #141b2c;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        }

        .chevron-content {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .stage-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
        }

        .stage-metrics {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        /* 3. Columnas de Tarjetas */
        .stages-columns-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(5, minmax(200px, 1fr));
          gap: 0.45rem;
          overflow-x: auto;
          overflow-y: hidden;
          min-height: 0;
        }

        .stage-column-lane {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .cards-scroll-container {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Tarjeta de Trato Estilo Pipedrive */
        .deal-card-pipedrive {
          background: #1a2236;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          position: relative;
        }

        .deal-card-pipedrive:hover {
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
        }

        .deal-card-pipedrive.won-card {
          background: #142624;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .card-top-indicator {
          height: 3px;
          width: 100%;
        }

        .indicator-meta {
          background: #3b82f6;
        }

        .indicator-won {
          background: #10b981;
        }

        .deal-card-body {
          padding: 0.75rem 0.85rem;
        }

        .deal-title-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.15rem;
          line-height: 1.25;
        }

        .deal-company-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.45rem;
        }

        .won-badge-pill {
          display: inline-block;
          background: #10b981;
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 0.45rem;
        }

        .deal-card-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.4rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .deal-value-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .deal-avatar-mini {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          object-fit: cover;
        }

        .deal-avatar-placeholder {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #334155;
          color: #f1f5f9;
          font-size: 0.65rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .deal-money-amount {
          font-size: 0.8rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        /* Botón Circular de Acción */
        .activity-action-circle-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          background: #0f172a;
          color: #94a3b8;
          transition: all 0.15s ease;
        }

        .activity-action-circle-btn:hover {
          transform: scale(1.15);
        }

        .circle-green {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.35);
          color: #34d399;
        }

        .circle-arrow {
          background: #00a86b;
          border-color: #00a86b;
          color: #ffffff;
        }

        /* POPOVER DE ACTIVIDAD ESTILO PIPEDRIVE */
        .activity-popover-pipedrive {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: #141c2e;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 0.85rem;
          width: 260px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
          z-index: 100;
        }

        .popover-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.45rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pending-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #64748b;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .popover-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .popover-due {
          font-size: 0.7rem;
          font-weight: 600;
          margin-top: 1px;
        }

        .popover-attribution-box {
          margin-top: 0.5rem;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 6px;
          padding: 0.4rem 0.55rem;
        }

        .attr-lead-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #22d3ee;
        }

        .attr-ad-name {
          font-size: 0.72rem;
          color: #cbd5e1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .popover-actions {
          margin-top: 0.65rem;
        }

        .popover-btn-blue {
          width: 100%;
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.4rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          cursor: pointer;
        }

        .popover-stage-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.35rem 0.55rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .popover-stage-btn.stage-next {
          background: #00a86b;
          border-color: #00a86b;
          color: white;
        }

        .stage-empty-placeholder {
          padding: 2rem 1rem;
          text-align: center;
          color: #64748b;
          font-size: 0.75rem;
          font-style: italic;
        }

        /* 4. Vista en Lista */
        .deals-list-view-container {
          flex: 1;
          overflow: auto;
          padding: 1rem;
        }

        .deals-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .deals-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #111726;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .deals-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
        }

        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
        }

        .stage-table-badge {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .btn-table-action {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* 5. Modales */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .modal-window {
          background: #131929;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }

        .max-w-600 {
          max-w: 600px;
        }

        .max-w-700 {
          max-width: 700px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .modal-close-btn {
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .modal-close-btn:hover {
          color: white;
        }

        .modal-form {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #cbd5e1;
        }

        .form-input {
          background: #0d121e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 0.55rem 0.85rem;
          color: #f8fafc;
          font-size: 0.85rem;
          outline: none;
        }

        .form-input:focus {
          border-color: #3b82f6;
        }

        .modal-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-confirm-deal {
          background: #00a86b;
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-confirm-deal:hover {
          background: #00935d;
        }

        .dossier-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 80vh;
          overflow-y: auto;
        }

        .winning-ad-dossier-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          padding: 1rem;
        }

        .winning-ad-dossier-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .winning-ad-dossier-content {
          display: flex;
          gap: 1rem;
        }

        .winning-ad-creative-image {
          width: 110px;
          height: 110px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .winning-ad-details {
          flex: 1;
        }

        .platform-pill {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .winning-ad-headline {
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          margin: 0.25rem 0;
        }

        .winning-ad-copy {
          font-size: 0.75rem;
          color: #94a3b8;
          font-style: italic;
        }

        .winning-ad-campaign-tag {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.35rem;
        }

        .winning-ad-stats-mini {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #cbd5e1;
        }

        .touchpoints-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 1rem;
        }

        .section-subtitle {
          font-size: 0.85rem;
          font-weight: 700;
          color: #e2e8f0;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .touchpoints-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .timeline-item {
          display: flex;
          gap: 0.75rem;
        }

        .timeline-marker {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          font-size: 0.68rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .timeline-content {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          padding: 0.4rem 0.65rem;
          flex: 1;
        }

        .timeline-title-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }

        .timeline-date {
          color: #64748b;
          font-weight: normal;
        }

        .timeline-ad-ref {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .deal-value-updater-box {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};
