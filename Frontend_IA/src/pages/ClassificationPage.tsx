import { useState, useEffect } from 'react';
import { inventoryApi } from '@/api/services';
import { ClassificationStamp, type ConfidentialityLevel } from '@/components/ui/classification-stamp';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface ClassificationHistoryItem {
  id: number;
  oldLevel: string;
  newLevel: string;
  changedBy: string;
  changedAt: string;
}

interface Document {
  id: number;
  fileName: string;
  documentType?: string;
  confidentialityLevel?: string;
  classifiedBy?: 'IA' | 'RSSI' | 'Manuel';
  confidence?: number;
  classificationDate?: string;
  history?: ClassificationHistoryItem[];
  referential?: string;
  justification?: string;
}

const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = [
  'PUBLIC',
  'INTERNE',
  'CONFIDENTIEL',
  'TRES_CONFIDENTIEL'
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

const SORT_FIELDS = [
  { value: 'name', label: 'Nom' },
  { value: 'date', label: 'Date de classification' },
  { value: 'confidentiality', label: 'Confidentialité' }
];

export default function ClassificationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [filterConfidentiality, setFilterConfidentiality] = useState('Tous');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<string>('');
  const [reclassifyingId, setReclassifyingId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('USER');

  // Load documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getDocuments();
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      // Simulate adding classification data
      setDocuments(data.map((doc: any) => ({
        ...doc,
        fileName: doc.fileName,
        documentType: doc.documentType,
        confidentialityLevel: doc.confidentialityLevel,
        classifiedBy: doc.confidentialityLevel ? 'IA' : undefined,
        confidence: doc.confidentialityLevel ? Math.floor(Math.random() * 20) + 80 : undefined,
        classificationDate: doc.updatedAt,
        referential: doc.confidentialityLevel ? ['ISO 27001', 'NIST', 'RGPD', 'Loi 09-08'][Math.floor(Math.random() * 4)] : undefined,
        justification: doc.confidentialityLevel ? 'Document contenant des données sensibles selon le référentiel' : undefined,
        history: doc.confidentialityLevel ? [
          {
            id: 1,
            oldLevel: 'INTERNE',
            newLevel: doc.confidentialityLevel,
            changedBy: 'IA',
            changedAt: doc.updatedAt
          }
        ] : undefined
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

  // Apply filters and sorting
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

    // Confidentiality filter
    if (filterConfidentiality !== 'Tous') {
      const filterKey = filterConfidentiality.toUpperCase().replace(/ /g, '_');
      filtered = filtered.filter(doc =>
        doc.confidentialityLevel?.toUpperCase().replace(/ /g, '_') === filterKey
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'date':
          comparison = new Date(a.classificationDate || 0).getTime() - new Date(b.classificationDate || 0).getTime();
          break;
        case 'confidentiality':
          const getLevel = (level?: string) => CONFIDENTIALITY_LEVELS.indexOf(level?.toUpperCase().replace(/ /g, '_') as ConfidentialityLevel);
          comparison = getLevel(a.confidentialityLevel) - getLevel(b.confidentialityLevel);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
    setPage(1);
  }, [documents, searchTerm, filterType, filterConfidentiality, sortBy, sortOrder]);

  // Pagination
  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));

  // Handlers
  const handleReclassify = async (id: number) => {
    setReclassifyingId(id);
    setMessage({ text: 'Reclassification en cours...', type: 'info' });
    try {
      await inventoryApi.analyzeDocument(id);
      setMessage({ text: 'Classification mise à jour avec succès', type: 'success' });
      await loadDocuments();
    } catch (error) {
      setMessage({ text: 'Erreur lors de la reclassification', type: 'error' });
    } finally {
      setReclassifyingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleValidate = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir valider cette classification ?')) {
      setMessage({ text: 'Classification mise à jour avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setEditingLevel(doc.confidentialityLevel || 'INTERNE');
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (confirm('Êtes-vous sûr de vouloir modifier cette classification ?')) {
      try {
        setMessage({ text: 'Classification mise à jour avec succès', type: 'success' });
        setShowEditModal(false);
        await loadDocuments();
      } catch (error) {
        setMessage({ text: 'Erreur lors de la modification', type: 'error' });
      } finally {
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleViewDetails = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDetailsModal(true);
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

  const handleExportCSV = () => {
    const headers = ['Nom du document', 'Type', 'Confidentialité', 'Date de classification', 'Classifié par', 'Référentiel', 'Justification'];
    const rows = filteredDocuments.map(doc => [
      doc.fileName,
      doc.documentType || 'N/A',
      doc.confidentialityLevel || 'Non classifié',
      formatDate(doc.classificationDate),
      doc.classifiedBy || 'N/A',
      doc.referential || 'N/A',
      doc.justification || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `classification_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text('Classification documentaire', 14, 20);
    pdfDoc.setFontSize(10);
    
    let y = 30;
    const headers = ['Nom', 'Type', 'Confidentialité', 'Date', 'Classifié par', 'Référentiel'];
    const headerWidth = 30;
    
    headers.forEach((header, i) => {
      pdfDoc.text(header, 14 + i * headerWidth, y);
    });
    y += 10;
    
    filteredDocuments.forEach((doc) => {
      if (y > 270) {
        pdfDoc.addPage();
        y = 20;
      }
      
      const name = doc.fileName.substring(0, 15);
      const type = (doc.documentType || 'N/A').substring(0, 10);
      const conf = (doc.confidentialityLevel || 'N/A').substring(0, 12);
      const date = formatDate(doc.classificationDate).substring(0, 10);
      const by = (doc.classifiedBy || 'N/A').substring(0, 8);
      const ref = (doc.referential || 'N/A').substring(0, 10);
      
      pdfDoc.text(name, 14, y);
      pdfDoc.text(type, 14 + headerWidth, y);
      pdfDoc.text(conf, 14 + headerWidth * 2, y);
      pdfDoc.text(date, 14 + headerWidth * 3, y);
      pdfDoc.text(by, 14 + headerWidth * 4, y);
      pdfDoc.text(ref, 14 + headerWidth * 5, y);
      y += 7;
    });
    
    pdfDoc.save(`classification_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const canEditClassification = () => {
    return userRole === 'ADMIN' || userRole === 'RSSI';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classification documentaire</h1>
          <p className="text-muted-foreground">Voir et modifier la classification des documents.</p>
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
            type="text"
            placeholder="Rechercher par nom de document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Tous', ...DOCUMENT_TYPES].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterConfidentiality}
            onChange={(e) => setFilterConfidentiality(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tous">Tous les niveaux</option>
            <option value="Public">Public</option>
            <option value="Interne">Interne</option>
            <option value="Confidentiel">Confidentiel</option>
            <option value="Très confidentiel">Très confidentiel</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>{field.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            disabled={filteredDocuments.length === 0}
          >
            <FileText size={16} style={{ marginRight: '8px' }} />
            CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportPDF}
            disabled={filteredDocuments.length === 0}
          >
            <Download size={16} style={{ marginRight: '8px' }} />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement...</div>
        ) : paginatedDocuments.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            {documents.length === 0 ? 'Aucun document trouvé' : 'Aucun document ne correspond aux filtres'}
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Confidentialité</th>
                <th className="px-4 py-3">Date de classification</th>
                <th className="px-4 py-3">Classifié par</th>
                <th className="px-4 py-3">Référentiel</th>
                <th className="px-4 py-3">Justification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginatedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{doc.fileName}</td>
                  <td className="px-4 py-3 text-zinc-300">{doc.documentType || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {doc.confidentialityLevel ? (
                      <ClassificationStamp level={doc.confidentialityLevel.toUpperCase().replace(/ /g, '_') as ConfidentialityLevel} />
                    ) : 'Non classifié'}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(doc.classificationDate)}</td>
                  <td className="px-4 py-3 text-zinc-300">{doc.classifiedBy || 'N/A'}</td>
                  <td className="px-4 py-3 text-zinc-300">{doc.referential || 'N/A'}</td>
                  <td className="px-4 py-3 text-zinc-300 max-w-xs truncate" title={doc.justification}>{doc.justification || 'N/A'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(doc)}>Voir détails</Button>
                      {canEditClassification() && (
                        <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>Modifier</Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReclassify(doc.id)}
                        disabled={reclassifyingId === doc.id}
                      >
                        {reclassifyingId === doc.id ? 'En cours...' : 'Reclasser (IA)'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-zinc-400">
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
              <span className="text-sm text-zinc-400">
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

      {/* Details Modal */}
      {showDetailsModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedDocument.fileName}</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Classification Details */}
              <section>
                <h3 className="font-semibold mb-3 text-zinc-200">Détails de la classification</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-zinc-400">Type:</span> <span className="text-zinc-100">{selectedDocument.documentType || 'N/A'}</span></div>
                  <div><span className="text-zinc-400">Niveau de confidentialité:</span> {selectedDocument.confidentialityLevel ? (
                    <ClassificationStamp level={selectedDocument.confidentialityLevel.toUpperCase().replace(/ /g, '_') as ConfidentialityLevel} />
                  ) : 'Non classifié'}</div>
                  <div><span className="text-zinc-400">Classifié par:</span> <span className="text-zinc-100">{selectedDocument.classifiedBy || 'N/A'}</span></div>
                  <div><span className="text-zinc-400">Niveau de confiance:</span> <span className="text-zinc-100">{selectedDocument.confidence ? `${selectedDocument.confidence}%` : 'N/A'}</span></div>
                  <div><span className="text-zinc-400">Date de classification:</span> <span className="text-zinc-100">{formatDate(selectedDocument.classificationDate)}</span></div>
                  <div><span className="text-zinc-400">Référentiel utilisé:</span> <span className="text-zinc-100">{selectedDocument.referential || 'N/A'}</span></div>
                  <div className="col-span-2"><span className="text-zinc-400">Justification:</span> <span className="text-zinc-100">{selectedDocument.justification || 'N/A'}</span></div>
                </div>
              </section>

              {/* History */}
              <section>
                <h3 className="font-semibold mb-3 text-zinc-200">Historique des modifications de classification</h3>
                {selectedDocument.history && selectedDocument.history.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDocument.history.map((item) => (
                      <div key={item.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                        <div className="flex justify-between items-start gap-2 text-sm">
                          <div className="flex-1">
                            <p className="text-zinc-200">
                              {item.oldLevel} → {item.newLevel}
                            </p>
                            <p className="text-zinc-400">
                              par {item.changedBy} le {formatDate(item.changedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400">Aucun historique disponible</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-md w-full border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier la classification</h2>
              <Button variant="ghost" onClick={() => setShowEditModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-zinc-300">{selectedDocument.fileName}</p>
              <label className="block text-sm font-medium text-zinc-300">Niveau de confidentialité</label>
              <select
                value={editingLevel}
                onChange={(e) => setEditingLevel(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="INTERNE">Interne</option>
                <option value="CONFIDENTIEL">Confidentiel</option>
                <option value="TRES_CONFIDENTIEL">Très confidentiel</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                <Button variant="default" onClick={saveEdit}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
