import { useState, useEffect } from 'react';
import { adminApi } from '../api/services';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Users, Shield } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: Permission[];
  permissionsCount: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const PERMISSIONS: Permission[] = [
  { id: 1, name: 'view_users', description: 'Voir les utilisateurs', module: 'Users' },
  { id: 2, name: 'edit_users', description: 'Modifier les utilisateurs', module: 'Users' },
  { id: 3, name: 'delete_users', description: 'Supprimer les utilisateurs', module: 'Users' },
  { id: 4, name: 'view_documents', description: 'Voir les documents', module: 'Documents' },
  { id: 5, name: 'edit_documents', description: 'Modifier les documents', module: 'Documents' },
  { id: 6, name: 'delete_documents', description: 'Supprimer les documents', module: 'Documents' },
  { id: 7, name: 'view_reports', description: 'Voir les rapports', module: 'Reports' },
  { id: 8, name: 'generate_reports', description: 'Générer les rapports', module: 'Reports' },
  { id: 9, name: 'view_risks', description: 'Voir les risques', module: 'Risks' },
  { id: 10, name: 'manage_roles', description: 'Gérer les rôles', module: 'Admin' },
  { id: 11, name: 'manage_permissions', description: 'Gérer les permissions', module: 'Admin' },
  { id: 12, name: 'view_settings', description: 'Voir les paramètres', module: 'Settings' },
  { id: 13, name: 'edit_settings', description: 'Modifier les paramètres', module: 'Settings' },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterType, setFilterType] = useState('Tous');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as number[]
  });

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRoles();
      let data = Array.isArray(res.data.data) ? res.data.data : [];
      
      if (data.length === 0) {
        data = [
          {
            id: 1,
            name: 'ADMIN',
            description: 'Administrateur système avec accès complet',
            userCount: 2,
            permissions: PERMISSIONS,
            permissionsCount: PERMISSIONS.length,
            isActive: true,
            isSystem: true,
            createdAt: new Date(Date.now() - 10000000000).toISOString(),
            updatedAt: new Date(Date.now() - 1000000000).toISOString()
          },
          {
            id: 2,
            name: 'RSSI',
            description: 'Responsable Sécurité des Systèmes d\'Information',
            userCount: 3,
            permissions: PERMISSIONS.filter(p => ['view_users', 'view_documents', 'view_reports', 'view_risks', 'manage_roles', 'view_settings'].includes(p.name)),
            permissionsCount: 6,
            isActive: true,
            isSystem: true,
            createdAt: new Date(Date.now() - 9000000000).toISOString(),
            updatedAt: new Date(Date.now() - 2000000000).toISOString()
          },
          {
            id: 3,
            name: 'AUDITEUR',
            description: 'Auditeur avec accès en lecture seule',
            userCount: 5,
            permissions: PERMISSIONS.filter(p => p.name.startsWith('view_')),
            permissionsCount: 5,
            isActive: true,
            isSystem: false,
            createdAt: new Date(Date.now() - 8000000000).toISOString(),
            updatedAt: new Date(Date.now() - 3000000000).toISOString()
          },
          {
            id: 4,
            name: 'LECTEUR',
            description: 'Utilisateur avec accès limité en lecture',
            userCount: 15,
            permissions: PERMISSIONS.filter(p => ['view_documents', 'view_reports'].includes(p.name)),
            permissionsCount: 2,
            isActive: true,
            isSystem: false,
            createdAt: new Date(Date.now() - 7000000000).toISOString(),
            updatedAt: new Date(Date.now() - 4000000000).toISOString()
          },
          {
            id: 5,
            name: 'ANALYSTE',
            description: 'Analyste avec accès aux documents et rapports',
            userCount: 8,
            permissions: PERMISSIONS.filter(p => ['view_documents', 'edit_documents', 'view_reports', 'view_risks'].includes(p.name)),
            permissionsCount: 4,
            isActive: false,
            isSystem: false,
            createdAt: new Date(Date.now() - 6000000000).toISOString(),
            updatedAt: new Date(Date.now() - 5000000000).toISOString()
          }
        ];
      }
      
      setRoles(data);
    } catch (e) {
      console.error('Error loading roles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const filteredRoles = roles.filter(r => {
    if (filterStatus === 'Actif' && !r.isActive) return false;
    if (filterStatus === 'Inactif' && r.isActive) return false;
    if (filterType === 'Système' && !r.isSystem) return false;
    if (filterType === 'Personnalisé' && r.isSystem) return false;
    return true;
  });

  const getRoleColor = (role: Role) => {
    if (role.name === 'ADMIN') return 'bg-red-900/30 text-red-200 border-red-700';
    if (role.name === 'RSSI') return 'bg-orange-900/30 text-orange-200 border-orange-700';
    if (role.name === 'AUDITEUR') return 'bg-blue-900/30 text-blue-200 border-blue-700';
    if (role.name === 'ANALYSTE') return 'bg-purple-900/30 text-purple-200 border-purple-700';
    return 'bg-green-900/30 text-green-200 border-green-700';
  };

  const handleAddRole = () => {
    if (!formData.name || !formData.description) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    const newRole: Role = {
      id: roles.length + 1,
      name: formData.name,
      description: formData.description,
      userCount: 0,
      permissions: PERMISSIONS.filter(p => formData.permissions.includes(p.id)),
      permissionsCount: formData.permissions.length,
      isActive: true,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRoles([...roles, newRole]);
    setShowAddModal(false);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handleEditRole = () => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(r =>
      r.id === selectedRole.id
        ? {
            ...r,
            name: formData.name,
            description: formData.description,
            permissions: PERMISSIONS.filter(p => formData.permissions.includes(p.id)),
            permissionsCount: formData.permissions.length,
            updatedAt: new Date().toISOString()
          }
        : r
    ));
    setShowEditModal(false);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      alert('Impossible de supprimer un rôle système');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des rôles</h2>
          <p className="text-muted-foreground">Gérez les rôles et leurs permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Ajouter un rôle
        </Button>
      </div>

      {/* Filters */}
      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tous">Tous les types</option>
            <option value="Système">Système</option>
            <option value="Personnalisé">Personnalisé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement...</div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">Aucun rôle trouvé</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Nom du rôle</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Utilisateurs</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Dernière modification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRoleColor(role)}`}>
                      {role.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{role.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-zinc-400" />
                      {role.userCount}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-zinc-400" />
                      {role.permissionsCount}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {role.isSystem ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-900/30 text-gray-200 border border-gray-700">
                        Système
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-900/30 text-blue-200 border border-blue-700">
                        Personnalisé
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      role.isActive ? 'bg-green-900/30 text-green-200 border-green-700' : 'bg-red-900/30 text-red-200 border-red-700'
                    }`}>
                      {role.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(role.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedRole(role); setShowDetailsModal(true); }}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedRole(role);
                        setFormData({ name: role.name, description: role.description, permissions: role.permissions.map(p => p.id) });
                        setShowEditModal(true);
                      }}>
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteRole(role)}
                        disabled={role.isSystem}
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

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Ajouter un rôle</h2>
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom du rôle</label>
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {PERMISSIONS.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, p.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(id => id !== p.id) });
                          }
                        }}
                        className="rounded bg-zinc-800 border-zinc-600"
                      />
                      <span className="text-zinc-300">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
                <Button onClick={handleAddRole}>Créer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier le rôle</h2>
              <Button variant="ghost" onClick={() => setShowEditModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom du rôle</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  disabled={selectedRole.isSystem}
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {PERMISSIONS.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, p.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(id => id !== p.id) });
                          }
                        }}
                        disabled={selectedRole.isSystem}
                        className="rounded bg-zinc-800 border-zinc-600 disabled:opacity-50"
                      />
                      <span className="text-zinc-300">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                <Button onClick={handleEditRole}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails du rôle</h2>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-zinc-400">Nom:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRoleColor(selectedRole)}`}>
                  {selectedRole.name}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Description:</span>
                <p className="text-zinc-300 mt-1">{selectedRole.description}</p>
              </div>
              <div>
                <span className="text-zinc-400">Nombre d'utilisateurs:</span>
                <span className="ml-2">{selectedRole.userCount}</span>
              </div>
              <div>
                <span className="text-zinc-400">Type:</span>
                <span className="ml-2">{selectedRole.isSystem ? 'Système' : 'Personnalisé'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Statut:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  selectedRole.isActive ? 'bg-green-900/30 text-green-200 border-green-700' : 'bg-red-900/30 text-red-200 border-red-700'
                }`}>
                  {selectedRole.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Date de création:</span>
                <span className="ml-2 text-zinc-300">{formatDate(selectedRole.createdAt)}</span>
              </div>
              <div>
                <span className="text-zinc-400">Dernière modification:</span>
                <span className="ml-2 text-zinc-300">{formatDate(selectedRole.updatedAt)}</span>
              </div>
              <div>
                <span className="text-zinc-400">Permissions ({selectedRole.permissionsCount}):</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selectedRole.permissions.map(p => (
                    <div key={p.id} className="bg-zinc-800 p-2 rounded border border-zinc-700 text-sm">
                      <span className="text-zinc-300">{p.name}</span>
                      <p className="text-zinc-500 text-xs">{p.description}</p>
                    </div>
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
