import { useEffect, useState } from 'react';
import { rssiApi } from '../api/services';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';

type ReportType = 'Inventaire' | 'Risques' | 'Conformité' | 'Classification';
type ReportStatus = 'Terminé' | 'En cours' | 'Échec';
type Priority = 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'FAIBLE';
type RecommendationStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  reportId: number;
  reportTitle: string;
  priority: Priority;
  referential: string;
  action: string;
  responsible: string;
  dueDate: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
}

interface Report {
  id: number;
  title: string;
  reportType: ReportType;
  executiveSummary: string;
  overallScore: number;
  rssiSignature: string;
  generatedAt: string;
  status: ReportStatus;
  signatureHash?: string;
  aiSummary?: string;
  version?: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      // Example data
      const exampleReports: Report[] = [
        {
          id: 1,
          title: 'Rapport Inventaire 2026-07-11',
          reportType: 'Inventaire',
          executiveSummary: 'Rapport d\'inventaire des actifs numériques de l\'organisation, incluant la classification des documents et la détection de données sensibles.',
          overallScore: 85,
          rssiSignature: 'RSSI - Y. El Amrani',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'Terminé',
          signatureHash: 'a1b2c3d4e5f6g7h8i9j0',
          aiSummary: 'L\'analyse révèle une bonne couverture des actifs avec 85% de conformité. Les principaux risques concernent les données sensibles non classifiées.',
          version: 1
        },
        {
          id: 2,
          title: 'Rapport Risques 2026-07-10',
          reportType: 'Risques',
          executiveSummary: 'Analyse des risques de sécurité, identification des menaces et recommandations de mitigation.',
          overallScore: 72,
          rssiSignature: 'RSSI - Y. El Amrani',
          generatedAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'Terminé',
          signatureHash: 'b2c3d4e5f6g7h8i9j0k1',
          aiSummary: 'Score de risque moyen. Attention aux vulnérabilités de niveau critique détectées dans les systèmes RH.',
          version: 2
        },
        {
          id: 3,
          title: 'Rapport Conformité 2026-07-09',
          reportType: 'Conformité',
          executiveSummary: 'Évaluation de la conformité avec les réglementations RGPD, ISO 27001 et directives internes.',
          overallScore: 91,
          rssiSignature: 'RSSI - Y. El Amrani',
          generatedAt: new Date(Date.now() - 259200000).toISOString(),
          status: 'Terminé',
          signatureHash: 'c3d4e5f6g7h8i9j0k1l2',
          aiSummary: 'Excellente conformité globale. Seuls quelques ajustements mineurs nécessaires pour atteindre 100%.',
          version: 1
        },
        {
          id: 4,
          title: 'Rapport Classification 2026-07-12',
          reportType: 'Classification',
          executiveSummary: 'Génération en cours, veuillez patienter...',
          overallScore: 0,
          rssiSignature: '-',
          generatedAt: new Date().toISOString(),
          status: 'En cours',
          version: 1
        },
        {
          id: 5,
          title: 'Rapport Inventaire 2026-07-08',
          reportType: 'Inventaire',
          executiveSummary: 'Erreur lors de la génération: impossible d\'accéder à la base de données.',
          overallScore: 0,
          rssiSignature: '-',
          generatedAt: new Date(Date.now() - 345600000).toISOString(),
          status: 'Échec',
          version: 1
        },
      ];
      setReports(exampleReports);

      // Load recommendations from API or create mock data
      try {
        const recsRes = await rssiApi.getRecommendations();
        let recsData = Array.isArray(recsRes.data.data) ? recsRes.data.data : [];
        
        if (recsData.length === 0) {
          const priorities: Priority[] = ['CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE'];
          const recStatuses: RecommendationStatus[] = ['A_FAIRE', 'EN_COURS', 'TERMINE'];
          const referentials = ['ISO 27001', 'NIST', 'CIS', 'RGPD', 'Loi 09-08'];
          const actions = [
            'Changer les mots de passe',
            'Restreindre l\'accès RH',
            'Chiffrer les contrats',
            'Corriger classification',
            'Mettre à jour les politiques',
            'Former les utilisateurs'
          ];
          const recResponsibles = ['RSSI', 'Admin', 'Service IT', 'Direction'];
          
          recsData = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            title: `Recommandation ${i + 1}`,
            description: `Description de la recommandation ${i + 1}`,
            reportId: (i % 5) + 1,
            reportTitle: `Rapport ${(i % 5) + 1}`,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            referential: referentials[Math.floor(Math.random() * referentials.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            responsible: recResponsibles[Math.floor(Math.random() * recResponsibles.length)],
            dueDate: new Date(Date.now() + Math.random() * 30000000000).toISOString(),
            status: recStatuses[Math.floor(Math.random() * recStatuses.length)],
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
          }));
        }
        
        setRecommendations(recsData);
      } catch (recErr) {
        console.error('Error loading recommendations:', recErr);
        setRecommendations([]);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les rapports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter(r => {
    if (search) {
      const s = search.toLowerCase();
      if (!r.title.toLowerCase().includes(s)) return false;
    }
    if (filterType && r.reportType !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterDate) {
      const reportDate = new Date(r.generatedAt).toISOString().split('T')[0];
      if (reportDate !== filterDate) return false;
    }
    return true;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
        : new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    } else {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedReports.length / pageSize));
  const paginatedReports = sortedReports.slice((page - 1) * pageSize, page * pageSize);

  const handleGenerateReport = async (type: string) => {
    setMessage({ text: `Génération du rapport ${type} en cours...`, type: 'info' });
    try {
      await rssiApi.generateReport(type);
      setMessage({ text: `Rapport ${type} généré avec succès !`, type: 'success' });
      await loadReports();
    } catch {
      setMessage({ text: 'Erreur lors de la génération du rapport.', type: 'error' });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExportGlobalExcel = async () => {
    setMessage({ text: 'Export global Excel en cours...', type: 'info' });
    try {
      await rssiApi.exportExcel();
      setMessage({ text: 'Export Excel terminé !', type: 'success' });
    } catch {
      setMessage({ text: 'Erreur lors de l\'export Excel.', type: 'error' });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = (report: Report) => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text(report.title, 14, 20);
    pdfDoc.setFontSize(10);
    pdfDoc.text(`Type: ${report.reportType}`, 14, 30);
    pdfDoc.text(`Score global: ${report.overallScore}%`, 14, 35);
    pdfDoc.text(`Statut: ${report.status}`, 14, 40);
    pdfDoc.text(`Généré le: ${formatDate(report.generatedAt)}`, 14, 45);
    pdfDoc.text(`Signature: ${report.rssiSignature}`, 14, 50);
    pdfDoc.text('Résumé exécutif:', 14, 60);
    pdfDoc.text(report.executiveSummary.substring(0, 80), 14, 65);
    pdfDoc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
    setMessage({ text: `PDF ${report.title} téléchargé !`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownloadExcel = (report: Report) => {
    const csvContent = [
      ['Titre', 'Type', 'Score', 'Statut', 'Date', 'Signature', 'Résumé'],
      [report.title, report.reportType, report.overallScore, report.status, formatDate(report.generatedAt), report.rssiSignature, report.executiveSummary.substring(0, 50)]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ text: `Excel ${report.title} téléchargé !`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownloadWord = (report: Report) => {
    // Simple text file as Word replacement
    const content = `${report.title}\n\nType: ${report.reportType}\nScore global: ${report.overallScore}%\nStatut: ${report.status}\nGénéré le: ${formatDate(report.generatedAt)}\nSignature: ${report.rssiSignature}\n\nRésumé exécutif:\n${report.executiveSummary}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ text: `Word ${report.title} téléchargé !`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteReport = (report: Report) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${report.title}" ?`)) {
      setReports(prev => prev.filter(r => r.id !== report.id));
      setMessage({ text: 'Rapport supprimé avec succès.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
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

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-900/30 text-green-200 border-green-700';
      case 'En cours':
        return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'Échec':
        return 'bg-red-900/30 text-red-200 border-red-700';
      default:
        return 'bg-gray-900/30 text-gray-200 border-gray-700';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITIQUE': return 'bg-red-900/30 text-red-200 border-red-700';
      case 'ELEVEE': return 'bg-orange-900/30 text-orange-200 border-orange-700';
      case 'MOYENNE': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'FAIBLE': return 'bg-green-900/30 text-green-200 border-green-700';
      default: return 'bg-gray-900/30 text-gray-200 border-gray-700';
    }
  };

  const getRecommendationStatusColor = (status: RecommendationStatus) => {
    switch (status) {
      case 'A_FAIRE': return 'bg-red-900/30 text-red-200 border-red-700';
      case 'EN_COURS': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'TERMINE': return 'bg-green-900/30 text-green-200 border-green-700';
      default: return 'bg-gray-900/30 text-gray-200 border-gray-700';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Rapports</h2>
          <p className="page-subtitle">Génération automatique des rapports SSI</p>
        </div>
        <span className="page-badge">{reports.length} rapport(s)</span>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Total rapports</p>
              <p className="text-2xl font-bold text-zinc-100">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Terminés</p>
              <p className="text-2xl font-bold text-zinc-100">{reports.filter(r => r.status === 'Terminé').length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">En cours</p>
              <p className="text-2xl font-bold text-zinc-100">{reports.filter(r => r.status === 'En cours').length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Échoués</p>
              <p className="text-2xl font-bold text-zinc-100">{reports.filter(r => r.status === 'Échec').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Stats */}
      <div className="card-panel mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Score moyen global</p>
              <p className="text-2xl font-bold text-zinc-100">
                {reports.length > 0 ? Math.round(reports.filter(r => r.overallScore > 0).reduce((a, b) => a + b.overallScore, 0) / reports.filter(r => r.overallScore > 0).length) : 0}%
              </p>
            </div>
          </div>
          <div className="text-sm text-zinc-400">
            {reports.filter(r => r.overallScore >= 80).length} rapports avec score ≥ 80%
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded border ${
          message.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-200' :
          message.type === 'error' ? 'bg-red-900/30 border-red-700 text-red-200' :
          'bg-blue-900/30 border-blue-700 text-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-200">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-3">
          <Button variant="default" onClick={() => handleGenerateReport('INVENTAIRE')}>Générer Rapport Inventaire</Button>
          <Button variant="default" onClick={() => handleGenerateReport('RISQUES')}>Générer Rapport Risques</Button>
          <Button variant="default" onClick={() => handleGenerateReport('CONFORMITE')}>Générer Rapport Conformité</Button>
          <Button variant="default" onClick={() => handleGenerateReport('CLASSIFICATION')}>Générer Rapport Classification</Button>
          <Button variant="outline" onClick={handleExportGlobalExcel}>Export Excel Global</Button>
        </div>
      </div>

      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Recherche par nom..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="Inventaire">Inventaire</option>
            <option value="Risques">Risques</option>
            <option value="Conformité">Conformité</option>
            <option value="Classification">Classification</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="Terminé">Terminé</option>
            <option value="En cours">En cours</option>
            <option value="Échec">Échec</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'name')}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Trier par Date</option>
            <option value="name">Trier par Nom</option>
          </select>
          <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement des rapports...</div>
        ) : sortedReports.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">Aucun rapport disponible</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Nom du rapport</th>
                <th className="px-4 py-3">Type du rapport</th>
                <th className="px-4 py-3">Résumé exécutif</th>
                <th className="px-4 py-3">Score global (%)</th>
                <th className="px-4 py-3">Signature RSSI</th>
                <th className="px-4 py-3">Date de génération</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginatedReports.map(report => (
                <tr key={report.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{report.title}</td>
                  <td className="px-4 py-3">{report.reportType}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={report.executiveSummary}>
                    {report.executiveSummary}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === 'Terminé' ? `${report.overallScore}%` : '-'}
                  </td>
                  <td className="px-4 py-3">{report.rssiSignature}</td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(report.generatedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>Voir</Button>
                      {report.status === 'Terminé' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(report)}>
                            <Download size={16} style={{ marginRight: 4 }} />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadExcel(report)}>
                            Excel
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadWord(report)}>
                            Word
                          </Button>
                        </>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteReport(report)}>Supprimer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && sortedReports.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</Button>
            <span className="text-sm text-zinc-400">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</Button>
          </div>
          <div className="text-sm text-zinc-400">
            Par page:&nbsp;
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recommandations finales</h2>
        <div className="border rounded-lg overflow-hidden border-zinc-700">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">Aucune recommandation disponible.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-200">
              <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Rapport concerné</th>
                  <th className="px-4 py-3">Priorité</th>
                  <th className="px-4 py-3">Référentiel</th>
                  <th className="px-4 py-3">Action recommandée</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium">{rec.title}</td>
                    <td className="px-4 py-3">{rec.reportTitle}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">{rec.referential}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={rec.action}>{rec.action}</td>
                    <td className="px-4 py-3">{rec.responsible}</td>
                    <td className="px-4 py-3 text-zinc-300">{formatDate(rec.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRecommendationStatusColor(rec.status)}`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedReport.title}</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-zinc-400">Type:</span> <span className="ml-2">{selectedReport.reportType}</span>
              </div>
              <div>
                <span className="text-zinc-400">Version:</span> <span className="ml-2">v{selectedReport.version || 1}</span>
              </div>
              <div>
                <span className="text-zinc-400">Résumé exécutif:</span>
                <p className="text-zinc-300 mt-1">{selectedReport.executiveSummary}</p>
              </div>
              {selectedReport.status === 'Terminé' && (
                <>
                  <div>
                    <span className="text-zinc-400">Score global:</span> <span className="ml-2">{selectedReport.overallScore}%</span>
                  </div>
                  {selectedReport.aiSummary && (
                    <div>
                      <span className="text-zinc-400">Résumé IA:</span>
                      <p className="text-zinc-300 mt-1 bg-zinc-800 p-3 rounded border border-zinc-700">{selectedReport.aiSummary}</p>
                    </div>
                  )}
                  {selectedReport.signatureHash && (
                    <div>
                      <span className="text-zinc-400">Signature numérique:</span>
                      <div className="mt-1 bg-zinc-800 p-3 rounded border border-zinc-700">
                        <p className="text-zinc-300 text-xs">{selectedReport.signatureHash}</p>
                        <p className="text-zinc-500 text-xs mt-1">Hash SHA-256 du document signé</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div>
                <span className="text-zinc-400">Signature RSSI:</span> <span className="ml-2">{selectedReport.rssiSignature}</span>
              </div>
              <div>
                <span className="text-zinc-400">Date de génération:</span> <span className="ml-2 text-zinc-300">{formatDate(selectedReport.generatedAt)}</span>
              </div>
              <div>
                <span className="text-zinc-400">Statut:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
