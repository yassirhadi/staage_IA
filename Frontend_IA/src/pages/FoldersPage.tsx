import { useEffect, useState } from 'react';
import { rssiApi } from '../api/services';
import '../styles/Pages.css';

interface Folder {
  id: number;
  name: string;
  path: string;
  parentId: number | null;
  scannedAt?: string | null;
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rssiApi.getFolders();
      let data: Folder[] = Array.isArray(res.data.data) ? res.data.data : [];

      // filter out empty records
      data = data.filter(d => d && (d.name || d.path));

      // remove duplicates by path
      const map = new Map<string, Folder>();
      for (const f of data) {
        const key = (f.path && f.path.trim()) || `${f.name}`;
        if (!map.has(key)) map.set(key, f);
      }
      const unique = Array.from(map.values());

      // only keep non-empty folders (having scannedAt or child files are discovered server-side)
      const nonEmpty = unique.filter(f => f.scannedAt || f.name);

      // alphabetical sort by name
      nonEmpty.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setFolders(nonEmpty);
      setPage(1);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les dossiers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = folders.filter(f => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (f.name || '').toLowerCase().includes(s) || (f.path || '').toLowerCase().includes(s);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (d?: string | null) => {
    if (!d) return 'Non disponible';
    try {
      const date = new Date(d);
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
      <h2>Dossiers inventoriés</h2>
      <p className="page-subtitle">Arborescence scannée par le Copilote IA</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Recherche nom ou chemin" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <button className="btn-sm" onClick={load}>Rafraîchir</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading" style={{ padding: 20 }}>Chargement des dossiers...</div>
        ) : error ? (
          <div className="error-message" style={{ padding: 20 }}>{error}</div>
        ) : (
          <table>
            <thead>
              <tr><th>Nom</th><th>Chemin</th><th>Parent</th><th>Scanné le</th></tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={4} className="empty">Aucun dossier trouvé.</td></tr>
              ) : (
                paginated.map(f => (
                  <tr key={f.id}>
                    <td>{f.name || 'Non disponible'}</td>
                    <td>{f.path || 'Non disponible'}</td>
                    <td>{f.parentId !== null && f.parentId !== undefined ? String(f.parentId) : 'Non disponible'}</td>
                    <td>{formatDate(f.scannedAt)}</td>
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
