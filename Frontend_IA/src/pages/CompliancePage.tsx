import { useEffect, useState } from 'react';
import { rssiApi } from '../api/services';
import '../styles/Pages.css';

interface ComplianceData {
  referential: string;
  totalControls: number;
  implementedControls: number;
  complianceScore: number;
  lastUpdated: string;
}

export default function CompliancePage() {
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);

  useEffect(() => {
    // load referentials from backend and map to compliance data
    rssiApi.getReferentials().then(res => {
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const mapped: ComplianceData[] = data.map((d: any) => ({
        referential: d.name || d.code || 'Non disponible',
        totalControls: d.totalControls ?? 0,
        implementedControls: d.implementedControls ?? 0,
        complianceScore: d.complianceScore ?? (d.complianceScore === 0 ? 0 : Math.round(d.complianceScore || 0)),
        lastUpdated: d.updatedAt || d.version || new Date().toISOString(),
      }));
      setComplianceData(mapped);
    }).catch(err => console.error(err));
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#16a34a';
    if (score >= 70) return '#2563eb';
    if (score >= 50) return '#ca8a04';
    return '#dc2626';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'Moyen';
    return 'Faible';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const overallScore = complianceData.length > 0
    ? Math.round(complianceData.reduce((sum, item) => sum + item.complianceScore, 0) / complianceData.length)
    : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Tableau de conformité</h2>
          <p className="page-subtitle">Suivi de la conformité aux référentiels de sécurité</p>
        </div>
        <span className="page-badge">{complianceData.length} référentiel(s)</span>
      </div>

      <div className="info-cards-grid">
        <div className="stat-card">
          <h3>Score global</h3>
          <div className="stat-value-large" style={{ color: getScoreColor(overallScore) }}>
            {overallScore}%
          </div>
          <p className="stat-label">{getScoreLabel(overallScore)}</p>
        </div>
        <div className="stat-card">
          <h3>Total contrôles</h3>
          <div className="stat-value">
            {complianceData.reduce((sum, item) => sum + item.totalControls, 0)}
          </div>
          <p className="stat-label">Contrôles</p>
        </div>
        <div className="stat-card">
          <h3>Contrôles implémentés</h3>
          <div className="stat-value">
            {complianceData.reduce((sum, item) => sum + item.implementedControls, 0)}
          </div>
          <p className="stat-label">Implémentés</p>
        </div>
        <div className="stat-card">
          <h3>Écart restant</h3>
          <div className="stat-value">
            {complianceData.reduce((sum, item) => sum + (item.totalControls - item.implementedControls), 0)}
          </div>
          <p className="stat-label">À faire</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Référentiel</th>
              <th>Contrôles totaux</th>
              <th>Contrôles implémentés</th>
              <th>Score de conformité</th>
              <th>Statut</th>
              <th>Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody>
            {complianceData.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  Aucune donnée de conformité disponible.
                </td>
              </tr>
            ) : (
              complianceData.map((item, index) => (
                <tr key={index}>
                  <td className="cell-filename">{item.referential}</td>
                  <td>{item.totalControls}</td>
                  <td>{item.implementedControls}</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.complianceScore}%`, backgroundColor: getScoreColor(item.complianceScore) }}
                      >
                        {item.complianceScore}%
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getScoreColor(item.complianceScore), color: '#fff' }}
                    >
                      {getScoreLabel(item.complianceScore)}
                    </span>
                  </td>
                  <td>{formatDate(item.lastUpdated)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
