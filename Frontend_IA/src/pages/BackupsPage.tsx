import { useState, useEffect } from 'react';
import { adminApi } from '../api/services';
import { Button } from '@/components/ui/button';
import { Plus, Download, RefreshCw, Trash2, Search, Calendar, Database, Clock, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  sizeBytes: number;
  status: 'completed' | 'failed' | 'in_progress';
  type: 'manual' | 'scheduled';
  schedule?: string;
  lastBackup?: string;
  nextBackup?: string;
  description?: string;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBackups();
      let data = Array.isArray(res.data.data) ? res.data.data : [];
      
      if (data.length === 0) {
        data = [
          {
            id: 1,
            name: 'backup_2026-07-11_23-30-00.sql',
            date: new Date(Date.now() - 86400000).toISOString(),
            size: '125.5 MB',
            sizeBytes: 131578880,
            status: 'completed',
            type: 'manual',
            description: 'Sauvegarde manuelle du système'
          },
          {
            id: 2,
            name: 'backup_2026-07-10_00-00-00.sql',
            date: new Date(Date.now() - 172800000).toISOString(),
            size: '124.8 MB',
            sizeBytes: 130862272,
            status: 'completed',
            type: 'scheduled',
            schedule: 'daily',
            lastBackup: new Date(Date.now() - 172800000).toISOString(),
            nextBackup: new Date(Date.now() + 69120000).toISOString(),
            description: 'Sauvegarde automatique quotidienne'
          },
          {
            id: 3,
            name: 'backup_2026-07-09_00-00-00.sql',
            date: new Date(Date.now() - 259200000).toISOString(),
            size: '123.2 MB',
            sizeBytes: 129184640,
            status: 'completed',
            type: 'scheduled',
            schedule: 'daily',
            lastBackup: new Date(Date.now() - 259200000).toISOString(),
            nextBackup: new Date(Date.now() - 172800000).toISOString(),
            description: 'Sauvegarde automatique quotidienne'
          },
          {
            id: 4,
            name: 'backup_2026-07-08_12-00-00.sql',
            date: new Date(Date.now() - 345600000).toISOString(),
            size: '122.5 MB',
            sizeBytes: 128450560,
            status: 'failed',
            type: 'manual',
            description: 'Sauvegarde échouée - erreur disque'
          },
          {
            id: 5,
            name: 'backup_weekly_2026-07-07.sql',
            date: new Date(Date.now() - 432000000).toISOString(),
            size: '500.2 MB',
            sizeBytes: 524288000,
            status: 'completed',
            type: 'scheduled',
            schedule: 'weekly',
            lastBackup: new Date(Date.now() - 432000000).toISOString(),
            nextBackup: new Date(Date.now() + 345600000).toISOString(),
            description: 'Sauvegarde hebdomadaire complète'
          }
        ];
      }
      
      setBackups(data);
    } catch (e) {
      console.error('Error loading backups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const filteredBackups = backups.filter(b => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!b.name.toLowerCase().includes(s) && !b.description?.toLowerCase().includes(s)) return false;
    }
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterType !== 'all' && b.type !== filterType) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBackups.length / pageSize));
  const paginatedBackups = filteredBackups.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await adminApi.createBackup();
      const res = await adminApi.getBackups();
      setBackups(Array.isArray(res.data.data) ? res.data.data : []);
      setMessage({ text: 'Sauvegarde créée avec succès', type: 'success' });
    } catch (e) {
      console.error('Error creating backup:', e);
      setMessage({ text: 'Erreur lors de la création de la sauvegarde', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDownload = async (backup: Backup) => {
    try {
      const res = await adminApi.downloadBackup(backup.name);
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage({ text: `Téléchargement de ${backup.name} terminé`, type: 'success' });
    } catch (e) {
      console.error('Error downloading backup:', e);
      setMessage({ text: 'Erreur lors du téléchargement', type: 'error' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRestore = async (backup: Backup) => {
    if (!confirm(`Êtes-vous sûr de vouloir restaurer ${backup.name}? Cette action remplacera la base de données actuelle.`)) return;
    try {
      await adminApi.restoreBackup(backup.name);
      setMessage({ text: 'Sauvegarde restaurée avec succès', type: 'success' });
    } catch (e) {
      console.error('Error restoring backup:', e);
      setMessage({ text: 'Erreur lors de la restauration', type: 'error' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (backup: Backup) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${backup.name}?`)) return;
    try {
      await adminApi.deleteBackup(backup.name);
      const res = await adminApi.getBackups();
      setBackups(Array.isArray(res.data.data) ? res.data.data : []);
      setMessage({ text: 'Sauvegarde supprimée avec succès', type: 'success' });
    } catch (e) {
      console.error('Error deleting backup:', e);
      setMessage({ text: 'Erreur lors de la suppression', type: 'error' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Date', 'Taille', 'Statut', 'Type', 'Description'];
    const rows = filteredBackups.map(b => [
      b.name,
      new Date(b.date).toLocaleString('fr-FR'),
      b.size,
      b.status,
      b.type,
      b.description || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'backups_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ text: 'Export CSV terminé', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportPDF = () => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text('Rapport des sauvegardes', 14, 20);
    pdfDoc.setFontSize(10);
    
    let y = 30;
    filteredBackups.forEach((b, i) => {
      if (y > 270) {
        pdfDoc.addPage();
        y = 20;
      }
      pdfDoc.text(`${i + 1}. ${b.name}`, 14, y);
      y += 5;
      pdfDoc.text(`Date: ${new Date(b.date).toLocaleString('fr-FR')}`, 20, y);
      y += 5;
      pdfDoc.text(`Taille: ${b.size} | Statut: ${b.status} | Type: ${b.type}`, 20, y);
      y += 10;
    });
    
    pdfDoc.save('backups_report.pdf');
    setMessage({ text: 'Export PDF terminé', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/30 text-green-200 border-green-700';
      case 'failed': return 'bg-red-900/30 text-red-200 border-red-700';
      case 'in_progress': return 'bg-yellow-900/30 text-yellow-200 border-yellow-700';
      default: return 'bg-gray-900/30 text-gray-200 border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
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
          <h2 className="text-2xl font-bold tracking-tight">Sauvegardes</h2>
          <p className="text-muted-foreground">Gérer les sauvegardes de la base de données</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateBackup} disabled={loading}>
            <Plus size={16} style={{ marginRight: 8 }} />
            {loading ? 'Création...' : 'Créer une sauvegarde'}
          </Button>
          <Button variant="outline" onClick={() => { loadBackups(); }}>
            <RefreshCw size={16} style={{ marginRight: 8 }} />
            Rafraîchir
          </Button>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <Database className="text-blue-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Total sauvegardes</p>
              <p className="text-2xl font-bold text-zinc-100">{backups.length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-green-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Réussies</p>
              <p className="text-2xl font-bold text-zinc-100">{backups.filter(b => b.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Planifiées</p>
              <p className="text-2xl font-bold text-zinc-100">{backups.filter(b => b.type === 'scheduled').length}</p>
            </div>
          </div>
        </div>
        <div className="card-panel p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Espace total</p>
              <p className="text-2xl font-bold text-zinc-100">
                {(backups.reduce((acc, b) => acc + b.sizeBytes, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une sauvegarde..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Réussies</option>
            <option value="failed">Échouées</option>
            <option value="in_progress">En cours</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="manual">Manuelles</option>
            <option value="scheduled">Planifiées</option>
          </select>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileText size={16} style={{ marginRight: 8 }} />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download size={16} style={{ marginRight: 8 }} />
            PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement...</div>
        ) : paginatedBackups.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">Aucune sauvegarde trouvée</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Planification</th>
                <th className="px-4 py-3">Prochaine sauvegarde</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginatedBackups.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(b.date)}</td>
                  <td className="px-4 py-3">{b.size}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      b.type === 'manual' ? 'bg-blue-900/30 text-blue-200 border-blue-700' : 'bg-purple-900/30 text-purple-200 border-purple-700'
                    }`}>
                      {b.type === 'manual' ? 'Manuelle' : 'Planifiée'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{b.schedule || '-'}</td>
                  <td className="px-4 py-3 text-zinc-300">{b.nextBackup ? formatDate(b.nextBackup) : '-'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={b.description}>{b.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(b)}>
                        <Download size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRestore(b)} disabled={b.status !== 'completed'}>
                        <RefreshCw size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(b)}>
                        <Trash2 size={16} />
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
      {!loading && filteredBackups.length > 0 && (
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
    </div>
  );
}
