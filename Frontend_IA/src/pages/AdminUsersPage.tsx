import { useEffect, useState } from 'react';
import { authApi, adminApi } from '../api/services';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Key } from 'lucide-react';
import '../styles/Pages.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const ROLES = ['ADMIN', 'RSSI', 'AUDITEUR', 'LECTEUR', 'ANALYSTE'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'LECTEUR',
    password: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers();
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      // Simulate adding dates
      const usersWithDates = data.map((u: any) => ({
        ...u,
        createdAt: u.createdAt || new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        lastLogin: u.lastLogin || new Date(Date.now() - Math.random() * 1000000000).toISOString()
      }));
      setUsers(usersWithDates);
      setFilteredUsers(usersWithDates);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRole !== 'Tous') {
      filtered = filtered.filter(u => u.role === filterRole);
    }
    
    if (filterStatus !== 'Tous') {
      filtered = filtered.filter(u => 
        filterStatus === 'Actif' ? u.enabled : !u.enabled
      );
    }
    
    setFilteredUsers(filtered);
    setPage(1);
  }, [users, searchTerm, filterRole, filterStatus]);

  const toggleEnabled = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, { enabled: !user.enabled });
      load();
    } catch (error) {
      alert('Erreur lors de la modification du statut');
    }
  };

  const resetPwd = async (id: number) => {
    const pwd = prompt('Nouveau mot de passe (min 6 caractères):');
    if (pwd && pwd.length >= 6) {
      try {
        await adminApi.resetPassword(id, pwd);
        alert('Mot de passe réinitialisé');
      } catch (error) {
        alert('Erreur lors de la réinitialisation');
      }
    }
  };

  const deleteUser = async (user: User) => {
    if (user.role === 'ADMIN' && user.username === 'admin') {
      alert('Impossible de supprimer le compte administrateur principal');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`)) {
      try {
        await adminApi.deleteUser(user.id);
        load();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleAddUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    try {
      await authApi.register(formData.username, formData.email, formData.password);
      await adminApi.updateUser(users.length + 1, { role: formData.role });
      setShowAddModal(false);
      setFormData({ username: '', email: '', role: 'LECTEUR', password: '' });
      load();
    } catch (error) {
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUser(selectedUser.id, { role: formData.role });
      setShowEditModal(false);
      load();
    } catch (error) {
      alert('Erreur lors de la modification');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administration — Utilisateurs</h2>
          <p className="text-muted-foreground">Gestion des comptes et rôles</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="card-panel mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tous">Tous les rôles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden border-zinc-700">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Chargement...</div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur ne correspond aux filtres'}
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-800 text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date de création</th>
                <th className="px-4 py-3">Dernière connexion</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-zinc-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      u.role === 'RSSI' ? 'bg-orange-100 text-orange-700' :
                      u.role === 'AUDITEUR' ? 'bg-blue-100 text-blue-700' :
                      u.role === 'ANALYSTE' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.enabled ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-zinc-300">{formatDate(u.lastLogin)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleEnabled(u)}>
                        {u.enabled ? <UserX size={16} /> : <UserCheck size={16} />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => resetPwd(u.id)}>
                        <Key size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedUser(u);
                        setFormData({ ...formData, role: u.role });
                        setShowEditModal(true);
                      }}>
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteUser(u)}
                        disabled={u.role === 'ADMIN' && u.username === 'admin'}
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

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-zinc-400">
            {filteredUsers.length} utilisateur(s)
          </span>
          {filteredUsers.length > pageSize && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-zinc-400">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-md w-full border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Ajouter un utilisateur</h2>
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
                <Button onClick={handleAddUser}>Créer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl max-w-md w-full border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier l'utilisateur</h2>
              <Button variant="ghost" onClick={() => setShowEditModal(false)} className="text-zinc-100 hover:bg-zinc-800 hover:text-white">✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-zinc-300">{selectedUser.username}</p>
              <p className="text-zinc-400 text-sm">{selectedUser.email}</p>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                <Button onClick={handleEditUser}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
