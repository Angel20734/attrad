import React, { useState } from 'react';
import { useAttrad } from '../../context/AttradContext';
import { AdItem, AdSortField } from '../../types/ad';
import {
  ExternalLink,
  Award,
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClientReportModal } from '../reports/ClientReportModal';

export const AdHub: React.FC = () => {
  const {
    currentClientAds,
    currentClientLeads,
    selectedPlatform,
    setSelectedPlatform,
    toggleAdStatus,
    activeClientSpace,
  } = useAttrad();

  const [sortField, setSortField] = useState<AdSortField>('revenue');
  const [adToToggleConfirm, setAdToToggleConfirm] = useState<AdItem | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [expandedAdBuyers, setExpandedAdBuyers] = useState<Record<string, boolean>>({
    'ad-05': true, // Abierto por defecto en el ganador
  });

  // Filtrado por plataforma
  const filteredAds = currentClientAds.filter((ad) => {
    if (selectedPlatform === 'all') return true;
    return ad.platform === selectedPlatform;
  });

  // Ordenamiento por ranking
  const sortedAds = [...filteredAds].sort((a, b) => {
    if (sortField === 'leads') return b.leadsGenerated - a.leadsGenerated;
    if (sortField === 'revenue') return b.revenueGenerated - a.revenueGenerated;
    if (sortField === 'cpl') return a.costPerLead - b.costPerLead;
    if (sortField === 'daysActive') return b.daysActive - a.daysActive;
    return 0;
  });

  // Cálculos globales
  const totalSpend = currentClientAds.reduce((acc, ad) => acc + ad.spend, 0);
  const totalRevenue = currentClientAds.reduce((acc, ad) => acc + ad.revenueGenerated, 0);
  const totalLeads = currentClientAds.reduce((acc, ad) => acc + ad.leadsGenerated, 0);
  const globalROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '0';

  const handleToggleClick = (ad: AdItem) => {
    // Si el anuncio es el que más dinero genera y está activo, Ad Guardian avisa
    if (ad.status === 'active' && ad.revenueGenerated > 5000) {
      setAdToToggleConfirm(ad);
    } else {
      toggleAdStatus(ad.id);
    }
  };

  const toggleBuyersList = (adId: string) => {
    setExpandedAdBuyers((prev) => ({ ...prev, [adId]: !prev[adId] }));
  };

  return (
    <>
      <div className="adhub-container animate-fade-in">
        {/* Header con Métricas Globales de Rendimiento y Atribución */}
        <div className="adhub-header">
          <div>
            <div className="company-badge">
              <span className="badge-emoji">{activeClientSpace?.logoEmoji || '🏢'}</span>
              {activeClientSpace?.name || 'Cliente'} • Supervisión de Anuncios
            </div>
            <h1 className="adhub-title">Supervisión & Atribución de Anuncios</h1>
            <p className="adhub-subtitle">
              Descubre con certeza matemática qué anuncio de Meta, Google o TikTok atrajo a cada comprador final de tu cliente.
            </p>
          </div>

          {/* Botón Reporte y Métricas Resumen */}
          <div className="header-right-actions">
            <button
              onClick={() => setShowReportModal(true)}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <FileText size={16} /> Generar Reporte de Cliente
            </button>

            <div className="summary-pills">
              <div className="summary-pill">
                <span className="summary-pill-label">Inversión Ads</span>
                <span className="summary-pill-val">${totalSpend.toLocaleString()}</span>
              </div>
              <div className="summary-pill">
                <span className="summary-pill-label">Leads Captados</span>
                <span className="summary-pill-val text-cyan-400">{totalLeads}</span>
              </div>
              <div className="summary-pill highlight-success">
                <span className="summary-pill-label">Ventas Cerradas</span>
                <span className="summary-pill-val text-emerald-400">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="summary-pill highlight-cyan">
                <span className="summary-pill-label">ROAS Comercial</span>
                <span className="summary-pill-val text-cyan-400">{globalROAS}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Preventivo de Ad Guardian */}
        <div className="guardian-banner">
          <div className="guardian-banner-icon">
            <Sparkles size={24} className="text-yellow-400" />
          </div>
          <div className="guardian-banner-content">
            <div className="guardian-banner-title">
              <span>Ad Guardian Intelligence</span>: Protección de Anuncios Rentables
            </div>
            <div className="guardian-banner-desc">
              El <strong>60% de los ingresos cerrados de este cliente ($24,500)</strong> provienen exclusivamente del{' '}
              <strong>Ad #5 (Instagram / Penthouse Rivas)</strong>. Los compradores han confirmado que este anuncio fue su primer contacto. ¡No lo pauses para no frenar sus cierres!
            </div>
          </div>
        </div>

        {/* Barra de Filtros por Red y Ordenamiento */}
        <div className="filters-bar">
          <div className="platform-tabs">
            <button
              className={`platform-tab ${selectedPlatform === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('all')}
            >
              Todas las Redes ({currentClientAds.length})
            </button>
            <button
              className={`platform-tab ${selectedPlatform === 'facebook' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('facebook')}
            >
              Facebook Ads
            </button>
            <button
              className={`platform-tab ${selectedPlatform === 'instagram' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('instagram')}
            >
              Instagram Ads
            </button>
            <button
              className={`platform-tab ${selectedPlatform === 'tiktok' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('tiktok')}
            >
              TikTok Ads
            </button>
            <button
              className={`platform-tab ${selectedPlatform === 'google' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('google')}
            >
              Google Ads
            </button>
          </div>

          <div className="sort-selector-group">
            <span className="sort-label">Ordenar Ranking por:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as AdSortField)}
              className="sort-select"
            >
              <option value="revenue">1º Ventas Cerradas ($ Facturado)</option>
              <option value="leads">2º Leads Generados (Volumen)</option>
              <option value="cpl">3º Costo por Lead (CPL más bajo)</option>
              <option value="daysActive">4º Días en Circulación</option>
            </select>
          </div>
        </div>

        {/* Lista de Anuncios con Rankings */}
        <div className="ads-grid">
          {sortedAds.map((ad, index) => {
            const isTopWinner = ad.revenueGenerated >= 20000;
            const isPaused = ad.status === 'paused';
            const adBuyers = currentClientLeads.filter(
              (l) => l.firstTouchAdId === ad.id && l.lifecycleStatus === 'cliente_contrato'
            );
            const isBuyersExpanded = expandedAdBuyers[ad.id];

            return (
              <div
                key={ad.id}
                className={`ad-card ${isTopWinner ? 'ad-card-winner' : ''} ${isPaused ? 'ad-card-paused' : ''}`}
              >
                {/* Badge de Posición en el Ranking */}
                <div className="ad-card-top-bar">
                  <div className="ranking-position-badge">
                    {index === 0 ? (
                      <span className="badge-rank gold">
                        <Award size={14} /> #1 Top Rendimiento
                      </span>
                    ) : index === 1 ? (
                      <span className="badge-rank silver">
                        <Award size={14} /> #2 Lugar
                      </span>
                    ) : (
                      <span className="badge-rank normal">#{index + 1} Ranking</span>
                    )}
                    <span className="platform-tag">
                      {ad.platform === 'facebook' && 'Meta Facebook'}
                      {ad.platform === 'instagram' && 'Instagram Ads'}
                      {ad.platform === 'tiktok' && 'TikTok Ads'}
                      {ad.platform === 'google' && 'Google Search'}
                    </span>
                  </div>

                  <div className="days-active-tag">
                    <Clock size={13} />
                    <span>{ad.daysActive} días activo</span>
                  </div>
                </div>

                {/* Contenido Creativo */}
                <div className="ad-card-body">
                  <div className="creative-preview-box">
                    <img src={ad.creativeUrl} alt={ad.adName} className="creative-image" />
                    <a
                      href={ad.externalPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-link-badge"
                      title="Ver anuncio real en vivo en la red social"
                    >
                      <ExternalLink size={12} />
                      Ver en {ad.platform}
                    </a>
                  </div>

                  <div className="ad-info-box">
                    <h3 className="ad-name-title">{ad.adName}</h3>
                    <div className="campaign-tag">{ad.campaignName}</div>
                    <p className="headline-text">"{ad.headline}"</p>
                    <p className="copy-excerpt">{ad.copyExcerpt}</p>
                  </div>
                </div>

                {/* Las 4 Métricas de Ranking */}
                <div className="ranking-metrics-grid">
                  <div className="ranking-metric-item">
                    <span className="metric-rank-num">1º</span>
                    <div className="metric-content">
                      <span className="metric-label">Leads Generados</span>
                      <span className="metric-value font-bold text-cyan-400">
                        {ad.leadsGenerated}
                      </span>
                    </div>
                  </div>

                  <div className="ranking-metric-item highlight-metric">
                    <span className="metric-rank-num">2º</span>
                    <div className="metric-content">
                      <span className="metric-label">Ventas Cerradas ($)</span>
                      <span className="metric-value font-bold text-emerald-400">
                        ${ad.revenueGenerated.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="ranking-metric-item">
                    <span className="metric-rank-num">3º</span>
                    <div className="metric-content">
                      <span className="metric-label">Costo por Lead</span>
                      <span className="metric-value font-bold text-slate-200">
                        ${ad.costPerLead.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="ranking-metric-item">
                    <span className="metric-rank-num">4º</span>
                    <div className="metric-content">
                      <span className="metric-label">Inversión Real</span>
                      <span className="metric-value font-bold text-slate-200">
                        ${ad.spend.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección Desplegable: Compradores Traídos por este Anuncio */}
                <div className="ad-buyers-accordion">
                  <button
                    onClick={() => toggleBuyersList(ad.id)}
                    className="buyers-accordion-toggle"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-cyan-400" />
                      <span className="font-bold text-xs text-slate-200">
                        Compradores Cerrados por este Anuncio ({adBuyers.length})
                      </span>
                    </div>
                    {isBuyersExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isBuyersExpanded && (
                    <div className="buyers-list-content">
                      {adBuyers.length > 0 ? (
                        adBuyers.map((b) => (
                          <div key={b.id} className="buyer-item-row">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-emerald-400" />
                              <span className="buyer-name">{b.name}</span>
                            </div>
                            <span className="buyer-deal-val font-mono">
                              +${b.dealValue.toLocaleString()} USD
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="no-buyers-msg">
                          Aún sin contratos cerrados atribuidos a este anuncio.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer de la Tarjeta con Interruptor de Pausa */}
                <div className="ad-card-footer">
                  <div className="status-indicator">
                    <span className={`status-dot ${isPaused ? 'paused' : 'active'}`} />
                    <span className="status-text">{isPaused ? 'Pausado' : 'En Circulación'}</span>
                  </div>

                  <button
                    onClick={() => handleToggleClick(ad)}
                    className={`btn btn-sm ${isPaused ? 'btn-success' : 'btn-secondary'}`}
                  >
                    {isPaused ? (
                      <>
                        <Play size={14} /> Reanudar Anuncio
                      </>
                    ) : (
                      <>
                        <Pause size={14} /> Pausar Anuncio
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Advertencia Ad Guardian */}
        {adToToggleConfirm && (
          <div className="modal-backdrop animate-fade-in">
            <div className="modal-window max-w-550">
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h2 className="modal-title">¿Pausar este Anuncio Rentable?</h2>
                    <p className="modal-subtitle">Alerta de Seguridad: Ad Guardian</p>
                  </div>
                </div>
              </div>

              <div className="py-3 text-slate-300 text-sm leading-relaxed">
                El anuncio <strong>"{adToToggleConfirm.adName}"</strong> es responsable de{' '}
                <strong className="text-emerald-400">
                  ${adToToggleConfirm.revenueGenerated.toLocaleString()} USD
                </strong>{' '}
                en contratos cerrados. Pausarlo detendrá el flujo de compradores hacia tu cliente.
              </div>

              <div className="modal-actions">
                <button onClick={() => setAdToToggleConfirm(null)} className="btn btn-secondary">
                  Mantener Activo (Recomendado)
                </button>
                <button
                  onClick={() => {
                    toggleAdStatus(adToToggleConfirm.id);
                    setAdToToggleConfirm(null);
                  }}
                  className="btn btn-danger"
                >
                  Confirmar y Pausar de Todos Modos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showReportModal && <ClientReportModal onClose={() => setShowReportModal(false)} />}

      <style>{`
        .adhub-container {
          padding: 2rem 1.5rem;
          max-width: 1750px;
          margin: 0 auto;
        }
        .adhub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .company-badge {
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
        .badge-emoji {
          font-size: 0.95rem;
        }
        .adhub-title {
          font-family: var(--font-heading, sans-serif);
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 0.35rem;
        }
        .adhub-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          max-width: 750px;
        }
        .header-right-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.85rem;
        }
        .summary-pills {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .summary-pill {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.5rem 0.85rem;
          display: flex;
          flex-direction: column;
        }
        .summary-pill-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
        }
        .summary-pill-val {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
        }
        .guardian-banner {
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: 16px;
          padding: 1.15rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 1.15rem;
          margin-bottom: 2rem;
        }
        .guardian-banner-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }
        .guardian-banner-title span {
          color: #fbbf24;
        }
        .guardian-banner-desc {
          font-size: 0.82rem;
          color: #cbd5e1;
        }
        .filters-bar {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 0.65rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .platform-tabs {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .platform-tab {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .platform-tab:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }
        .platform-tab.active {
          color: #ffffff;
          background: #6366f1;
        }
        .sort-selector-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .sort-label {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .sort-select {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-radius: 8px;
          padding: 0.4rem 0.75rem;
          font-size: 0.82rem;
        }
        .ads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
          gap: 1.5rem;
        }
        .ad-card {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ad-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .ad-card-winner {
          border-color: rgba(245, 158, 11, 0.4);
          background: linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, rgba(15, 23, 42, 0.85) 100%);
        }
        .ad-card-paused {
          opacity: 0.65;
        }
        .ad-card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ranking-position-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .badge-rank {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 800;
        }
        .badge-rank.gold {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .badge-rank.silver {
          background: rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
        }
        .badge-rank.normal {
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
        }
        .platform-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .days-active-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .ad-card-body {
          display: flex;
          gap: 1.15rem;
        }
        .creative-preview-box {
          position: relative;
          width: 140px;
          height: 140px;
          flex-shrink: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .creative-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .external-link-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          right: 6px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.25rem 0.4rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          text-decoration: none;
        }
        .external-link-badge:hover {
          background: rgba(6, 182, 212, 0.9);
          color: #080d1a;
        }
        .ad-info-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          overflow: hidden;
        }
        .ad-name-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.25;
        }
        .campaign-tag {
          font-size: 0.68rem;
          color: #06b6d4;
          font-family: monospace;
        }
        .headline-text {
          font-size: 0.78rem;
          color: #cbd5e1;
          font-weight: 600;
        }
        .copy-excerpt {
          font-size: 0.72rem;
          color: #94a3b8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ranking-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 0.75rem;
          gap: 0.5rem;
        }
        .ranking-metric-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .metric-rank-num {
          font-size: 0.75rem;
          font-weight: 800;
          color: #6366f1;
        }
        .metric-content {
          display: flex;
          flex-direction: column;
        }
        .metric-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .metric-value {
          font-size: 0.95rem;
        }
        .ad-buyers-accordion {
          background: rgba(10, 15, 30, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          overflow: hidden;
        }
        .buyers-accordion-toggle {
          width: 100%;
          padding: 0.65rem 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
        }
        .buyers-accordion-toggle:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .buyers-list-content {
          padding: 0.5rem 0.85rem 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .buyer-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          background: rgba(30, 41, 59, 0.35);
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
        }
        .buyer-name {
          color: #f1f5f9;
          font-weight: 600;
        }
        .buyer-deal-val {
          color: #34d399;
          font-weight: 700;
        }
        .no-buyers-msg {
          font-size: 0.72rem;
          color: #64748b;
          font-style: italic;
        }
        .ad-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .status-dot.paused {
          background: #64748b;
        }
        .status-text {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }
      `}</style>
    </>
  );
};
