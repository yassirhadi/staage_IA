import '../styles/AnalysisReport.css';
import { ClassificationStamp, type ConfidentialityLevel } from './ui/classification-stamp';

const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = [
  'NON_CLASSIFIE',
  'PUBLIC',
  'INTERNE',
  'CONFIDENTIEL',
  'TRES_CONFIDENTIEL',
];

interface AnalysisReportProps {
  document: {
    fileName: string;
    documentType?: string;
    confidentialityLevel?: string;
  };
  analysisData?: {
    documentType?: string;
    confidentialityLevel?: string;
    piiDetected?: boolean;
    detectedDataTypes?: string[];
    risksCount?: number;
    risksDetails?: string[];
    complianceStandards?: string[];
    securityScore?: number;
  };
  onClose: () => void;
}

export default function AnalysisReport({ document, analysisData, onClose }: AnalysisReportProps) {
  const data = analysisData || {
    documentType: document.documentType || 'Non classifié',
    confidentialityLevel: document.confidentialityLevel || 'Non défini',
    piiDetected: false,
    detectedDataTypes: [],
    risksCount: 0,
    risksDetails: [],
    complianceStandards: ['ISO27001', 'NIST'],
    securityScore: 0,
  };

  return (
    <div className="analysis-report-overlay">
      <div className="analysis-report-modal">
        <div className="report-header">
          <h2>Rapport d'analyse IA</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="report-content">
          <div className="report-section">
            <h3>Document</h3>
            <div className="report-value">{document.fileName}</div>
          </div>

          <div className="report-section">
            <h3>Classification</h3>
            <div className="report-value">
              {data.confidentialityLevel && CONFIDENTIALITY_LEVELS.includes(data.confidentialityLevel.toUpperCase() as ConfidentialityLevel) ? (
                <ClassificationStamp level={data.confidentialityLevel.toUpperCase() as ConfidentialityLevel} />
              ) : (
                data.confidentialityLevel?.replace(/_/g, ' ')
              )}
            </div>
          </div>

          <div className="report-section">
            <h3>Type de document</h3>
            <div className="report-value">{data.documentType?.replace(/_/g, ' ')}</div>
          </div>

          <div className="report-section">
            <h3>Données détectées</h3>
            <div className="data-list">
              {data.detectedDataTypes && data.detectedDataTypes.length > 0 ? (
                data.detectedDataTypes.map((dataType, index) => (
                  <div key={index} className="data-item">
                    ✓ {dataType}
                  </div>
                ))
              ) : (
                <div className="data-item">Aucune donnée sensible détectée</div>
              )}
            </div>
          </div>

          <div className="report-section">
            <h3>Risques</h3>
            <div className="risks-list">
              {data.risksDetails && data.risksDetails.length > 0 ? (
                data.risksDetails.map((risk, index) => (
                  <div key={index} className="risk-item">
                    ⚠️ {risk}
                  </div>
                ))
              ) : (
                <div className="risk-item">Aucun risque détecté</div>
              )}
            </div>
          </div>

          <div className="report-section">
            <h3>Conformité</h3>
            <div className="compliance-list">
              {data.complianceStandards && data.complianceStandards.map((standard, index) => (
                <div key={index} className="compliance-item">
                  ✓ {standard}
                </div>
              ))}
            </div>
          </div>

          <div className="report-section score-section">
            <h3>Score de sécurité</h3>
            <div className="score-circle">
              <div className="score-value">{data.securityScore || 0}%</div>
            </div>
          </div>
        </div>

        <div className="report-footer">
          <button className="btn-primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
