import { useEffect, useState } from 'react';
import { rssiApi } from '../api/services';
import * as XLSX from 'xlsx';
import '../styles/Pages.css';

interface AuditLog {
  id: number;
  username: string;
  action: string;
  entityType: string;
  details: string;
  createdAt: string;
  ipAddress?: string;
  browser?: string;
  duration?: number;
  success?: boolean;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await rssiApi.getAuditLogs();
        let data: AuditLog[] = Array.isArray(res.data.data) ? res.data.data : [];
        data = data.filter(l => l && (l.username || l.action || l.entityType));
        const map = new Map<number, AuditLog>();
        for (const l of data) map.set(l.id, l);
        setLogs(Array.from(map.values()));
      } catch (e) {
        console.error(e);
        setError('Impossible de charger les logs d\'audit.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportExcel = () => {
    const data = logs.map((log) => ({
      Date: new Date(log.createdAt).toLocaleString('fr-FR'),
      Utilisateur: log.username,
      Action: log.action,
      Entité: log.entityType,
      Détails: log.details,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');
    XLSX.writeFile(wb, 'Journal_Audit.xlsx');
  };

  const formatDate = (dateString: string) => {
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
    } catch { return 'Non disponible'; }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Journal d'audit</h2>
          <p className="page-subtitle">Traçabilité des actions (login, scan, analyse, rapports...)</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="page-badge">{logs.length} log(s)</span>
          <input placeholder="Recherche" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <input placeholder="Utilisateur" value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }} />
          <input placeholder="Action" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }} />
          <button type="button" className="btn-primary" onClick={exportExcel}>Export Excel</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading" style={{ padding: 20 }}>Chargement des logs...</div>
        ) : error ? (
          <div className="error-message" style={{ padding: 20 }}>{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Entité</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="empty">Aucun log. Connectez-vous et lancez des actions.</td></tr>
              ) : (
                (() => {
                  const filtered = logs.filter(l => {
                    if (search) {
                      const s = search.toLowerCase();
                      if (!((l.username || '').toLowerCase().includes(s) || (l.action || '').toLowerCase().includes(s) || (l.entityType || '').toLowerCase().includes(s) || (l.details || '').toLowerCase().includes(s))) return false;
                    }
                    if (filterUser && l.username !== filterUser) return false;
                    if (filterAction && l.action !== filterAction) return false;
                    return true;
                  });
                  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
                  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
                  return (
                    <>
                      {paginated.map(log => (
                        <tr key={log.id}>
                          <td>{formatDate(log.createdAt)}</td>
                          <td>{log.username || 'Non disponible'}</td>
                          <td>{log.action || 'Non disponible'}</td>
                          <td>{log.entityType || 'Non disponible'}</td>
                          <td>{log.details || 'Non disponible'}</td>
                        </tr>
                      ))}
                      {filtered.length === 0 && <tr><td colSpan={5} className="empty">Aucun log trouvé.</td></tr>}
                      <tr><td colSpan={5}>
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
                      </td></tr>
                    </>
                  );
                })()
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
