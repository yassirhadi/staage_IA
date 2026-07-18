import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Shield, Search } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
  module: string;
  roles: string[];
  roleCount: number;
  isCritical: boolean;
}

const ROLES = ['ADMIN', 'RSSI', 'AUDITEUR', 'LECTEUR', 'ANALYSTE'];

const PERMISSIONS: Permission[] = [
  { id: 1, name: 'view_users', description: 'Permet de voir la liste des utilisateurs et leurs informations', category: 'Utilisateurs', module: 'Users', roles: ['ADMIN', 'RSSI', 'AUDITEUR'], roleCount: 3, isCritical: false },
  { id: 2, name: 'edit_users', description: 'Permet de modifier les informations des utilisateurs existants', category: 'Utilisateurs', module: 'Users', roles: ['ADMIN', 'RSSI'], roleCount: 2, isCritical: true },
  { id: 3, name: 'delete_users', description: 'Permet de supprimer des utilisateurs du système', category: 'Utilisateurs', module: 'Users', roles: ['ADMIN'], roleCount: 1, isCritical: true },
  { id: 4, name: 'create_users', description: 'Permet de créer de nouveaux utilisateurs', category: 'Utilisateurs', module: 'Users', roles: ['ADMIN'], roleCount: 1, isCritical: true },
  { id: 5, name: 'view_documents', description: 'Permet de voir et consulter les documents', category: 'Documents', module: 'Documents', roles: ['ADMIN', 'RSSI', 'AUDITEUR', 'LECTEUR', 'ANALYSTE'], roleCount: 5, isCritical: false },
  { id: 6, name: 'edit_documents', description: 'Permet de modifier le contenu des documents', category: 'Documents', module: 'Documents', roles: ['ADMIN', 'RSSI', 'ANALYSTE'], roleCount: 3, isCritical: true },
  { id: 7, name: 'delete_documents', description: 'Permet de supprimer des documents', category: 'Documents', module: 'Documents', roles: ['ADMIN', 'RSSI'], roleCount: 2, isCritical: true },
  { id: 8, name: 'view_reports', description: 'Permet de consulter les rapports générés', category: 'Rapports', module: 'Reports', roles: ['ADMIN', 'RSSI', 'AUDITEUR', 'LECTEUR', 'ANALYSTE'], roleCount: 5, isCritical: false },
  { id: 9, name: 'generate_reports', description: 'Permet de générer de nouveaux rapports', category: 'Rapports', module: 'Reports', roles: ['ADMIN', 'RSSI'], roleCount: 2, isCritical: true },
  { id: 10, name: 'view_risks', description: 'Permet de voir les risques détectés par le système', category: 'Risques', module: 'Risks', roles: ['ADMIN', 'RSSI', 'AUDITEUR', 'ANALYSTE'], roleCount: 4, isCritical: false },
  { id: 11, name: 'manage_roles', description: 'Permet de gérer les rôles et leurs permissions', category: 'Administration', module: 'Admin', roles: ['ADMIN'], roleCount: 1, isCritical: true },
  { id: 12, name: 'manage_permissions', description: 'Permet de gérer les permissions du système', category: 'Administration', module: 'Admin', roles: ['ADMIN'], roleCount: 1, isCritical: true },
  { id: 13, name: 'view_settings', description: 'Permet de voir les paramètres du système', category: 'Paramètres', module: 'Settings', roles: ['ADMIN', 'RSSI', 'AUDITEUR'], roleCount: 3, isCritical: false },
  { id: 14, name: 'edit_settings', description: 'Permet de modifier les paramètres du système', category: 'Paramètres', module: 'Settings', roles: ['ADMIN', 'RSSI'], roleCount: 2, isCritical: true },
  { id: 15, name: 'view_sensitive_data', description: 'Permet de voir les données sensibles détectées', category: 'Données sensibles', module: 'SensitiveData', roles: ['ADMIN', 'RSSI', 'AUDITEUR'], roleCount: 3, isCritical: true },
  { id: 16, name: 'export_data', description: 'Permet d\'exporter les données (CSV, PDF, Excel)', category: 'Export', module: 'Export', roles: ['ADMIN', 'RSSI', 'AUDITEUR'], roleCount: 3, isCritical: false },
  { id: 17, name: 'manage_backups', description: 'Permet de gérer les sauvegardes du système', category: 'Sauvegardes', module: 'Backups', roles: ['ADMIN'], roleCount: 1, isCritical: true },
  { id: 18, name: 'view_inventory', description: 'Permet de voir l\'inventaire des actifs', category: 'Inventaire', module: 'Inventory', roles: ['ADMIN', 'RSSI', 'AUDITEUR', 'LECTEUR', 'ANALYSTE'], roleCount: 5, isCritical: false },
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(PERMISSIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Toutes');
  const [filterModule, setFilterModule] = useState('Tous');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    module: '',
    roles: [] as string[]
  });

  const categories = Array.from(new Set(PERMISSIONS.map(p => p.category)));
  const modules = Array.from(new Set(PERMISSIONS.map(p => p.module)));

  const filteredPermissions = permissions.filter(p => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(s) && !p.description.toLowerCase().includes(s)) return false;
    }
    if (filterCategory !== 'Toutes' && p.category !== filterCategory) return false;
    if (filterModule !== 'Tous' && p.module !== filterModule) return false;
    return true;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Utilisateurs': 'bg-blue-900/30 text-blue-200 border-blue-700',
      'Documents': 'bg-green-900/30 text-green-200 border-green-700',
      'Rapports': 'bg-purple-900/30 text-purple-200 border-purple-700',
      'Risques': 'bg-red-900/30 text-red-200 border-red-700',
      'Administration': 'bg-orange-900/30 text-orange-200 border-orange-700',
      'Paramètres': 'bg-gray-900/30 text-gray-200 border-gray-700',
      'Données sensibles': 'bg-pink-900/30 text-pink-200 border-pink-700',
      'Export': 'bg-cyan-900/30 text-cyan-200 border-cyan-700',
      'Sauvegardes': 'bg-yellow-900/30 text-yellow-200 border-yellow-700',
      'Inventaire': 'bg-indigo-900/30 text-indigo-200 border-indigo-700',
    };
    return colors[category] || 'bg-zinc-900/30 text-zinc-200 border-zinc-700';
  };

  const handleAddPermission = () => {
    if (!formData.name || !formData.description || !formData.category || !formData.module) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    const newPermission: Permission = {
      id: permissions.length + 1,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      module: formData.module,
      roles: formData.roles,
      roleCount: formData.roles.length,
      isCritical: false
    };
    setPermissions([...permissions, newPermission]);
    setShowAddModal(false);
    setFormData({ name: '', description: '', category: '', module: '', roles: [] });
  };

  const handleEditPermission = () => {
    if (!selectedPermission) return;
    setPermissions(prev => prev.map(p =>
      p.id === selectedPermission.id
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            module: formData.module,
            roles: formData.roles,
            roleCount: formData.roles.length
          }
        : p
    ));
    setShowEditModal(false);
  };

  const handleDeletePermission = (permission: Permission) => {
    if (permission.isCritical) {
      alert('Impossible de supprimer une permission critique');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer la permission "${permission.name}" ?`)) {
      setPermissions(prev => prev.filter(p => p.id !== permission.id));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des permissions</h2>
          <p className="text-muted-foreground">Gérer les permissions du système</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Ajouter une permission
        </Button>
      </div>

      {/* Filters */}
      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une permission..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Toutes">Toutes les catégories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tous">Tous les modules</option>
            {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {filteredPermissions.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">Aucune permission trouvée</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Rôles associés</th>
                <th className="px-4 py-3">Nb rôles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredPermissions.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {p.isCritical && <Shield size={16} className="text-red-400" />}
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={p.description}>{p.description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getCategoryColor(p.category)}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.module}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.roles.map(role => (
                        <span key={role} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-300">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.roleCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedPermission(p); setShowDetailsModal(true); }}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedPermission(p);
                        setFormData({ name: p.name, description: p.description, category: p.category, module: p.module, roles: p.roles });
                        setShowEditModal(true);
                      }}>
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeletePermission(p)}
                        disabled={p.isCritical}
                      >
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

      {/* Add Permission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Ajouter une permission</h2>
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Module</label>
                <select
                  value={formData.module}
                  onChange={e => setFormData({ ...formData, module: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Rôles associés</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(role => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, roles: [...formData.roles, role] });
                          } else {
                            setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
                          }
                        }}
                        className="rounded bg-zinc-800 border-zinc-600"
                      />
                      <span className="text-zinc-300">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
                <Button onClick={handleAddPermission}>Créer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier la permission</h2>
              <Button variant="ghost" onClick={() => setShowEditModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  disabled={selectedPermission.isCritical}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Module</label>
                <select
                  value={formData.module}
                  onChange={e => setFormData({ ...formData, module: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Rôles associés</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(role => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, roles: [...formData.roles, role] });
                          } else {
                            setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
                          }
                        }}
                        className="rounded bg-zinc-800 border-zinc-600"
                      />
                      <span className="text-zinc-300">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                <Button onClick={handleEditPermission}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la permission</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-zinc-400">Nom:</span>
                <div className="flex items-center gap-2 mt-1">
                  {selectedPermission.isCritical && <Shield size={16} className="text-red-400" />}
                  <span className="text-zinc-100">{selectedPermission.name}</span>
                </div>
              </div>
              <div>
                <span className="text-zinc-400">Description:</span>
                <p className="text-zinc-300 mt-1">{selectedPermission.description}</p>
              </div>
              <div>
                <span className="text-zinc-400">Catégorie:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getCategoryColor(selectedPermission.category)}`}>
                  {selectedPermission.category}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Module:</span>
                <span className="ml-2 text-zinc-100">{selectedPermission.module}</span>
              </div>
              <div>
                <span className="text-zinc-400">Critique:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  selectedPermission.isCritical ? 'bg-red-900/30 text-red-200 border-red-700' : 'bg-green-900/30 text-green-200 border-green-700'
                }`}>
                  {selectedPermission.isCritical ? 'Oui' : 'Non'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Rôles associés ({selectedPermission.roleCount}):</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPermission.roles.map(role => (
                    <span key={role} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-300">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
