import { useState, useEffect } from 'react';
import { adminApi } from '../api/services';
import { Button } from '@/components/ui/button';
import { Save, Bell, Database, Settings as SettingsIcon, Shield, Cpu, Link, FileText } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await adminApi.getSettings();
        setSettings(res.data.data || {});
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminApi.updateSettings(settings);
      alert('Paramètres enregistrés avec succès');
    } catch (e) {
      console.error('Error saving settings:', e);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Entreprise', icon: SettingsIcon },
    { id: 'system', label: 'Système', icon: SettingsIcon },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'ai', label: 'IA', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Sauvegardes', icon: Database },
    { id: 'analysis', label: 'Analyse', icon: FileText },
    { id: 'integrations', label: 'Intégrations', icon: Link },
    { id: 'logging', label: 'Logs', icon: FileText },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground">Configurez les paramètres du système</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save size={16} style={{ marginRight: 8 }} />
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-700 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Info */}
      {activeTab === 'company' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Informations de l'entreprise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nom de l'entreprise</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'entreprise"
                value={settings.companyName || ''}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Logo</label>
              <input
                type="file"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Adresse</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse"
                value={settings.address || ''}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Téléphone</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Téléphone"
                value={settings.phone || ''}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={settings.email || ''}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Site web</label>
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                value={settings.website || ''}
                onChange={(e) => setSettings({...settings, website: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description de l'entreprise"
                value={settings.description || ''}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres système</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Langue</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.language || 'Français'} onChange={(e) => setSettings({...settings, language: e.target.value})}>
                <option>Français</option>
                <option>Anglais</option>
                <option>Arabe</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Timezone</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.timezone || 'Africa/Casablanca'} onChange={(e) => setSettings({...settings, timezone: e.target.value})}>
                <option>Africa/Casablanca</option>
                <option>UTC</option>
                <option>Europe/Paris</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Date format</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.dateFormat || 'DD/MM/YYYY'} onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Time format</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.timeFormat || '24h'} onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}>
                <option>24h</option>
                <option>12h</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Items par page</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.itemsPerPage || 10}
                onChange={(e) => setSettings({...settings, itemsPerPage: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Mode maintenance</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.maintenanceMode || false} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer le mode maintenance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres de sécurité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">JWT Expiration (minutes)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.jwtExpiration || 60}
                onChange={(e) => setSettings({...settings, jwtExpiration: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Max tentatives de connexion</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.maxLoginAttempts || 5}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Durée blocage (minutes)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.lockoutDuration || 15}
                onChange={(e) => setSettings({...settings, lockoutDuration: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Longueur minimale mot de passe</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.minPasswordLength || 8}
                onChange={(e) => setSettings({...settings, minPasswordLength: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Exiger majuscules</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.requireUppercase || false} onChange={(e) => setSettings({...settings, requireUppercase: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Obliger les majuscules</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Exiger chiffres</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.requireNumbers || false} onChange={(e) => setSettings({...settings, requireNumbers: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Obliger les chiffres</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Exiger caractères spéciaux</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.requireSpecialChars || false} onChange={(e) => setSettings({...settings, requireSpecialChars: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Obliger les caractères spéciaux</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">2FA Activé</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.twoFactorEnabled || false} onChange={(e) => setSettings({...settings, twoFactorEnabled: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer l'authentification à deux facteurs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Configuration */}
      {activeTab === 'ai' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">OCR Activé</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.ocrEnabled || false} onChange={(e) => setSettings({...settings, ocrEnabled: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer l'OCR</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">FastAPI URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.fastApiUrl || 'http://localhost:8000'}
                onChange={(e) => setSettings({...settings, fastApiUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Modèle IA</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.aiModel || 'gpt-4'} onChange={(e) => setSettings({...settings, aiModel: e.target.value})}>
                <option>gpt-4</option>
                <option>gpt-3.5-turbo</option>
                <option>claude-3</option>
                <option>local</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Température IA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.aiTemperature || 0.7}
                onChange={(e) => setSettings({...settings, aiTemperature: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Max tokens</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.maxTokens || 2000}
                onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">API Key</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••••••"
                value={settings.apiKey || ''}
                onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres de notification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email activé</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.emailEnabled || false} onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer les notifications par email</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Host</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.example.com"
                value={settings.smtpHost || ''}
                onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Port</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.smtpPort || 587}
                onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Username</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.smtpUsername || ''}
                onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Notifications de risque</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.riskNotifications || false} onChange={(e) => setSettings({...settings, riskNotifications: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Notifier pour les nouveaux risques</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Rapports quotidiens</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.dailyReports || false} onChange={(e) => setSettings({...settings, dailyReports: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Envoyer les rapports quotidiens</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === 'backup' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres de sauvegarde</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Sauvegardes automatiques</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.autoBackup || false} onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer les sauvegardes automatiques</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Fréquence</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.backupFrequency || 'daily'} onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}>
                <option>hourly</option>
                <option>daily</option>
                <option>weekly</option>
                <option>monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Rétention (jours)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.backupRetention || 30}
                onChange={(e) => setSettings({...settings, backupRetention: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Chemin de sauvegarde</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/backups"
                value={settings.backupPath || ''}
                onChange={(e) => setSettings({...settings, backupPath: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Compression</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.backupCompression || false} onChange={(e) => setSettings({...settings, backupCompression: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Compresser les sauvegardes</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Encryption</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.backupEncryption || false} onChange={(e) => setSettings({...settings, backupEncryption: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Chiffrer les sauvegardes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Settings */}
      {activeTab === 'analysis' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres d'analyse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Seuil de confiance</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.confidenceThreshold || 0.8}
                onChange={(e) => setSettings({...settings, confidenceThreshold: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Types de données détectées</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.dataTypes || 'all'} onChange={(e) => setSettings({...settings, dataTypes: e.target.value})}>
                <option>all</option>
                <option>pii</option>
                <option>financial</option>
                <option>health</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Analyse en profondeur</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.deepAnalysis || false} onChange={(e) => setSettings({...settings, deepAnalysis: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer l'analyse en profondeur</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Classification automatique</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.autoClassification || false} onChange={(e) => setSettings({...settings, autoClassification: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Classer automatiquement les documents</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Intégrations externes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">LDAP Activé</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.ldapEnabled || false} onChange={(e) => setSettings({...settings, ldapEnabled: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer l'authentification LDAP</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">LDAP URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ldap://ldap.example.com"
                value={settings.ldapUrl || ''}
                onChange={(e) => setSettings({...settings, ldapUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SAML Activé</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.samlEnabled || false} onChange={(e) => setSettings({...settings, samlEnabled: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer SAML SSO</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Webhook URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://webhook.example.com"
                value={settings.webhookUrl || ''}
                onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Logging */}
      {activeTab === 'logging' && (
        <div className="card-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres de journalisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Niveau de log</label>
              <select className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={settings.logLevel || 'info'} onChange={(e) => setSettings({...settings, logLevel: e.target.value})}>
                <option>debug</option>
                <option>info</option>
                <option>warn</option>
                <option>error</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Rétention des logs (jours)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={settings.logRetention || 90}
                onChange={(e) => setSettings({...settings, logRetention: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Logs d'audit</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.auditLogs || false} onChange={(e) => setSettings({...settings, auditLogs: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer les logs d'audit</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Logs d'accès</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={settings.accessLogs || false} onChange={(e) => setSettings({...settings, accessLogs: e.target.checked})} className="rounded bg-zinc-800 border-zinc-600" />
                <span className="text-sm text-zinc-300">Activer les logs d'accès</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
