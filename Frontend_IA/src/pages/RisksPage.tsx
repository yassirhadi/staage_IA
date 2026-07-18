import { useEffect, useState } from 'react';
import { aiApi, rssiApi } from '@/api/services';
import { Button } from '@/components/ui/button';

type Severity = 'CRITIQUE' | 'ELEVE' | 'MOYEN' | 'FAIBLE';
type Status = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'IGNORE';
type Priority = 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'FAIBLE';
type RecommendationStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  riskId: number;
  riskTitle: string;
  priority: Priority;
  referential: string;
  action: string;
  responsible: string;
  dueDate: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
}

interface Risk {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  status: Status;
  documentId?: number;
  document?: { fileName: string };
  solution?: string;
  complianceStandard?: string;
  confidence?: number;
  detectionDate?: string;
  lastUpdate?: string;
  responsible?: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  useEffect(() => {
    const loadRisks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await aiApi.getRisks();
        let risksData = Array.isArray(res.data.data) ? res.data.data : [];
        
        // If no data from API, create mock data
        if (risksData.length === 0) {
          const categories = ['Données sensibles', 'Sécurité informatique', 'Classification'];
          const severities: Severity[] = ['CRITIQUE', 'ELEVE', 'MOYEN', 'FAIBLE'];
          const statuses: Status[] = ['OUVERT', 'EN_COURS', 'RESOLU', 'IGNORE'];
          const complianceStandards = ['ISO 27001', 'RGPD', 'NIST', 'Loi 09-08'];
          const solutions = [
            'Chiffrer les données sensibles',
            'Restreindre l\'accès aux documents',
            'Mettre à jour les politiques de sécurité',
            'Former le personnel',
            'Implémenter MFA',
            'Auditer les logs'
          ];
          const responsibles = ['RSSI', 'Admin', 'Service IT', 'Direction', 'RH'];
          
          risksData = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            title: `Risque ${i + 1}`,
            description: `Description détaillée du risque ${i + 1} détecté dans le système`,
            severity: severities[Math.floor(Math.random() * severities.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            documentId: i + 1,
            document: { fileName: `document_${i + 1}.pdf` },
            solution: solutions[Math.floor(Math.random() * solutions.length)],
            complianceStandard: complianceStandards[Math.floor(Math.random() * complianceStandards.length)],
            confidence: Math.floor(Math.random() * 30) + 70,
            detectionDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            lastUpdate: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
            responsible: responsibles[Math.floor(Math.random() * responsibles.length)]
          }));
        }
        
        setRisks(risksData);

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
              riskId: (i % 15) + 1,
              riskTitle: `Risque ${(i % 15) + 1}`,
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
        console.error('Error loading risks:', err);
        setError('Impossible de charger les risques. Vérifiez que le backend est démarré.');
      } finally {
        setLoading(false);
      }
    };
    loadRisks();
  }, []);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'CRITIQUE': return 'bg-red-900/30 text-red-200 border-red-700';
      case 'ELEVE': return 'bg-orange-900/30 text-orange-200 border-orange-700';
      case 'MOYEN': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'FAIBLE': return 'bg-green-900/30 text-green-200 border-green-700';
      default: return 'bg-gray-900/30 text-gray-200 border-gray-700';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'OUVERT': return 'bg-blue-900/30 text-blue-200 border-blue-700';
      case 'EN_COURS': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      case 'RESOLU': return 'bg-green-900/30 text-green-200 border-green-700';
      case 'IGNORE': return 'bg-gray-900/30 text-gray-200 border-gray-700';
      default: return 'bg-gray-900/30 text-gray-200 border-gray-700';
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

  const filtered = risks.filter(r => {
    if (search) {
      const s = search.toLowerCase();
      if (!((r.title || '').toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s) ||
        (r.document?.fileName || '').toLowerCase().includes(s))) return false;
    }
    if (filterSeverity && r.severity !== filterSeverity) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterDate) {
      const detectionDate = r.detectionDate ? new Date(r.detectionDate).toISOString().split('T')[0] : '';
      if (detectionDate !== filterDate) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleMarkTreated = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir marquer ce risque comme traité ?')) {
      setRisks(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'RESOLU' } : r
      ));
      setMessage({ text: 'Risque marqué comme traité avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleIgnore = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir ignorer ce risque ?')) {
      setRisks(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'IGNORE' } : r
      ));
      setMessage({ text: 'Risque ignoré avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce risque ? Cette action est irréversible.')) {
      setRisks(prev => prev.filter(r => r.id !== id));
      setMessage({ text: 'Risque supprimé avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExport = (format: 'PDF' | 'Excel') => {
    setMessage({ text: `Export ${format} en cours...`, type: 'info' });
    setTimeout(() => {
      setMessage({ text: `Export ${format} terminé !`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handleViewDetails = (risk: Risk) => {
    setSelectedRisk(risk);
    setShowDetailsModal(true);
  };

  const handleDownloadReport = (risk: Risk) => {
    setMessage({ text: `Téléchargement du rapport pour ${risk.title}`, type: 'info' });
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
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
          <h1 className="text-2xl font-bold tracking-tight">Analyse des risques</h1>
          <p className="text-muted-foreground">Risques détectés par l'IA</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="page-badge">{risks.length} risque(s)</span>
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}>Exporter PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}>Exporter Excel</Button>
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

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-200">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Filters */}
      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            placeholder="Recherche par nom de document ou description"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes gravités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="ELEVE">Élevée</option>
            <option value="MOYEN">Moyenne</option>
            <option value="FAIBLE">Faible</option>
          </select>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes catégories</option>
            <option value="Données sensibles">Données sensibles</option>
            <option value="Sécurité informatique">Sécurité informatique</option>
            <option value="Classification">Classification</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous statuts</option>
            <option value="OUVERT">OUVERT</option>
            <option value="EN_COURS">EN_COURS</option>
            <option value="RESOLU">RÉSOLU</option>
            <option value="IGNORE">IGNORÉ</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="default" size="sm" onClick={() => {
            setSearch(''); setFilterCategory(''); setFilterSeverity(''); setFilterStatus(''); setFilterDate(''); setPage(1);
          }}>Réinitialiser</Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement des risques...</div>
        ) : paginated.length === 0 ? (
          <tr><td colSpan={12} className="p-8 text-center text-zinc-400">Aucun risque trouvé.</td></tr>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Nom du fichier</th>
                <th className="px-4 py-3">Gravité</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description du risque</th>
                <th className="px-4 py-3">Niveau de confiance</th>
                <th className="px-4 py-3">Conformité</th>
                <th className="px-4 py-3">Solution recommandée</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Date de détection</th>
                <th className="px-4 py-3">Dernière mise à jour</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginated.map((risk) => (
                <tr key={risk.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{risk.document?.fileName || 'Non disponible'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getSeverityColor(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">{risk.category || 'Non disponible'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={risk.description}>{risk.description || 'Non disponible'}</td>
                  <td className="px-4 py-3">{risk.confidence ? `${risk.confidence}%` : 'Non disponible'}</td>
                  <td className="px-4 py-3">{risk.complianceStandard || 'Non disponible'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={risk.solution}>{risk.solution || 'Non disponible'}</td>
                  <td className="px-4 py-3">{risk.responsible || 'Non disponible'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(risk.status)}`}>
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(risk.detectionDate)}</td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(risk.lastUpdate)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(risk)}>Voir détails</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReport(risk)}>Voir rapport</Button>
                      <Button variant="outline" size="sm" onClick={() => handleMarkTreated(risk.id)}>Marquer traité</Button>
                      <Button variant="outline" size="sm" onClick={() => handleIgnore(risk.id)}>Ignorer</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(risk.id)}>Supprimer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
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
        <h2 className="text-xl font-bold mb-4">Recommandations associées</h2>
        <div className="border rounded-lg overflow-hidden border-zinc-700">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">Aucune recommandation disponible.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-200">
              <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Risque concerné</th>
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
                    <td className="px-4 py-3">{rec.riskTitle}</td>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(risks.find(r => r.id === rec.riskId))}>Voir détails</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setRecommendations(prev => prev.map(r => 
                            r.id === rec.id ? { ...r, status: 'TERMINE' } : r
                          ));
                          setMessage({ text: 'Recommandation marquée comme terminée', type: 'success' });
                          setTimeout(() => setMessage(null), 3000);
                        }}>Marquer terminée</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRisk && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedRisk.title}</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-zinc-400">Document associé:</span>
                <span className="ml-2 text-zinc-100">{selectedRisk.document?.fileName || 'Non disponible'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Gravité:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getSeverityColor(selectedRisk.severity)}`}>
                  {selectedRisk.severity}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Catégorie:</span>
                <span className="ml-2 text-zinc-100">{selectedRisk.category}</span>
              </div>
              <div>
                <span className="text-zinc-400">État:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(selectedRisk.status)}`}>
                  {selectedRisk.status}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Niveau de confiance:</span>
                <span className="ml-2 text-zinc-100">{selectedRisk.confidence ? `${selectedRisk.confidence}%` : 'Non disponible'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Conformité:</span>
                <span className="ml-2 text-zinc-100">{selectedRisk.complianceStandard || 'Non disponible'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Date de détection:</span>
                <span className="ml-2 text-zinc-300">{formatDate(selectedRisk.detectionDate)}</span>
              </div>
              <div>
                <span className="text-zinc-400">Dernière mise à jour:</span>
                <span className="ml-2 text-zinc-300">{formatDate(selectedRisk.lastUpdate)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-700">
                <h3 className="font-semibold mb-2 text-zinc-200">Description du risque</h3>
                <p className="text-zinc-300">{selectedRisk.description}</p>
              </div>
              {selectedRisk.solution && (
                <div className="pt-2 border-t border-zinc-700">
                  <h3 className="font-semibold mb-2 text-zinc-200">Solution recommandée</h3>
                  <p className="text-zinc-300">{selectedRisk.solution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
