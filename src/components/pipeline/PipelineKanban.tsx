import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import { LifecycleStatus, Lead } from '../../types/lead';
import {
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  X,
  Clock,
} from 'lucide-react';

interface StageConfig {
  status: LifecycleStatus;
  title: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

const STAGES: StageConfig[] = [
  {
    status: 'nuevo',
    title: 'Nuevo Prospecto',
    badgeClass: 'badge-info',
    dotColor: '#38bdf8',
    description: 'Entraron recientemente por clic en anuncios',
  },
  {
    status: 'potencial',
    title: 'Potencial Calificado',
    badgeClass: 'badge-warning',
    dotColor: '#fbbf24',
    description: 'En negociación / Propuesta comercial enviada',
  },
  {
    status: 'cliente_contrato',
    title: 'Cliente con Contrato Cerrado',
    badgeClass: 'badge-success',
    dotColor: '#34d399',
    description: 'Ventas y contratos cerrados ($ Facturado)',
  },
  {
    status: 'inactivo',
    title: 'Inactivo / Descartado',
    badgeClass: 'badge-danger',
    dotColor: '#f87171',
    description: 'Sin presupuesto o no calificado',
  },
];

export const PipelineKanban: React.FC = () => {
  const {
    currentClientLeads,
    ads,
    updateLeadStatus,
    updateLeadDealValue,
    activeClientSpace,
  } = useAttrad();

  const [inspectingLead, setInspectingLead] = useState<Lead | null>(null);
  const [editingDealValue, setEditingDealValue] = useState<number>(0);

  const getNextStage = (current: LifecycleStatus): LifecycleStatus | null => {
    if (current === 'nuevo') return 'potencial';
    if (current === 'potencial') return 'cliente_contrato';
    return null;
  };

  const getPrevStage = (current: LifecycleStatus): LifecycleStatus | null => {
    if (current === 'cliente_contrato') return 'potencial';
    if (current === 'potencial') return 'nuevo';
    return null;
  };

  const handleOpenDossier = (lead: Lead) => {
    setInspectingLead(lead);
    setEditingDealValue(lead.dealValue);
  };

  const handleSaveDealValue = () => {
    if (inspectingLead) {
      updateLeadDealValue(inspectingLead.id, editingDealValue);
      setInspectingLead({ ...inspectingLead, dealValue: editingDealValue });
    }
  };

  return (
    <div className="pipeline-container animate-fade-in">
      <div className="pipeline-header">
        <div>
          <div className="client-context-badge">
            {activeClientSpace?.logoEmoji} Pipeline Comercial de {activeClientSpace?.name || 'Cliente'}
          </div>
          <h1 className="pipeline-title">Atribución de Compradores & Conversión</h1>
          <p className="pipeline-subtitle">
            Rastrea el avance de los compradores finales y verifica exactamente qué anuncio originó cada contrato cerrado.
          </p>
        </div>

        <div className="pipeline-roas-pill">
          <Sparkles size={16} className="text-cyan-400" />
          <span>Cada contrato cerrado retroalimenta el ROAS del anuncio original en tiempo real.</span>
        </div>
      </div>

      {/* Columnas Kanban */}
      <div className="kanban-grid">
        {STAGES.map((stage) => {
          const stageLeads = currentClientLeads.filter((l) => l.lifecycleStatus === stage.status);
          const stageTotalRevenue = stageLeads.reduce((acc, l) => acc + l.dealValue, 0);

          return (
            <div key={stage.status} className="kanban-column">
              {/* Encabezado de Columna */}
              <div className="column-header">
                <div className="column-header-title-row">
                  <span className="dot" style={{ background: stage.dotColor }} />
                  <h3 className="column-title">{stage.title}</h3>
                  <span className="badge badge-count">{stageLeads.length}</span>
                </div>
                <div className="column-subtitle">{stage.description}</div>
                {stageTotalRevenue > 0 && (
                  <div className="column-total-amount">
                    <DollarSign size={13} /> ${stageTotalRevenue.toLocaleString()} USD
                  </div>
                )}
              </div>

              {/* Lista de Tarjetas */}
              <div className="column-cards-list">
                {stageLeads.map((lead) => {
                  const attributedAd = ads.find((a) => a.id === lead.firstTouchAdId);
                  const next = getNextStage(lead.lifecycleStatus);
                  const prev = getPrevStage(lead.lifecycleStatus);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => handleOpenDossier(lead)}
                      className={`lead-card ${lead.lifecycleStatus === 'cliente_contrato' ? 'closed-card' : ''}`}
                    >
                      <div className="lead-card-top">
                        <div className="lead-card-user">
                          {lead.avatarUrl ? (
                            <img src={lead.avatarUrl} alt={lead.name} className="lead-card-avatar" />
                          ) : (
                            <div className="lead-card-avatar-placeholder">
                              {lead.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="lead-card-name">{lead.name}</div>
                            <div className="lead-card-location">{lead.city || 'Contacto Online'}</div>
                          </div>
                        </div>

                        {lead.dealValue > 0 && (
                          <div className="lead-card-value font-mono">
                            ${lead.dealValue.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Badge Destacado de Anuncio Ganador (First-Touch) */}
                      {attributedAd && (
                        <div className="attribution-badge-box">
                          <img
                            src={attributedAd.creativeUrl}
                            alt="Miniatura de Anuncio"
                            className="attr-mini-thumb"
                          />
                          <div className="attr-text-col">
                            <span className="attr-origin-label">
                              🎯 Anuncio de Origen ({attributedAd.platform})
                            </span>
                            <span className="attr-ad-title" title={attributedAd.adName}>
                              {attributedAd.adName}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Botones de Mover Etapa */}
                      <div className="lead-card-footer" onClick={(e) => e.stopPropagation()}>
                        {prev ? (
                          <button
                            onClick={() => updateLeadStatus(lead.id, prev)}
                            className="btn btn-icon btn-secondary btn-xs"
                            title={`Mover a etapa anterior`}
                          >
                            <ArrowLeft size={13} />
                          </button>
                        ) : <div />}

                        <button
                          onClick={() => handleOpenDossier(lead)}
                          className="btn btn-secondary btn-xs dossier-btn"
                        >
                          Ver Atribución First-Touch
                        </button>

                        {next && (
                          <button
                            onClick={() => updateLeadStatus(lead.id, next)}
                            className="btn btn-primary btn-xs"
                            title={`Avanzar a siguiente etapa`}
                          >
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="empty-column-box">
                    <span>Sin prospectos en esta etapa</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DOSSIER DE ATRIBUCIÓN FIRST-TOUCH */}
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
                  <h2 className="modal-title">{inspectingLead.name}</h2>
                  <div className="text-slate-400 text-xs flex items-center gap-2">
                    <span>{inspectingLead.email}</span> • <span>{inspectingLead.phone}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setInspectingLead(null)} className="btn btn-icon btn-secondary">
                <X size={18} />
              </button>
            </div>

            <div className="dossier-body">
              {/* Sección de Atribución del Anuncio */}
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

              {/* Valor del Contrato / Venta Cerrada */}
              <div className="deal-value-updater-box">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Monto de Venta / Contrato Cerrado ($ USD)
                  </label>
                  <p className="text-xs text-slate-400">
                    Este monto se suma automáticamente a la facturación generada por el anuncio de origen.
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
                  <button onClick={handleSaveDealValue} className="btn btn-primary btn-sm">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pipeline-container {
          padding: 2rem 1.5rem;
          max-width: 1750px;
          margin: 0 auto;
        }
        .pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .client-context-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: #22d3ee;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .pipeline-title {
          font-family: var(--font-heading, sans-serif);
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 0.35rem;
        }
        .pipeline-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
        }
        .pipeline-roas-pill {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.65rem 1.15rem;
          border-radius: 12px;
          font-size: 0.82rem;
          color: #cbd5e1;
        }
        .kanban-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          align-items: flex-start;
        }
        @media (max-width: 1200px) {
          .kanban-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .kanban-grid {
            grid-template-columns: 1fr;
          }
        }
        .kanban-column {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .column-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 0.85rem;
        }
        .column-header-title-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.25rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .column-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
        }
        .badge-count {
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 700;
          margin-left: auto;
        }
        .column-subtitle {
          font-size: 0.75rem;
          color: #64748b;
        }
        .column-total-amount {
          margin-top: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.85rem;
          font-weight: 800;
          color: #34d399;
        }
        .column-cards-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          min-height: 250px;
        }
        .lead-card {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .lead-card:hover {
          background: rgba(30, 41, 59, 0.95);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
        .closed-card {
          border-left: 3px solid #34d399;
        }
        .lead-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .lead-card-user {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .lead-card-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }
        .lead-card-avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #475569;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lead-card-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: #f1f5f9;
        }
        .lead-card-location {
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .lead-card-value {
          font-size: 0.9rem;
          font-weight: 800;
          color: #34d399;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }
        .attribution-badge-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(10, 15, 30, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 8px;
          padding: 0.45rem 0.6rem;
        }
        .attr-mini-thumb {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
        }
        .attr-text-col {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .attr-origin-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #22d3ee;
          text-transform: uppercase;
        }
        .attr-ad-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #cbd5e1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lead-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .dossier-btn {
          font-size: 0.72rem;
          padding: 0.2rem 0.5rem;
        }
        .empty-column-box {
          padding: 2.5rem 1rem;
          text-align: center;
          color: #64748b;
          font-size: 0.8rem;
          border: 1px dashed rgba(255, 255, 255, 0.06);
          border-radius: 10px;
        }

        /* Modal Dossier */
        .max-w-700 {
          max-width: 700px;
        }
        .dossier-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .winning-ad-dossier-card {
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 14px;
          padding: 1.25rem;
        }
        .winning-ad-dossier-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
        }
        .winning-ad-dossier-content {
          display: flex;
          gap: 1.25rem;
        }
        .winning-ad-creative-image {
          width: 140px;
          height: 140px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .winning-ad-details {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .platform-pill {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #22d3ee;
          background: rgba(6, 182, 212, 0.2);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
        }
        .winning-ad-headline {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }
        .winning-ad-copy {
          font-size: 0.8rem;
          color: #94a3b8;
          font-style: italic;
        }
        .winning-ad-campaign-tag {
          font-size: 0.72rem;
          color: #64748b;
        }
        .winning-ad-stats-mini {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
          font-size: 0.8rem;
        }
        .winning-ad-stats-mini div {
          display: flex;
          flex-direction: column;
        }
        .winning-ad-stats-mini span {
          font-size: 0.68rem;
          color: #64748b;
        }
        .touchpoints-section {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 1.15rem;
        }
        .section-subtitle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 0.85rem;
        }
        .touchpoints-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .timeline-item {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
        }
        .timeline-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #6366f1;
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .timeline-content {
          background: rgba(30, 41, 59, 0.5);
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          flex: 1;
        }
        .timeline-title-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        .timeline-event {
          font-weight: 700;
          color: #f1f5f9;
        }
        .timeline-date {
          color: #64748b;
        }
        .timeline-ad-ref {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .deal-value-updater-box {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 12px;
          padding: 1.15rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }
      `}</style>
    </div>
  );
};
