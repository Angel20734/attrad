import React from 'react';
import { useAttrad } from '../../context/AttradContext';
import {
  FileText,
  Printer,
  X,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface ClientReportModalProps {
  onClose: () => void;
}

export const ClientReportModal: React.FC<ClientReportModalProps> = ({ onClose }) => {
  const { activeClientSpace, currentClientAds, currentClientLeads, currentUser } = useAttrad();

  if (!activeClientSpace) return null;

  // Filtrar compradores cerrados
  const closedLeads = currentClientLeads.filter((l) => l.lifecycleStatus === 'cliente_contrato');
  const totalRevenue = closedLeads.reduce((acc, l) => acc + l.dealValue, 0);
  const totalSpend = currentClientAds.reduce((acc, a) => acc + a.spend, 0);
  const globalROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '0.0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-modal-backdrop animate-fade-in">
      <div className="report-modal-window">
        {/* Barra superior de controles del modal */}
        <div className="report-modal-controls no-print">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <FileText size={16} />
            Vista Previa de Reporte Ejecutivo para Cliente
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} /> Imprimir / Exportar a PDF
            </button>
            <button onClick={onClose} className="btn btn-icon btn-secondary btn-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL REPORTE IMPRIMIBLE */}
        <div className="printable-report-content">
          {/* Encabezado Formal */}
          <div className="report-header">
            <div className="report-branding">
              <div className="report-agency-title">
                {currentUser?.name?.split('(')[0]?.trim() || 'Agencia de Marketing'}
              </div>
              <div className="report-badge-sub">Reporte de Inteligencia & Atribución First-Touch</div>
            </div>

            <div className="report-meta">
              <div className="client-target-name">
                {activeClientSpace.logoEmoji} {activeClientSpace.name}
              </div>
              <div className="report-date">
                Periodo: <strong>Octubre 2026</strong> | Generado el 25/10/2026
              </div>
            </div>
          </div>

          <div className="report-divider" />

          {/* Resumen Ejecutivo de Métricas Clave */}
          <div className="report-summary-boxes">
            <div className="summary-box">
              <span className="box-title">Inversión en Anuncios</span>
              <span className="box-number">${totalSpend.toLocaleString()} USD</span>
              <span className="box-detail">Meta, Google & TikTok</span>
            </div>
            <div className="summary-box">
              <span className="box-title">Leads Calificados</span>
              <span className="box-number text-cyan">{currentClientLeads.length}</span>
              <span className="box-detail">Prospectos directos</span>
            </div>
            <div className="summary-box">
              <span className="box-title">Contratos Cerrados</span>
              <span className="box-number text-green">{closedLeads.length} clientes</span>
              <span className="box-detail">100% Atribuidos</span>
            </div>
            <div className="summary-box highlight-box">
              <span className="box-title">Facturación Generada</span>
              <span className="box-number text-gold">${totalRevenue.toLocaleString()} USD</span>
              <span className="box-detail">ROAS Global: {globalROAS}x retorno</span>
            </div>
          </div>

          {/* Sección Principal: Por qué Anuncios Entraron las Ventas */}
          <div className="report-section">
            <h3 className="section-title">
              <Award size={18} className="text-yellow-400" />
              Rendimiento & Atribución de Ventas por Anuncio
            </h3>
            <p className="section-description">
              Desglose transparente que demuestra exactamente cuánto dinero en ventas y cuántos contratos generó cada anuncio específico en circulación.
            </p>

            <div className="ads-report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Anuncio / Campaña</th>
                    <th>Red Publicitaria</th>
                    <th>Inversión</th>
                    <th>Leads</th>
                    <th>Ventas Cerradas ($)</th>
                    <th>Retorno (ROAS)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClientAds.map((ad) => {
                    const adROAS = ad.spend > 0 ? (ad.revenueGenerated / ad.spend).toFixed(1) : '0.0';
                    return (
                      <tr key={ad.id} className={ad.id === 'ad-05' ? 'row-winner' : ''}>
                        <td>
                          <div className="table-ad-cell">
                            <img src={ad.creativeUrl} alt={ad.adName} className="table-ad-thumb" />
                            <div>
                              <strong className="ad-cell-name">{ad.adName}</strong>
                              <span className="ad-cell-sub">{ad.campaignName}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="platform-tag capitalize">{ad.platform} Ads</span>
                        </td>
                        <td>${ad.spend.toLocaleString()}</td>
                        <td className="font-bold">{ad.leadsGenerated}</td>
                        <td className="font-bold text-green">${ad.revenueGenerated.toLocaleString()}</td>
                        <td>
                          <span className="roas-pill">{adROAS}x</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sección: Compradores Finales Cerrados */}
          <div className="report-section">
            <h3 className="section-title">
              <CheckCircle2 size={18} className="text-green-400" />
              Auditoría de Compradores Finales Cerrados
            </h3>
            <p className="section-description">
              Lista de contratos cerrados con su respectivo anuncio de origen (First-Touch Attribution).
            </p>

            <div className="buyers-grid">
              {closedLeads.map((buyer) => {
                const attributedAd = currentClientAds.find((a) => a.id === buyer.firstTouchAdId);
                return (
                  <div key={buyer.id} className="buyer-card">
                    <div className="buyer-card-top">
                      <div className="buyer-info">
                        <strong>{buyer.name}</strong>
                        <span>{buyer.email}</span>
                      </div>
                      <div className="buyer-deal-amount">
                        +${buyer.dealValue.toLocaleString()} USD
                      </div>
                    </div>
                    <div className="buyer-attribution-info">
                      <span className="attr-label">Atribuido a Anuncio:</span>
                      <span className="attr-ad-name">
                        🎯 {attributedAd?.adName || buyer.firstTouchAdId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie de Reporte */}
          <div className="report-footer">
            <p>
              Reporte de Atribución First-Touch generado automáticamente por la infraestructura publicitaria de ATTRAD.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .report-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 250;
          padding: 1.5rem;
        }
        .report-modal-window {
          width: 100%;
          max-width: 950px;
          max-height: 92vh;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
        }
        .report-modal-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.75rem;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .printable-report-content {
          padding: 2.5rem;
          background: #ffffff;
          color: #0f172a;
          border-radius: 0 0 20px 20px;
        }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .report-agency-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: -0.02em;
        }
        .report-badge-sub {
          font-size: 0.85rem;
          color: #6366f1;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .client-target-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          text-align: right;
        }
        .report-date {
          font-size: 0.8rem;
          color: #64748b;
          text-align: right;
        }
        .report-divider {
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #06b6d4, transparent);
          margin: 1.5rem 0 2rem;
        }
        .report-summary-boxes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .summary-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .highlight-box {
          background: #ecfeff;
          border-color: #a5f3fc;
        }
        .box-title {
          font-size: 0.72rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .box-number {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
        }
        .box-detail {
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .text-cyan {
          color: #0891b2;
        }
        .text-green {
          color: #059669;
        }
        .text-gold {
          color: #b45309;
        }
        .report-section {
          margin-bottom: 2.25rem;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }
        .section-description {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
        }
        .ads-report-table-wrapper {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }
        .report-table th {
          background: #f1f5f9;
          padding: 0.85rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #e2e8f0;
        }
        .report-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .row-winner {
          background: #f0fdf4;
        }
        .table-ad-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .table-ad-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
        }
        .ad-cell-name {
          color: #0f172a;
          display: block;
        }
        .ad-cell-sub {
          font-size: 0.72rem;
          color: #64748b;
        }
        .platform-tag {
          font-size: 0.75rem;
          font-weight: 600;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .roas-pill {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
        }
        .buyers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .buyer-card {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          background: #f8fafc;
        }
        .buyer-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.65rem;
        }
        .buyer-info strong {
          display: block;
          color: #0f172a;
          font-size: 0.92rem;
        }
        .buyer-info span {
          font-size: 0.75rem;
          color: #64748b;
        }
        .buyer-deal-amount {
          font-size: 1rem;
          font-weight: 800;
          color: #059669;
        }
        .buyer-attribution-info {
          border-top: 1px dashed #cbd5e1;
          padding-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .attr-label {
          font-size: 0.68rem;
          color: #64748b;
          text-transform: uppercase;
        }
        .attr-ad-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #4338ca;
        }
        .report-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
        }

        /* ESTILOS DE IMPRESIÓN */
        @media print {
          .no-print {
            display: none !important;
          }
          .report-modal-backdrop {
            position: static;
            padding: 0;
            background: none;
          }
          .report-modal-window {
            max-width: 100%;
            border: none;
            box-shadow: none;
            max-height: none;
          }
          .printable-report-content {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};
