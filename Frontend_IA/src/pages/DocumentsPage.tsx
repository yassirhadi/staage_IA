import { useState, useEffect } from 'react';
import { inventoryApi } from '@/api/services';
import { ClassificationStamp, type ConfidentialityLevel } from '@/components/ui/classification-stamp';
import { Button } from '@/components/ui/button';

// Define document type
interface Document {
  id: number;
  fileName: string;
  extension: string;
  fileSize: number;
  analysisStatus: 'En cours' | 'Terminé' | 'Échec' | 'Non analysé';
  documentType?: string;
  confidentialityLevel?: string;
  filePath?: string;
  createdAt?: string;
  updatedAt?: string;
  analysedAt?: string;
  ocrText?: string;
  extractedText?: string;
  detectedConfidentialityLevel?: string;
  detectedDocumentType?: string;
  sensitiveData?: Array<{ type: string; value: string }>;
  analysisError?: string;
  riskScore?: number;
  detectedDataTypes?: string;
  recommendationsCount?: number;
}

const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = [
  'NON_CLASSIFIE',
  'PUBLIC',
  'INTERNE',
  'CONFIDENTIEL',
  'TRES_CONFIDENTIEL',
];

const DOCUMENT_TYPES = [
  'Contrat',
  'Facture',
  'Rapport',
  'Procédure',
  'Politique SSI',
  'Dossier RH',
  'Note interne',
  'Autre'
];

const STATUS_OPTIONS = [
  'Tous',
  'En cours',
  'Terminé',
  'Échec',
  'Non analysé'
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [reanalysingId, setReanalysingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getDocuments();
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setDocuments(data.map((doc: any) => ({
        ...doc,
        analysisStatus: doc.analysisStatus || 'Non analysé',
        sensitiveData: doc.detectedDataTypes ? doc.detectedDataTypes.split(',').map((item: string) => ({
          type: item.trim(),
          value: '********'
        })) : []
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'Tous') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    // Status filter
    if (filterStatus !== 'Tous') {
      filtered = filtered.filter(doc => doc.analysisStatus === filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.analysedAt || a.updatedAt || '').getTime() - new Date(b.analysedAt || b.updatedAt || '').getTime();
          break;
        case 'confidentiality':
          const confOrder = { 'TRES_CONFIDENTIEL': 4, 'CONFIDENTIEL': 3, 'INTERNE': 2, 'PUBLIC': 1, 'NON_CLASSIFIE': 0 };
          comparison = (confOrder[a.confidentialityLevel as keyof typeof confOrder] || 0) - (confOrder[b.confidentialityLevel as keyof typeof confOrder] || 0);
          break;
        case 'risk':
          comparison = (a.riskScore || 0) - (b.riskScore || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
    setPage(1);
  }, [documents, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Pagination
  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));

  // Handlers
  const handleReanalyse = async (id: number) => {
    setReanalysingId(id);
    setMessage({ text: 'Analyse en cours...', type: 'info' });
    try {
      await inventoryApi.analyzeDocument(id);
      setMessage({ text: 'Analyse terminée', type: 'success' });
      await loadDocuments();
    } catch (error) {
      setMessage({ text: 'Erreur lors de l\'analyse', type: 'error' });
    } finally {
      setReanalysingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await inventoryApi.download(doc.id);
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({ text: 'Erreur lors du téléchargement', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleOpenDetails = (doc: Document) => {
    setSelectedDocument(doc);
    setShowModal(true);
  };

  const formatSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-100 text-green-700';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-700';
      case 'Échec':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analyse documentaire</h1>
          <p className="text-muted-foreground">Voir et gérer tous les documents analysés.</p>
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
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom de document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Tous', ...DOCUMENT_TYPES].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Trier par date</option>
            <option value="confidentiality">Trier par confidentialité</option>
            <option value="risk">Trier par risque</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-md hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : paginatedDocuments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {documents.length === 0 ? 'Aucun document trouvé' : 'Aucun document ne correspond aux filtres'}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nom du document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Extension</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3">Niveau de confidentialité</th>
                <th className="px-4 py-3">Date d'analyse</th>
                <th className="px-4 py-3">Résultat</th>
                <th className="px-4 py-3">Score risque</th>
                <th className="px-4 py-3">Données sensibles</th>
                <th className="px-4 py-3">Recommandations</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedDocuments.map((doc) => {
                const sensitiveDataCount = doc.detectedDataTypes ? doc.detectedDataTypes.split(',').filter(t => t.trim()).length : 0;
                const analysisResult = doc.analysisStatus === 'Terminé' 
                  ? (sensitiveDataCount > 0 ? 'Risques détectés' : 'Aucun risque')
                  : doc.analysisStatus === 'Échec' 
                  ? 'Erreur'
                  : doc.analysisStatus;
                const riskScore = doc.riskScore !== undefined ? `${doc.riskScore}%` : 'N/A';
                
                return (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{doc.fileName}</td>
                    <td className="px-4 py-3">{doc.documentType || 'N/A'}</td>
                    <td className="px-4 py-3">{doc.extension || 'N/A'}</td>
                    <td className="px-4 py-3">{formatSize(doc.fileSize)}</td>
                    <td className="px-4 py-3">
                      {doc.confidentialityLevel && CONFIDENTIALITY_LEVELS.includes(doc.confidentialityLevel.toUpperCase() as ConfidentialityLevel) ? (
                        <ClassificationStamp level={doc.confidentialityLevel.toUpperCase() as ConfidentialityLevel} />
                      ) : doc.confidentialityLevel ? doc.confidentialityLevel : 'N/A'}
                    </td>
                    <td className="px-4 py-3">{formatDate(doc.analysedAt || doc.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        analysisResult === 'Aucun risque' ? 'bg-green-100 text-green-700' :
                        analysisResult === 'Risques détectés' ? 'bg-yellow-100 text-yellow-700' :
                        analysisResult === 'Erreur' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {analysisResult}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        (doc.riskScore || 0) >= 70 ? 'text-red-600' :
                        (doc.riskScore || 0) >= 40 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sensitiveDataCount}</td>
                    <td className="px-4 py-3">{doc.recommendationsCount || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(doc.analysisStatus)}`}>
                        {doc.analysisStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(doc)}
                        >
                          Ouvrir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          Télécharger
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(doc)}
                          disabled={doc.analysisStatus !== 'Terminé'}
                        >
                          Voir le rapport
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReanalyse(doc.id)}
                          disabled={reanalysingId === doc.id}
                        >
                          {reanalysingId === doc.id ? 'En cours...' : 'Re-analyser'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {filteredDocuments.length} document(s)
          </span>
          {filteredDocuments.length > pageSize && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Document Details Modal */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedDocument.fileName}</h2>
              <Button variant="ghost" onClick={() => setShowModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Analysis Status & Errors */}
              {selectedDocument.analysisStatus === 'Échec' && selectedDocument.analysisError && (
                <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg">
                  <h3 className="font-semibold text-red-300 mb-2">Erreur d'analyse</h3>
                  <p className="text-red-200">{selectedDocument.analysisError}</p>
                </div>
              )}

              {/* Metadata */}
              <section>
                <h3 className="font-semibold mb-3 text-zinc-200">Métadonnées</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-zinc-400">Nom:</span> <span className="text-zinc-100">{selectedDocument.fileName}</span></div>
                  <div><span className="text-zinc-400">Taille:</span> <span className="text-zinc-100">{formatSize(selectedDocument.fileSize)}</span></div>
                  <div><span className="text-zinc-400">Extension:</span> <span className="text-zinc-100">{selectedDocument.extension || 'N/A'}</span></div>
                  <div><span className="text-zinc-400">Chemin:</span> <span className="text-zinc-100">{selectedDocument.filePath || 'N/A'}</span></div>
                  <div><span className="text-zinc-400">Date de création:</span> <span className="text-zinc-100">{formatDate(selectedDocument.createdAt)}</span></div>
                  <div><span className="text-zinc-400">Date de modification:</span> <span className="text-zinc-100">{formatDate(selectedDocument.updatedAt)}</span></div>
                  {selectedDocument.analysedAt && <div><span className="text-zinc-400">Date d'analyse:</span> <span className="text-zinc-100">{formatDate(selectedDocument.analysedAt)}</span></div>}
                </div>
              </section>

              {/* AI Detection Results */}
              <section>
                <h3 className="font-semibold mb-3 text-zinc-200">Résultats de l'analyse IA</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-zinc-400">Type détecté par l'IA:</span>
                    <span className="ml-2 font-medium text-zinc-100">{selectedDocument.detectedDocumentType || 'Non détecté'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Niveau de confidentialité détecté:</span>
                    <span className="ml-2">
                      {selectedDocument.detectedConfidentialityLevel ? (
                        <ClassificationStamp level={selectedDocument.detectedConfidentialityLevel.toUpperCase() as ConfidentialityLevel} />
                      ) : 'Non détecté'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Données sensibles détectées:</span>
                    {selectedDocument.sensitiveData && selectedDocument.sensitiveData.length > 0 ? (
                      <ul className="mt-1 ml-5 list-disc text-zinc-200">
                        {selectedDocument.sensitiveData.map((item, idx) => (
                          <li key={idx}>{item.type}: {item.value}</li>
                        ))}
                      </ul>
                    ) : <span className="text-zinc-200">Aucune</span>}
                  </div>
                </div>
              </section>

              {/* Extracted Text */}
              <section>
                <h3 className="font-semibold mb-3 text-zinc-200">Texte extrait</h3>
                {selectedDocument.extractedText ? (
                  <div className="p-4 bg-zinc-800 border border-zinc-700 rounded overflow-auto max-h-60">
                    <pre className="text-sm text-zinc-100 whitespace-pre-wrap">{selectedDocument.extractedText}</pre>
                  </div>
                ) : (
                  <p className="text-zinc-400">Aucun texte extrait</p>
                )}
              </section>

              {/* OCR Result (for images) */}
              {selectedDocument.ocrText && (
                <section>
                  <h3 className="font-semibold mb-3 text-zinc-200">Résultat OCR</h3>
                  <div className="p-4 bg-zinc-800 border border-zinc-700 rounded overflow-auto max-h-60">
                    <pre className="text-sm text-zinc-100 whitespace-pre-wrap">{selectedDocument.ocrText}</pre>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
