import { useEffect, useState } from 'react';
import { rssiApi } from '../api/services';
import '../styles/Pages.css';

interface Recommendation {
  id: number;
  riskTitle: string;
  description: string;
  priority: string;
  status: string;
  assignedTo?: string;
  deadline?: string;
  progress?: number;
  rssiComment?: string;
  updatedAt?: string;
}

export default function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rssiApi.getRecommendations();
      const payload = res?.data?.data;
      let data: Recommendation[] = Array.isArray(payload) ? payload : [];

      // filter out empty
      data = data.filter((d: Recommendation | null | undefined) => d && (d.riskTitle || d.description));

      // dedupe by id/riskTitle
      const map = new Map<number, Recommendation>();
      for (const d of data) {
        if (typeof d.id === 'number') {
          map.set(d.id, d);
        }
      }

      setItems(Array.from(map.values()));
      setPage(1);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Impossible de charger les recommandations. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg: string) => {
    // simple notification via state for now
    // Could be replaced with a toast library
    alert(msg);
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      setLoading(true);
      await rssiApi.updateRecommendation(id, status);
      notify('Statut mis à jour');
      await load();
    } catch (err) {
      console.error('Error updating recommendation:', err);
      notify('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // date formatting inline where needed

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDEE': return '#16a34a';
      case 'EN_COURS': return '#2563eb';
      case 'TERMINEE': return '#059669';
      case 'REJETEE': return '#dc2626';
      case 'APPLIQUEE': return '#0891b2';
      case 'PROPOSEE': return '#64748b';
      default: return '#64748b';
    }
  };

  const filtered = items.filter(i => {
    if (search) {
      const s = search.toLowerCase();
      if (!((i.riskTitle || '').toLowerCase().includes(s) || (i.description || '').toLowerCase().includes(s) || (i.assignedTo || '').toLowerCase().includes(s))) return false;
    }
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Recommandations IA</h2>
          <p className="page-subtitle">Mesures proposées par le Copilote — validation RSSI</p>
        </div>
        <span className="page-badge">{items.length} recommandation(s)</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Recherche recommandation, risque, assigné" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">Tous statuts</option>
          <option value="PROPOSEE">PROPOSEE</option>
          <option value="VALIDEE">VALIDEE</option>
          <option value="EN_COURS">EN_COURS</option>
          <option value="TERMINEE">TERMINEE</option>
          <option value="REJETEE">REJETEE</option>
        </select>
        <button className="btn-sm" onClick={load}>Rafraîchir</button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading" style={{ padding: 20 }}>Chargement des recommandations...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Risque</th>
                <th>Description</th>
                <th>Priorité</th>
                <th>Assigné à</th>
                <th>Deadline</th>
                <th>Progression</th>
                <th>Commentaire RSSI</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty">Aucune recommandation trouvée.</td>
                </tr>
              ) : (
                paginated.map((rec) => (
                  <tr key={rec.id}>
                    <td className="cell-filename">{rec.riskTitle || 'Non disponible'}</td>
                    <td>{rec.description || 'Non disponible'}</td>
                    <td>
                      <span className="badge">{rec.priority || 'Non disponible'}</span>
                    </td>
                    <td>{rec.assignedTo || 'Non disponible'}</td>
                    <td>{rec.deadline ? new Date(rec.deadline).toLocaleDateString('fr-FR') : 'Non disponible'}</td>
                    <td>
                      {rec.progress !== undefined && rec.progress !== null ? (
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${rec.progress}%` }}
                          >
                            {rec.progress}%
                          </div>
                        </div>
                      ) : 'Non disponible'}
                    </td>
                    <td>{rec.rssiComment || 'Non disponible'}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(rec.status), color: '#fff' }}
                      >
                        {rec.status?.replace(/_/g, ' ') || 'Non disponible'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-row">
                        {rec.status === 'PROPOSEE' && (
                          <>
                            <button 
                              type="button" 
                              className="btn-sm" 
                              onClick={() => handleStatus(rec.id, 'VALIDEE')}
                            >
                              Valider
                            </button>
                            <button 
                              type="button" 
                              className="btn-sm btn-danger" 
                              onClick={() => handleStatus(rec.id, 'REJETEE')}
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                        {rec.status === 'VALIDEE' && (
                          <button 
                            type="button" 
                            className="btn-sm" 
                            onClick={() => handleStatus(rec.id, 'EN_COURS')}
                          >
                            Démarrer
                          </button>
                        )}
                        {rec.status === 'EN_COURS' && (
                          <button 
                            type="button" 
                            className="btn-sm" 
                            onClick={() => handleStatus(rec.id, 'TERMINEE')}
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className="btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Préc</button>
          <span style={{ margin: '0 8px' }}>{page} / {totalPages}</span>
          <button className="btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suiv</button>
        </div>
        <div>
          <label>Par page:&nbsp;
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
