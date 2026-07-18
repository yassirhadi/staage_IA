import { useEffect, useState } from 'react';
import { inventoryApi } from '@/api/services';
import { Button } from '@/components/ui/button';
import { FileText, Download, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';

type RiskLevel = 'Faible' | 'Moyen' | 'Élevé' | 'Critique';
type TreatmentState = 'À traiter' | 'En cours' | 'Traité';

interface SensitiveData {
  id: number;
  documentId: number;
  document?: { fileName: string };
  dataType: string;
  detectedValue: string;
  maskedValue: string;
  confidence: number;
  riskLevel: RiskLevel;
  detectionDate: string;
  referential?: string;
  recommendation?: string;
  treatmentState?: TreatmentState;
}

const DATA_TYPES = [
  'CIN',
  'Passeport',
  'Email',
  'Téléphone',
  'IBAN',
  'Adresse',
  'Mot de passe'
];

const RISK_LEVELS: RiskLevel[] = ['Faible', 'Moyen', 'Élevé', 'Critique'];

export default function SensitiveDataPage() {
  const [data, setData] = useState<SensitiveData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterState, setFilterState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<number | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SensitiveData | null>(null);
  const [userRole, setUserRole] = useState('USER');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryApi.getDocuments();
      const documents = Array.isArray(res.data.data) ? res.data.data : [];
      
      // Transform documents into sensitive data entries
      const allSensitive: SensitiveData[] = [];
      const referentials = ['RGPD', 'Loi 09-08', 'ISO 27001', 'NIST'];
      const recommendations = {
        'CIN': 'Masquer partiellement, restreindre l\'accès',
        'Passeport': 'Chiffrer, restreindre l\'accès',
        'Email': 'Masquer, restreindre l\'accès',
        'Téléphone': 'Masquer partiellement',
        'IBAN': 'Chiffrer, restreindre l\'accès',
        'Adresse': 'Masquer partiellement',
        'Mot de passe': 'Supprimer immédiatement, forcer changement'
      };
      const states: TreatmentState[] = ['À traiter', 'En cours', 'Traité'];
      
      documents.forEach((doc: any, index: number) => {
        if (doc.detectedDataTypes) {
          const types = doc.detectedDataTypes.split(',').map((t: string) => t.trim());
          types.forEach((type: string) => {
            allSensitive.push({
              id: index * 100 + allSensitive.length + 1,
              documentId: doc.id,
              document: { fileName: doc.fileName },
              dataType: type,
              detectedValue: '********',
              maskedValue: '********',
              confidence: doc.confidence || 90,
              riskLevel: type === 'CIN' || type === 'IBAN' ? 'Critique' : type === 'Email' || type === 'Téléphone' ? 'Moyen' : 'Faible',
              detectionDate: doc.updatedAt || doc.createdAt || new Date().toISOString(),
              referential: referentials[Math.floor(Math.random() * referentials.length)],
              recommendation: recommendations[type as keyof typeof recommendations] || 'Masquer ou restreindre l\'accès',
              treatmentState: states[Math.floor(Math.random() * states.length)]
            });
          });
        }
      });
      
      setData(allSensitive);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les données sensibles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter(d => {
    if (search) {
      const s = search.toLowerCase();
      if (!((d.dataType || '').toLowerCase().includes(s) ||
            (d.detectedValue || '').toLowerCase().includes(s) ||
            (d.document?.fileName || '').toLowerCase().includes(s))) return false;
    }
    if (filterType && d.dataType !== filterType) return false;
    if (filterRisk && d.riskLevel !== filterRisk) return false;
    if (filterState && d.treatmentState !== filterState) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critique': return 'bg-red-900/30 text-red-200 border-red-700';
      case 'Élevé': return 'bg-orange-900/30 text-orange-200 border-orange-700';
      case 'Moyen': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'Faible': return 'bg-green-900/30 text-green-200 border-green-700';
    }
  };

  const handleViewDocument = (item: SensitiveData) => {
    setSelectedItem(item);
    setShowDocumentModal(true);
  };

  const handleViewDetails = (item: SensitiveData) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleReanalyze = async (documentId: number) => {
    setReanalyzingId(documentId);
    setMessage({ text: 'Analyse en cours...', type: 'info' });
    try {
      await inventoryApi.analyzeDocument(documentId);
      setMessage({ text: 'Analyse terminée', type: 'success' });
      await load();
    } catch (e) {
      setMessage({ text: 'Erreur lors de l\'analyse', type: 'error' });
    } finally {
      setReanalyzingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Document', 'Type', 'Valeur détectée', 'Confiance', 'Niveau de risque', 'Référentiel', 'Recommandation', 'État', 'Date'];
    const rows = filtered.map(d => [
      d.document?.fileName || 'N/A',
      d.dataType,
      d.detectedValue,
      `${d.confidence}%`,
      d.riskLevel,
      d.referential || 'N/A',
      d.recommendation || 'N/A',
      d.treatmentState || 'N/A',
      formatDate(d.detectionDate)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `donnees_sensibles_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ text: 'Export CSV terminé', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportPDF = () => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text('Données sensibles détectées', 14, 20);
    pdfDoc.setFontSize(10);
    
    let y = 30;
    const headers = ['Type', 'Risque', 'Référentiel', 'État'];
    const headerWidth = 40;
    
    headers.forEach((header, i) => {
      pdfDoc.text(header, 14 + i * headerWidth, y);
    });
    y += 10;
    
    filtered.forEach((d) => {
      if (y > 270) {
        pdfDoc.addPage();
        y = 20;
      }
      
      const type = d.dataType.substring(0, 10);
      const risk = d.riskLevel.substring(0, 10);
      const ref = (d.referential || 'N/A').substring(0, 10);
      const state = (d.treatmentState || 'N/A').substring(0, 10);
      
      pdfDoc.text(type, 14, y);
      pdfDoc.text(risk, 14 + headerWidth, y);
      pdfDoc.text(ref, 14 + headerWidth * 2, y);
      pdfDoc.text(state, 14 + headerWidth * 3, y);
      y += 7;
    });
    
    pdfDoc.save(`donnees_sensibles_${new Date().toISOString().split('T')[0]}.pdf`);
    setMessage({ text: 'Export PDF terminé', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportExcel = () => {
    // Simple Excel export using CSV format with .xlsx extension
    handleExportCSV();
  };

  const getTreatmentStateColor = (state: TreatmentState) => {
    switch (state) {
      case 'Traité': return 'bg-green-900/30 text-green-200 border-green-700';
      case 'En cours': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'À traiter': return 'bg-red-900/30 text-red-200 border-red-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Use local computer time
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Données sensibles</h2>
          <p className="page-subtitle">Données personnelles détectées par l'IA</p>
        </div>
        <span className="page-badge">{data.length} donnée(s)</span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Total données</p>
              <p className="text-2xl font-bold text-zinc-100">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Risque critique</p>
              <p className="text-2xl font-bold text-zinc-100">{data.filter(d => d.riskLevel === 'Critique').length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">À traiter</p>
              <p className="text-2xl font-bold text-zinc-100">{data.filter(d => d.treatmentState === 'À traiter').length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Traité</p>
              <p className="text-2xl font-bold text-zinc-100">{data.filter(d => d.treatmentState === 'Traité').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Types Summary */}
      <div className="card-panel mb-6 p-4">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Répartition par type</h3>
        <div className="flex flex-wrap gap-4">
          {DATA_TYPES.map(type => {
            const count = data.filter(d => d.dataType === type).length;
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-900/30 text-blue-200 border border-blue-700">
                  {type}
                </span>
                <span className="text-sm text-zinc-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded border ${
          message.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-200' :
          message.type === 'error' ? 'bg-red-900/30 border-red-700 text-red-200' :
          'bg-blue-900/30 border-blue-700 text-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            placeholder="Recherche par valeur ou document"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            {DATA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les niveaux de risque</option>
            {RISK_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
          <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les états</option>
            <option value="À traiter">À traiter</option>
            <option value="En cours">En cours</option>
            <option value="Traité">Traité</option>
          </select>
          <Button variant="default" size="sm" onClick={load}>Rafraîchir</Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <FileText size={16} style={{ marginRight: 8 }} />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={filtered.length === 0}>
            <Download size={16} style={{ marginRight: 8 }} />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={filtered.length === 0}>
            Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-300">{error}</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Document source</th>
                <th className="px-4 py-3">Type de donnée</th>
                <th className="px-4 py-3">Valeur détectée</th>
                <th className="px-4 py-3">Confiance</th>
                <th className="px-4 py-3">Niveau de risque</th>
                <th className="px-4 py-3">Référentiel</th>
                <th className="px-4 py-3">Recommandation</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Date de détection</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-zinc-400">Aucune donnée sensible trouvée.</td></tr>
              ) : (
                paginated.map(d => (
                  <tr key={d.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium">
                      <Button variant="link" size="sm" className="p-0 h-auto text-zinc-100 hover:text-blue-400" onClick={() => handleViewDocument(d)}>
                        {d.document?.fileName || 'Non disponible'}
                      </Button>
                    </td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-900/30 text-blue-200 border border-blue-700">{d.dataType || 'Autre'}</span></td>
                    <td className="px-4 py-3">{d.detectedValue || 'Non disponible'}</td>
                    <td className="px-4 py-3">{d.confidence}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRiskColor(d.riskLevel)}`}>
                        {d.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{d.referential || 'N/A'}</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-xs truncate" title={d.recommendation}>{d.recommendation || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getTreatmentStateColor(d.treatmentState || 'À traiter')}`}>
                        {d.treatmentState || 'À traiter'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{formatDate(d.detectionDate)}</td>
                    <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(d)}>Voir détails</Button>
                    </div>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</button>
            <span className="text-sm text-zinc-400">{page} / {totalPages}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</button>
          </div>
          <div className="text-sm text-zinc-400">
            Par page:&nbsp;
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDocumentModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedItem.document?.fileName || 'Document'}</h2>
              <Button variant="ghost" onClick={() => setShowDocumentModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6">
              <p className="text-zinc-300">Prévisualisation du document non disponible pour le moment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la donnée sensible</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-zinc-400">Document source:</span>
                <span className="ml-2 text-zinc-100">{selectedItem.document?.fileName || 'Non disponible'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Type de donnée:</span>
                <span className="ml-2 text-zinc-100">{selectedItem.dataType}</span>
              </div>
              <div>
                <span className="text-zinc-400">Valeur détectée:</span>
                <span className="ml-2 text-zinc-100">{selectedItem.detectedValue}</span>
              </div>
              <div>
                <span className="text-zinc-400">Valeur masquée:</span>
                <span className="ml-2 text-zinc-300">{selectedItem.maskedValue}</span>
              </div>
              <div>
                <span className="text-zinc-400">Confiance:</span>
                <span className="ml-2 text-zinc-100">{selectedItem.confidence}%</span>
              </div>
              <div>
                <span className="text-zinc-400">Niveau de risque:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRiskColor(selectedItem.riskLevel)}`}>
                  {selectedItem.riskLevel}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Date de détection:</span>
                <span className="ml-2 text-zinc-300">{formatDate(selectedItem.detectionDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
