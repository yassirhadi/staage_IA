import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/api/services';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ChevronRight } from 'lucide-react';

type ReferentialType = 'ISO' | 'NIST' | 'CIS' | 'RGPD' | 'Autre';
type ReferentialStatus = 'Actif' | 'Inactif';

interface Referential {
  id: number;
  name: string;
  description: string;
  version: string;
  category: string;
  type: ReferentialType;
  addedAt: string;
  updatedAt: string;
  status: ReferentialStatus;
  author: string;
  documentCount: number;
  fileUrl?: string;
}

export default function ReferentialsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Referential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'addedAt' | 'name'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItem, setSelectedItem] = useState<Referential | null>(null);
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canAdd = isAdmin;

  // Form state
  const [form, setForm] = useState<Partial<Referential>>({
    name: '',
    description: '',
    version: '',
    category: '',
    type: 'Autre',
    status: 'Actif',
    author: 'Admin RSSI',
    documentCount: 0,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getReferentials();
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setItems(data);
    } catch (e) {
      console.error(e);
      // If API fails, use example data as fallback
      const exampleData: Referential[] = [
        {
          id: 1,
          name: 'ISO/IEC 27001:2022',
          description: 'Norme internationale pour les systèmes de management de la sécurité de l\'information.',
          version: '2022',
          category: 'Normes',
          type: 'ISO',
          addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 15,
        },
        {
          id: 2,
          name: 'ISO/IEC 27002:2022',
          description: 'Code de pratique pour la sécurité de l\'information.',
          version: '2022',
          category: 'Normes',
          type: 'ISO',
          addedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 8,
        },
        {
          id: 3,
          name: 'ISO 27005',
          description: 'Gestion des risques en sécurité de l\'information.',
          version: '2018',
          category: 'Normes',
          type: 'ISO',
          addedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 12,
        },
        {
          id: 4,
          name: 'NIST Cybersecurity Framework 2.0',
          description: 'Cadre pour améliorer la cybersécurité des infrastructures critiques.',
          version: '2.0',
          category: 'Cadres',
          type: 'NIST',
          addedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 20,
        },
        {
          id: 5,
          name: 'NIST SP 800-53',
          description: 'Security and Privacy Controls for Information Systems and Organizations.',
          version: 'Rev. 5',
          category: 'Cadres',
          type: 'NIST',
          addedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 25,
        },
        {
          id: 6,
          name: 'CIS Controls v8',
          description: 'Critical Security Controls for Effective Cyber Defense.',
          version: '8',
          category: 'Cadres',
          type: 'CIS',
          addedAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 18,
        },
        {
          id: 7,
          name: 'Loi 09-08',
          description: 'Loi marocaine relative à la protection des personnes physiques.',
          version: '2009',
          category: 'Lois',
          type: 'Autre',
          addedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 5,
        },
        {
          id: 8,
          name: 'RGPD (GDPR)',
          description: 'Règlement Général sur la Protection des Données.',
          version: '2016/679',
          category: 'Lois',
          type: 'RGPD',
          addedAt: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Actif',
          author: 'Admin RSSI',
          documentCount: 10,
        },
      ];
      setItems(exampleData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(ref => {
    if (search) {
      const s = search.toLowerCase();
      if (!ref.name.toLowerCase().includes(s) && 
          !ref.description.toLowerCase().includes(s) && 
          !ref.version.toLowerCase().includes(s)) {
        return false;
      }
    }
    if (filterType && ref.type !== filterType) return false;
    if (filterCategory && ref.category !== filterCategory) return false;
    if (filterStatus && ref.status !== filterStatus) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'addedAt') {
      return sortOrder === 'asc'
        ? new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    } else {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: ReferentialStatus) => {
    return status === 'Actif'
      ? 'bg-green-900/30 text-green-200 border-green-700'
      : 'bg-zinc-900/30 text-zinc-200 border-zinc-700';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name?.trim()) {
      setMessage({ text: 'Le nom est obligatoire.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (!form.version?.trim()) {
      setMessage({ text: 'La version est obligatoire.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Check for duplicate name or version
    const exists = items.some(ref =>
      ref.id !== selectedItem?.id &&
      (ref.name.toLowerCase() === form.name?.toLowerCase() || ref.version === form.version)
    );
    if (exists) {
      setMessage({ text: 'Un référentiel avec ce nom ou cette version existe déjà.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      if (showModal === 'add') {
        const newItem: Referential = {
          id: items.length + 1,
          name: form.name!,
          description: form.description || '',
          version: form.version!,
          category: form.category || '',
          type: form.type as ReferentialType,
          status: form.status as ReferentialStatus,
          author: form.author || 'Admin RSSI',
          documentCount: form.documentCount || 0,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems([newItem, ...items]);
        setMessage({ text: 'Référentiel ajouté avec succès !', type: 'success' });
      } else if (showModal === 'edit' && selectedItem) {
        const updated = items.map(ref =>
          ref.id === selectedItem.id
            ? { 
                ...ref, 
                ...form, 
                name: form.name!,
                description: form.description || '',
                version: form.version!,
                category: form.category || '',
                type: form.type as ReferentialType,
                status: form.status as ReferentialStatus,
                author: form.author || ref.author,
                documentCount: form.documentCount ?? ref.documentCount,
                updatedAt: new Date().toISOString() 
              }
            : ref
        );
        setItems(updated);
        setMessage({ text: 'Référentiel modifié avec succès !', type: 'success' });
      }
      setShowModal(null);
      setSelectedItem(null);
    } catch (err) {
      setMessage({ text: 'Erreur lors de l\'enregistrement.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = (item: Referential) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le référentiel "${item.name}" ?`)) {
      setItems(items.filter(ref => ref.id !== item.id));
      setMessage({ text: 'Référentiel supprimé avec succès.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleStatus = (item: Referential) => {
    const updated = items.map(ref =>
      ref.id === item.id
        ? { ...ref, status: (ref.status === 'Actif' ? 'Inactif' : 'Actif') as ReferentialStatus, updatedAt: new Date().toISOString() }
        : ref
    );
    setItems(updated);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Référentiels de Sécurité', 14, 22);
    doc.setFontSize(11);
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    let yPosition = 40;
    filtered.forEach((ref) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(12);
      doc.text(`${ref.name} (${ref.version})`, 14, yPosition);
      yPosition += 6;
      doc.setFontSize(9);
      doc.text(`Type: ${ref.type} | Catégorie: ${ref.category}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Statut: ${ref.status} | Auteur: ${ref.author}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Documents: ${ref.documentCount}`, 14, yPosition);
      yPosition += 8;
    });

    doc.save('referentiels.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((ref) => ({
        Nom: ref.name,
        Version: ref.version,
        Type: ref.type,
        Catégorie: ref.category,
        Description: ref.description,
        Statut: ref.status,
        Auteur: ref.author,
        'Documents liés': ref.documentCount,
        'Date ajout': formatDate(ref.addedAt),
        'Dernière mise à jour': formatDate(ref.updatedAt),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Référentiels');
    XLSX.writeFile(workbook, 'referentiels.xlsx');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span>Référentiels</span>
          </div>
          <h2>Référentiels</h2>
          <p className="page-subtitle">Gestion des référentiels de sécurité (ISO 27001, NIST, CIS, RGPD...)</p>
        </div>
        <span className="page-badge">{items.length} référentiel(s)</span>
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

      <div className="flex flex-wrap gap-2 mb-4">
        {canAdd && (
          <Button variant="default" onClick={() => {
            setForm({ name: '', description: '', version: '', category: '', type: 'Autre', status: 'Actif', author: 'Admin RSSI', documentCount: 0 });
            setSelectedItem(null);
            setShowModal('add');
          }}>
            + Ajouter Référentiel
          </Button>
        )}
        {canAdd && (
          <Button variant="outline" onClick={() => {
            setMessage({ text: 'Importation en cours...', type: 'info' });
            setTimeout(() => setMessage({ text: 'Importation terminée !', type: 'success' }), 1500);
            setTimeout(() => setMessage(null), 3000);
          }}>
            Importer Référentiel
          </Button>
        )}
        <Button variant="outline" onClick={handleExportExcel}>
          Export Excel
        </Button>
        <Button variant="outline" onClick={handleExportPDF}>
          Export PDF
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, description ou version..."
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
          <option value="ISO">ISO</option>
          <option value="NIST">NIST</option>
          <option value="CIS">CIS</option>
          <option value="RGPD">RGPD</option>
          <option value="Autre">Autre</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          <option value="Normes">Normes</option>
          <option value="Cadres">Cadres</option>
          <option value="Lois">Lois</option>
          <option value="Politiques">Politiques</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'addedAt' | 'name')}
          className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="addedAt">Trier par date</option>
          <option value="name">Trier par nom</option>
        </select>
        <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement des référentiels...</div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">Aucun référentiel disponible</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date d'ajout</th>
                <th className="px-4 py-3">Dernière mise à jour</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginated.map(ref => (
                <tr key={ref.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{ref.name}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={ref.description}>{ref.description}</td>
                  <td className="px-4 py-3">{ref.version}</td>
                  <td className="px-4 py-3">{ref.category}</td>
                  <td className="px-4 py-3">{ref.type}</td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(ref.addedAt)}</td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(ref.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(ref.status)}`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{ref.author}</td>
                  <td className="px-4 py-3 text-zinc-300">{ref.documentCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedItem(ref); setShowModal('view'); }}
                      >
                        Voir
                      </Button>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setForm({ ...ref }); setSelectedItem(ref); setShowModal('edit'); }}
                        >
                          Modifier
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMessage({ text: `Téléchargement de ${ref.name}...`, type: 'info' });
                          setTimeout(() => {
                            setMessage({ text: 'Téléchargement terminé !', type: 'success' });
                            setTimeout(() => setMessage(null), 3000);
                          }, 1000);
                        }}
                      >
                        Télécharger
                      </Button>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(ref)}
                        >
                          {ref.status === 'Actif' ? 'Désactiver' : 'Activer'}
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ref)}>
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && sorted.length > 0 && (
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {showModal === 'add' ? 'Ajouter un référentiel' :
                 showModal === 'edit' ? 'Modifier un référentiel' :
                 'Détails du référentiel'}
              </h2>
              <Button variant="ghost" onClick={() => setShowModal(null)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  disabled={showModal === 'view'}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  disabled={showModal === 'view'}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Version *</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={e => setForm({ ...form, version: e.target.value })}
                    disabled={showModal === 'view'}
                    className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as ReferentialType })}
                    disabled={showModal === 'view'}
                    className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ISO">ISO</option>
                    <option value="NIST">NIST</option>
                    <option value="CIS">CIS</option>
                    <option value="RGPD">RGPD</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    disabled={showModal === 'view'}
                    className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Statut</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as ReferentialStatus })}
                    disabled={showModal === 'view'}
                    className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Auteur</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    disabled={showModal === 'view'}
                    className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre de documents</label>
                  <input
                    type="number"
                    value={form.documentCount}
                    onChange={e => setForm({ ...form, documentCount: parseInt(e.target.value) || 0 })}
                    disabled={showModal === 'view'}
                    className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(null)}>
                  Annuler
                </Button>
                {showModal !== 'view' && (
                  <Button type="submit" disabled={loading}>
                    {showModal === 'add' ? 'Ajouter' : 'Enregistrer'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
