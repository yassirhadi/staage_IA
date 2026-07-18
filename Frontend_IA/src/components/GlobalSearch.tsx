import { useState, useEffect } from 'react';
import { inventoryApi, aiApi, rssiApi, assetsApi } from '../api/services';
import '../styles/GlobalSearch.css';

interface SearchResult {
  type: 'document' | 'risk' | 'recommendation' | 'asset';
  id: number;
  title: string;
  description?: string;
  metadata?: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search documents
        const docsRes = await inventoryApi.getDocuments();
        const documents = docsRes.data.data || [];
        documents.forEach((doc: any) => {
          if (doc.fileName?.toLowerCase().includes(query.toLowerCase()) ||
              doc.documentType?.toLowerCase().includes(query.toLowerCase()) ||
              doc.confidentialityLevel?.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              type: 'document',
              id: doc.id,
              title: doc.fileName,
              description: doc.documentType,
              metadata: `${doc.confidentialityLevel} • ${doc.fileSize} bytes`,
            });
          }
        });

        // Search risks
        const risksRes = await aiApi.getRisks();
        const risks = risksRes.data.data || [];
        risks.forEach((risk: any) => {
          if (risk.title?.toLowerCase().includes(query.toLowerCase()) ||
              risk.description?.toLowerCase().includes(query.toLowerCase()) ||
              risk.category?.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              type: 'risk',
              id: risk.id,
              title: risk.title,
              description: risk.description,
              metadata: `${risk.severity} • ${risk.category}`,
            });
          }
        });

        // Search recommendations
        const recsRes = await rssiApi.getRecommendations();
        const recommendations = recsRes.data.data || [];
        recommendations.forEach((rec: any) => {
          if (rec.riskTitle?.toLowerCase().includes(query.toLowerCase()) ||
              rec.description?.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              type: 'recommendation',
              id: rec.id,
              title: rec.riskTitle,
              description: rec.description,
              metadata: `${rec.priority} • ${rec.status}`,
            });
          }
        });

        // Search assets
        const assetsRes = await assetsApi.getAll();
        const assets = assetsRes.data.data || [];
        assets.forEach((asset: any) => {
          if (asset.name?.toLowerCase().includes(query.toLowerCase()) ||
              asset.assetType?.toLowerCase().includes(query.toLowerCase()) ||
              asset.description?.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              type: 'asset',
              id: asset.id,
              title: asset.name,
              description: asset.description,
              metadata: `${asset.assetType} • ${asset.criticality}`,
            });
          }
        });

        setResults(searchResults.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'risk': return '⚠️';
      case 'recommendation': return '📋';
      case 'asset': return '💼';
      default: return '🔍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return '#2563eb';
      case 'risk': return '#ea580c';
      case 'recommendation': return '#16a34a';
      case 'asset': return '#7c3aed';
      default: return '#64748b';
    }
  };

  if (!isOpen) {
    return (
      <button
        className="global-search-trigger"
        onClick={() => setIsOpen(true)}
        title="Recherche globale (Ctrl+K)"
      >
        🔍 Recherche (Ctrl+K)
      </button>
    );
  }

  return (
    <div className="global-search-overlay" onClick={() => setIsOpen(false)}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans toute l'application..."
            className="search-input"
          />
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {loading && (
          <div className="search-loading">Recherche en cours...</div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="search-empty">Aucun résultat trouvé pour "{query}"</div>
        )}

        {!loading && results.length > 0 && (
          <div className="search-results">
            {results.map((result) => (
              <div key={`${result.type}-${result.id}`} className="search-result-item">
                <div className="result-icon" style={{ backgroundColor: getTypeColor(result.type) }}>
                  {getTypeIcon(result.type)}
                </div>
                <div className="result-content">
                  <div className="result-title">{result.title}</div>
                  {result.description && (
                    <div className="result-description">{result.description}</div>
                  )}
                  {result.metadata && (
                    <div className="result-metadata">{result.metadata}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!query && (
          <div className="search-shortcuts">
            <div className="shortcut-hint">
              <kbd>Ctrl</kbd> + <kbd>K</kbd> pour ouvrir la recherche
            </div>
            <div className="shortcut-hint">
              <kbd>Esc</kbd> pour fermer
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
