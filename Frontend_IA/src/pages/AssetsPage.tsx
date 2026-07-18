import { useEffect, useState } from 'react';
import { assetsApi } from '../api/services';
import '../styles/Pages.css';

interface Asset {
  id: number;
  name: string;
  assetType: string;
  description?: string;
  owner?: string;
  criticality: string;
  status?: string;
  analysisStatus?: string;
  confidentialityLevel?: string;
  extension?: string;
  path?: string;
  size?: number;
  folderId?: number;
  value?: number;
  creationDate?: string;
  location?: string;
  responsible?: string;
  state?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCriticality, setFilterCriticality] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterConfidentiality, setFilterConfidentiality] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    name: '',
    assetType: 'INFORMATIONNEL',
    description: '',
    owner: '',
    criticality: 'MOYENNE',
    status: 'ACTIF',
    analysisStatus: 'PENDING',
    confidentialityLevel: 'NON_CLASSIFIE',
    extension: '',
    path: '',
    size: '',
    folderId: '',
    value: '',
    creationDate: '',
    location: '',
    responsible: '',
    state: '',
  });

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assetsApi.getAll();
      let data: Asset[] = Array.isArray(res.data.data) ? res.data.data : [];

      // Keep only linked assets (having a folderId)
      data = data.filter(a => a && (a.folderId || a.folderId === 0));

      // remove empty records
      data = data.filter(a => a && (a.name || a.path));

      // deduplicate by path or name
      const map = new Map<string, Asset>();
      for (const a of data) {
        const key = (a.path && a.path.trim()) || (a.name && a.name.trim()) || String(a.id);
        if (!map.has(key)) map.set(key, a);
        else {
          const existing = map.get(key)!;
          const existingTime = existing.creationDate ? new Date(existing.creationDate).getTime() : 0;
          const currentTime = a.creationDate ? new Date(a.creationDate).getTime() : 0;
          if (currentTime > existingTime) map.set(key, a);
        }
      }
      const unique = Array.from(map.values());

      setAssets(unique);
      setPage(1);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError('Impossible de charger les actifs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    try { return new Date(dateString).toLocaleDateString('fr-FR'); } catch { return 'Non disponible'; }
  };

  const formatSize = (size?: number) => {
    if (size === null || size === undefined) return 'Non disponible';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filtered = assets.filter(a => {
    if (search) {
      const s = search.toLowerCase();
      if (!((a.name || '').toLowerCase().includes(s) || (a.path || '').toLowerCase().includes(s) || (a.owner || '').toLowerCase().includes(s))) return false;
    }
    if (filterType && a.assetType !== filterType) return false;
    if (filterCriticality && a.criticality !== filterCriticality) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterConfidentiality && a.confidentialityLevel !== filterConfidentiality) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        size: form.size ? Number(form.size) : null,
        folderId: form.folderId ? Number(form.folderId) : null,
        value: form.value ? Number(form.value) : null,
      };
      await assetsApi.create(payload);
      setForm({
        name: '',
        assetType: 'INFORMATIONNEL',
        description: '',
        owner: '',
        criticality: 'MOYENNE',
        status: 'ACTIF',
        analysisStatus: 'PENDING',
        confidentialityLevel: 'NON_CLASSIFIE',
        extension: '',
        path: '',
        size: '',
        folderId: '',
        value: '',
        creationDate: '',
        location: '',
        responsible: '',
        state: '',
      });
      await loadAssets();
    } catch (err) {
      console.error('Error creating asset:', err);
      alert('Erreur lors de la création de l’actif. Vérifiez la console du navigateur.');
    }
  };

  

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Gestion des actifs</h2>
          <p className="page-subtitle">Actifs matériels, logiciels et informationnels</p>
        </div>
        <span className="page-badge">{assets.length} actif(s)</span>
      </div>

      <div className="card-panel">
        <form className="asset-form" onSubmit={handleSubmit}>
          <input
            placeholder="Nom de l'actif"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            value={form.assetType}
            onChange={(e) => setForm({ ...form, assetType: e.target.value })}
          >
            <option value="MATERIEL">Matériel</option>
            <option value="LOGICIEL">Logiciel</option>
            <option value="INFORMATIONNEL">Informationnel</option>
            <option value="HUMAIN">Humain</option>
            <option value="ORGANISATIONNEL">Organisationnel</option>
          </select>
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="Propriétaire"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
          />
          <select
            value={form.criticality}
            onChange={(e) => setForm({ ...form, criticality: e.target.value })}
          >
            <option value="FAIBLE">Faible</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="ELEVEE">Élevée</option>
            <option value="CRITIQUE">Critique</option>
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="ARCHIVE">Archivé</option>
          </select>
          <select
            value={form.analysisStatus}
            onChange={(e) => setForm({ ...form, analysisStatus: e.target.value })}
          >
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
          <select
            value={form.confidentialityLevel}
            onChange={(e) => setForm({ ...form, confidentialityLevel: e.target.value })}
          >
            <option value="NON_CLASSIFIE">NON_CLASSIFIE</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="INTERNE">INTERNE</option>
            <option value="CONFIDENTIEL">CONFIDENTIEL</option>
            <option value="TRES_CONFIDENTIEL">TRES_CONFIDENTIEL</option>
          </select>
          <input
            placeholder="Extension"
            value={form.extension}
            onChange={(e) => setForm({ ...form, extension: e.target.value })}
          />
          <input
            placeholder="Path"
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
          />
          <input
            type="number"
            placeholder="Taille"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
          />
          <input
            type="number"
            placeholder="Folder ID"
            value={form.folderId}
            onChange={(e) => setForm({ ...form, folderId: e.target.value })}
          />
          <input
            type="number"
            placeholder="Valeur"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          <input
            type="date"
            placeholder="Date de création"
            value={form.creationDate}
            onChange={(e) => setForm({ ...form, creationDate: e.target.value })}
          />
          <input
            placeholder="Localisation"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            placeholder="Responsable"
            value={form.responsible}
            onChange={(e) => setForm({ ...form, responsible: e.target.value })}
          />
          <input
            placeholder="État"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <button type="submit" className="btn-primary">Ajouter</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Recherche nom, chemin, propriétaire" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
          <option value="">Tous les types</option>
          <option value="MATERIEL">Matériel</option>
          <option value="LOGICIEL">Logiciel</option>
          <option value="INFORMATIONNEL">Informationnel</option>
          <option value="HUMAIN">Humain</option>
        </select>
        <select value={filterCriticality} onChange={e => { setFilterCriticality(e.target.value); setPage(1); }}>
          <option value="">Toutes criticités</option>
          <option value="FAIBLE">Faible</option>
          <option value="MOYENNE">Moyenne</option>
          <option value="ELEVEE">Élevée</option>
          <option value="CRITIQUE">Critique</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">Tous statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="ARCHIVE">Archivé</option>
        </select>
<select value={filterConfidentiality} onChange={e => { setFilterConfidentiality(e.target.value); setPage(1); }}>
           <option value="">Toutes confidentialités</option>
           <option value="NON_CLASSIFIE">Non classifié</option>
           <option value="PUBLIC">Public</option>
           <option value="INTERNE">Interne</option>
           <option value="CONFIDENTIEL">Confidentiel</option>
           <option value="TRES_CONFIDENTIEL">Très confidentiel</option>
         </select>
        <button className="btn-sm" onClick={loadAssets}>Rafraîchir</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading" style={{ padding: 20 }}>Chargement des actifs...</div>
        ) : error ? (
          <div className="error-message" style={{ padding: 20 }}>{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Description</th>
                <th>Propriétaire</th>
                <th>Responsable</th>
                <th>Criticité</th>
                <th>État</th>
                <th>Statut</th>
                <th>Analyse</th>
                <th>Confidentialité</th>
                <th>Extension</th>
                <th>Path</th>
                <th>Taille</th>
                <th>Folder ID</th>
                <th>Valeur</th>
                <th>Localisation</th>
                <th>Date création</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={17} className="empty">Aucun actif trouvé.</td>
                </tr>
              ) : (
                paginated.map((asset) => (
                  <tr key={asset.id}>
                    <td className="cell-filename">{asset.name || 'Non disponible'}</td>
                    <td>{asset.assetType || 'Non disponible'}</td>
                    <td>{asset.description || 'Non disponible'}</td>
                    <td>{asset.owner || 'Non disponible'}</td>
                    <td>{asset.responsible || 'Non disponible'}</td>
                    <td>
                      <span className={`badge badge-${(asset.criticality || 'MOYENNE').toLowerCase()}`}>
                        {asset.criticality || 'Non disponible'}
                      </span>
                    </td>
                    <td>{asset.state || 'Non disponible'}</td>
                    <td>
                      <span className={`badge badge-${(asset.status || 'ACTIF').toLowerCase()}`}>
                        {asset.status || 'Non disponible'}
                      </span>
                    </td>
                    <td>{asset.analysisStatus || 'Non disponible'}</td>
                    <td>{asset.confidentialityLevel || 'Non disponible'}</td>
                    <td>{asset.extension || 'Non disponible'}</td>
                    <td>{asset.path || 'Non disponible'}</td>
                    <td>{formatSize(asset.size)}</td>
                    <td>{asset.folderId !== undefined && asset.folderId !== null ? String(asset.folderId) : 'Non disponible'}</td>
                    <td>{asset.value ? `${asset.value} €` : 'Non disponible'}</td>
                    <td>{asset.location || 'Non disponible'}</td>
                    <td>{formatDate(asset.creationDate)}</td>
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
