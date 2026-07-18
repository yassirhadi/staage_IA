import { useEffect, useState } from 'react';
import { inventoryApi } from '../api/services';
import AnalysisReport from '../components/AnalysisReport';
import { ClassificationStamp, type ConfidentialityLevel } from '../components/ui/classification-stamp';
import { Download, RefreshCw, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import '../styles/Pages.css';

const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = [
  'NON_CLASSIFIE',
  'PUBLIC',
  'INTERNE',
  'CONFIDENTIEL',
  'TRES_CONFIDENTIEL',
];

interface Document {
  id: number;
  fileName: string;
  extension: string;
  fileSize: number;
  analysisStatus: string;
  documentType?: string;
  confidentialityLevel?: string;
  filePath?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PATH = 'D:\\Stage_IA\\sample-documents';

export default function InventoryPage() {
  const [directoryPath, setDirectoryPath] = useState(DEFAULT_PATH);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterConfidentiality, setFilterConfidentiality] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Analysis report
  const [showReport, setShowReport] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [previewState, setPreviewState] = useState<{ open: boolean; type: 'text' | 'pdf' | 'image' | 'docx' | 'unsupported' | 'error'; content?: string; url?: string; fileName?: string; error?: string }>({ open: false, type: 'unsupported' });
  const [lastInventoryDate, setLastInventoryDate] = useState<string>('N/A');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDocuments = async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await inventoryApi.getDocuments();
      const data = res.data.data;
      let docs: Document[] = Array.isArray(data) ? data : [];

      // Remove empty and duplicate documents (keyed by filePath when available)
      docs = docs.filter(d => d && (d.filePath || d.fileName));
      const uniqueMap = new Map<string, Document>();
      for (const d of docs) {
        const key = (d.filePath && d.filePath.trim()) || `${d.fileName}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, d);
        } else {
          // prefer the most recently updated one
          const existing = uniqueMap.get(key)!;
          const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          const currentTime = d.updatedAt ? new Date(d.updatedAt).getTime() : 0;
          if (currentTime > existingTime) uniqueMap.set(key, d);
        }
      }

      const uniqueDocs = Array.from(uniqueMap.values());

      // Sort by updatedAt descending by default
      uniqueDocs.sort((a, b) => (new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime()));

      setDocuments(uniqueDocs);
      
      // Set last inventory date
      if (uniqueDocs.length > 0) {
        const latestDoc = uniqueDocs[0];
        const latestDate = latestDoc.updatedAt || latestDoc.createdAt;
        if (latestDate) {
          const date = new Date(latestDate);
          setLastInventoryDate(date.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }));
        }
      }
      
      setPage(1);
    } catch (err) {
      console.error('Error loading documents:', err);
      setFetchError('Impossible de charger les documents. Vérifiez que le backend est démarré.');
    } finally {
      setFetchLoading(false);
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
    if (filterType !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    // Confidentiality filter
    if (filterConfidentiality !== 'ALL') {
      filtered = filtered.filter(doc => doc.confidentialityLevel === filterConfidentiality);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'size':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
        case 'date':
          comparison = new Date(a.updatedAt || '').getTime() - new Date(b.updatedAt || '').getTime();
          break;
        case 'type':
          comparison = (a.documentType || '').localeCompare(b.documentType || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
    setPage(1);
  }, [documents, searchTerm, filterType, filterConfidentiality, sortBy, sortOrder]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterConfidentiality('ALL');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  // Pagination slice
  const paginatedDocuments = filteredDocuments.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setScanProgress(0);
    setMessage('');
    
    try {
      // Simulate scan progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const res = await inventoryApi.scan(directoryPath);
      clearInterval(progressInterval);
      setScanProgress(100);
      
      const result = res.data.data;
      const count = result?.filesScanned ?? 0;
      
      if (count === 0) {
        setMessageType('info');
        setMessage('Aucun fichier trouvé dans ce dossier.');
      } else {
        setMessageType('success');
        setMessage('Scan terminé avec succès.');
      }
      
      await loadDocuments();
    } catch (error: any) {
      setScanProgress(0);
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || 'Erreur lors du scan.';
      setMessageType('error');
      setMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = async () => {
    setLoading(true);
    setScanProgress(0);
    setMessage('');
    
    try {
      // Simulate scan progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const res = await inventoryApi.scan(directoryPath);
      clearInterval(progressInterval);
      setScanProgress(100);
      
      const result = res.data.data;
      const count = result?.filesScanned ?? 0;
      
      if (count === 0) {
        setMessageType('info');
        setMessage('Aucun fichier trouvé dans ce dossier.');
      } else {
        setMessageType('success');
        setMessage('Rescan terminé avec succès.');
      }
      
      await loadDocuments();
    } catch (error: any) {
      setScanProgress(0);
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || 'Erreur lors du rescan.';
      setMessageType('error');
      setMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nom du fichier', 'Extension', 'Taille (octets)', 'Type', 'Confidentialité', 'Date de création', 'Date de modification'];
    const rows = filteredDocuments.map(doc => [
      doc.fileName,
      doc.extension,
      doc.fileSize,
      doc.documentType || 'N/A',
      doc.confidentialityLevel || 'NON_CLASSIFIE',
      doc.createdAt || 'N/A',
      doc.updatedAt || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const data = filteredDocuments.map(doc => ({
      'Nom du fichier': doc.fileName,
      'Extension': doc.extension,
      'Taille (octets)': doc.fileSize,
      'Type': doc.documentType || 'N/A',
      'Confidentialité': doc.confidentialityLevel || 'NON_CLASSIFIE',
      'Date de création': doc.createdAt || 'N/A',
      'Date de modification': doc.updatedAt || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
    XLSX.writeFile(wb, `inventaire_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text('Inventaire des documents', 14, 20);
    pdfDoc.setFontSize(10);
    
    let y = 30;
    const headers = ['Nom', 'Type', 'Confidentialité', 'Taille'];
    const headerWidth = 40;
    
    headers.forEach((header, i) => {
      pdfDoc.text(header, 14 + i * headerWidth, y);
    });
    y += 10;
    
    filteredDocuments.forEach((doc) => {
      if (y > 270) {
        pdfDoc.addPage();
        y = 20;
      }
      
      const name = doc.fileName.substring(0, 20);
      const type = (doc.documentType || 'N/A').substring(0, 10);
      const conf = (doc.confidentialityLevel || 'N/A').substring(0, 12);
      const size = `${doc.fileSize} octets`;
      
      pdfDoc.text(name, 14, y);
      pdfDoc.text(type, 14 + headerWidth, y);
      pdfDoc.text(conf, 14 + headerWidth * 2, y);
      pdfDoc.text(size, 14 + headerWidth * 3, y);
      y += 7;
    });
    
    pdfDoc.save(`inventaire_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate file counts by confidentiality level
  const confidentialityCounts = {
    PUBLIC: documents.filter(d => d.confidentialityLevel === 'PUBLIC').length,
    INTERNE: documents.filter(d => d.confidentialityLevel === 'INTERNE').length,
    CONFIDENTIEL: documents.filter(d => d.confidentialityLevel === 'CONFIDENTIEL').length,
    TRES_CONFIDENTIEL: documents.filter(d => d.confidentialityLevel === 'TRES_CONFIDENTIEL').length,
    NON_CLASSIFIE: documents.filter(d => !d.confidentialityLevel || d.confidentialityLevel === 'NON_CLASSIFIE').length,
  };

  const handleAnalyze = async (id: number) => {
    try {
      await inventoryApi.analyzeDocument(id);
      const analysisResponse = await inventoryApi.getAnalysisResult(id);
      const payload = analysisResponse?.data?.data;
      setMessageType('success');
      setMessage('Analyse IA terminée avec succès.');
      await loadDocuments();

      const doc = documents.find(d => d.id === id);
      if (doc) {
        setSelectedDocument(doc);
        setAnalysisData({
          documentType: payload?.documentType,
          confidentialityLevel: payload?.confidentialityLevel,
          piiDetected: payload?.piiDetected,
          detectedDataTypes: payload?.detectedDataTypes ? payload.detectedDataTypes.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
          risksCount: payload?.risksCount,
          risksDetails: payload?.risksDetails ? payload.risksDetails.split('\n').map((item: string) => item.trim()).filter(Boolean) : [],
          complianceStandards: payload?.complianceStandards ? payload.complianceStandards.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
          securityScore: payload?.securityScore,
        });
        setShowReport(true);
      }
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || 'Erreur analyse.';
      setMessageType('error');
      setMessage(`${backendMessage} Vérifiez que le service IA Python est démarré (port 8000).`);
    }
  };

  const handleDelete = async (id: number, fileName?: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${fileName || 'sélectionné'}" ? Cette action est irréversible.`)) return;
    
    try {
      await inventoryApi.deleteDocument(id);
      setMessageType('success');
      setMessage('Document supprimé avec succès.');
      await loadDocuments();
    } catch {
      setMessageType('error');
      setMessage('Erreur lors de la suppression du document.');
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const response = await inventoryApi.preview(doc.id);
      const rawContentType = response.headers['content-type'];
      const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      if (contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('xml')) {
        const text = await blob.text();
        setPreviewState({ open: true, type: 'text', content: text, fileName: doc.fileName });
      } else if (contentType.includes('pdf')) {
        const url = URL.createObjectURL(blob);
        setPreviewState({ open: true, type: 'pdf', url, fileName: doc.fileName });
      } else if (contentType.startsWith('image/')) {
        const url = URL.createObjectURL(blob);
        setPreviewState({ open: true, type: 'image', url, fileName: doc.fileName });
      } else if (contentType.includes('word') || contentType.includes('officedocument')) {
        const url = URL.createObjectURL(blob);
        setPreviewState({ open: true, type: 'docx', url, fileName: doc.fileName });
      } else {
        setPreviewState({ open: true, type: 'unsupported', error: 'Format non supporté. Aperçu non disponible pour ce type de fichier.', fileName: doc.fileName });
      }
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || 'Prévisualisation impossible.';
      setPreviewState({ open: true, type: 'error', error: backendMessage, fileName: doc.fileName });
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await inventoryApi.download(doc.id);
      const rawContentType = response.headers['content-type'];
      const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessageType('success');
      setMessage(`Téléchargement de ${doc.fileName} lancé.`);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || 'Téléchargement impossible.';
      setMessageType('error');
      setMessage(backendMessage);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return 'Non disponible';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    try {
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
    } catch {
      return 'Non disponible';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Inventaire des documents</h2>
          <p className="page-subtitle">Parcourir, inventorier et analyser les fichiers informationnels</p>
        </div>
        <span className="page-badge">{filteredDocuments.length} document(s)</span>
      </div>

      <div className="card-panel">
        <form className="scan-form" onSubmit={handleScan}>
          <input
            type="text"
            value={directoryPath}
            onChange={(e) => setDirectoryPath(e.target.value)}
            placeholder="Chemin du dossier (ex: D:\Stage_IA\sample-documents)"
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Scan en cours...' : 'Lancer le scan'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleRescan} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Rescanner
          </button>
          <button type="button" className="btn-secondary" onClick={handleExportCSV} disabled={filteredDocuments.length === 0}>
            <FileText size={16} style={{ marginRight: '8px' }} />
            CSV
          </button>
          <button type="button" className="btn-secondary" onClick={handleExportExcel} disabled={filteredDocuments.length === 0}>
            <FileSpreadsheet size={16} style={{ marginRight: '8px' }} />
            Excel
          </button>
          <button type="button" className="btn-secondary" onClick={handleExportPDF} disabled={filteredDocuments.length === 0}>
            <Download size={16} style={{ marginRight: '8px' }} />
            PDF
          </button>
        </form>
        
        {loading && (
          <div className="progress-container" style={{ marginTop: '10px' }}>
            <div 
              className="progress-bar"
              style={{
                width: `${scanProgress}%`,
                height: '8px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                borderRadius: '4px',
                transition: 'width 0.3s ease-in-out'
              }}
            />
            <p style={{ marginTop: '5px', fontSize: '12px', color: '#64748b' }}>
              Progrès: {Math.round(scanProgress)}%
            </p>
          </div>
        )}
        
        {message && <p className={`alert alert-${messageType}`}>{message}</p>}
      </div>

      {/* Statistics */}
      <div className="card-panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Heure système</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{currentTime}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Public</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>{confidentialityCounts.PUBLIC}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Interne</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>{confidentialityCounts.INTERNE}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Confidentiel</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>{confidentialityCounts.CONFIDENTIEL}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Très confidentiel</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>{confidentialityCounts.TRES_CONFIDENTIEL}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Non classifié</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#64748b' }}>{confidentialityCounts.NON_CLASSIFIE}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-panel">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tous les types</option>
            <option value="CONTRAT">Contrat</option>
            <option value="FACTURE">Facture</option>
            <option value="RAPPORT">Rapport</option>
            <option value="PROCEDURE">Procédure</option>
            <option value="POLITIQUE_SSI">Politique SSI</option>
            <option value="DOSSIER_RH">Dossier RH</option>
            <option value="NOTE_INTERNE">Note interne</option>
            <option value="AUTRE">Autre</option>
          </select>

          <select
            value={filterConfidentiality}
            onChange={(e) => setFilterConfidentiality(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tous les niveaux</option>
            <option value="PUBLIC">Public</option>
            <option value="INTERNE">Interne</option>
            <option value="CONFIDENTIEL">Confidentiel</option>
            <option value="TRES_CONFIDENTIEL">Très confidentiel</option>
            <option value="NON_CLASSIFIE">Non classifié</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Trier par nom</option>
            <option value="size">Trier par taille</option>
            <option value="date">Trier par date</option>
            <option value="type">Trier par type</option>
          </select>

          <button
            type="button"
            className="btn-sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↓ Asc' : '↓ Desc'}
          </button>

          <button
            type="button"
            className="btn-sm"
            onClick={resetFilters}
          >
            Réinitialiser filtres
          </button>
        </div>
      </div>

      <div className="table-container">
        {fetchLoading ? (
          <div className="loading" style={{ padding: 20 }}>Chargement des documents...</div>
        ) : fetchError ? (
          <div className="error-message" style={{ padding: 20 }}>{fetchError}</div>
        ) : (
          <table>
          <thead>
            <tr>
              <th>Fichier</th>
              <th>Extension</th>
              <th>Taille</th>
              <th>Type</th>
              <th>Confidentialité</th>
              <th>Date de création</th>
              <th>Date de modification</th>
              <th>Chemin complet</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocuments.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty">
                  {documents.length === 0
                    ? 'Aucun document. Lancez un scan sur le dossier sample-documents.'
                    : 'Aucun document ne correspond aux filtres.'}
                </td>
              </tr>
            ) : (
              paginatedDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td className="cell-filename">{doc.fileName || 'Non disponible'}</td>
                  <td><span className="tag">{doc.extension || 'Non disponible'}</span></td>
                  <td>{formatSize(doc.fileSize)}</td>
                  <td>{doc.documentType ? doc.documentType.replace(/_/g, ' ') : 'Non disponible'}</td>
                  <td>
                    {doc.confidentialityLevel && CONFIDENTIALITY_LEVELS.includes(doc.confidentialityLevel.toUpperCase() as ConfidentialityLevel) ? (
                      <ClassificationStamp level={doc.confidentialityLevel.toUpperCase() as ConfidentialityLevel} />
                    ) : doc.confidentialityLevel ? (
                      <span className="classification-stamp text-muted-foreground">{doc.confidentialityLevel.replace(/_/g, ' ')}</span>
                    ) : 'Non disponible'}
                  </td>
                  <td>{formatDate(doc.createdAt)}</td>
                  <td>{formatDate(doc.updatedAt)}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.filePath}>
                    {doc.filePath || 'Non disponible'}
                  </td>
                  <td>
                    <span className={`badge badge-${(doc.analysisStatus || 'unknown').toLowerCase()}`}>
                      {doc.analysisStatus || 'Non disponible'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() => handlePreview(doc)}
                        title="Prévisualiser"
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() => handleDownload(doc)}
                        title="Télécharger"
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() => handleAnalyze(doc.id)}
                        disabled={doc.analysisStatus === 'IN_PROGRESS'}
                        title="Analyser IA"
                      >
                        🤖
                      </button>
                      <button
                        type="button"
                        className="btn-sm btn-danger"
                        onClick={() => handleDelete(doc.id, doc.fileName)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        )}

        {/* Pagination controls */}
        {!fetchLoading && !fetchError && filteredDocuments.length > 0 && (
          <div className="pagination-row">
            <div>
              <button className="btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Préc</button>
              <span style={{ margin: '0 8px' }}>{page} / {totalPages}</span>
              <button className="btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suiv</button>
            </div>
            <div>
              <label>Par page:&nbsp;
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {showReport && selectedDocument && (
        <AnalysisReport
          document={selectedDocument}
          analysisData={analysisData || undefined}
          onClose={() => setShowReport(false)}
        />
      )}

      {previewState.open && (
        <div className="analysis-report-overlay" onClick={() => setPreviewState({ open: false, type: 'unsupported' })}>
          <div className="analysis-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-header">
              <h2>{previewState.fileName || 'Prévisualisation'}</h2>
              <button className="close-btn" onClick={() => setPreviewState({ open: false, type: 'unsupported' })}>✕</button>
            </div>
            <div className="report-content" style={{ maxHeight: '70vh', overflow: 'auto' }}>
              {previewState.type === 'text' && previewState.content ? (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{previewState.content}</pre>
              ) : previewState.type === 'pdf' && previewState.url ? (
                <iframe src={previewState.url} title="Preview PDF" style={{ width: '100%', height: '70vh', border: 'none' }} />
              ) : previewState.type === 'image' && previewState.url ? (
                <img src={previewState.url} alt={previewState.fileName} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
              ) : previewState.type === 'docx' && previewState.url ? (
                <div>
                  <p>Le document a été préparé pour ouverture. Vous pouvez le télécharger si nécessaire.</p>
                  <a href={previewState.url} target="_blank" rel="noreferrer">Ouvrir le document</a>
                </div>
              ) : (
                <p>{previewState.error || 'Format non supporté. Aperçu non disponible pour ce type de fichier.'}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
