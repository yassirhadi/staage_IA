import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Upload, AlertTriangle, FileText, Check, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { rssiApi } from '../api/services';

type NotificationCategory = 'INFORMATION' | 'ALERT' | 'CRITICAL';
type NotificationType = 'DOCUMENT_UPLOAD' | 'SENSITIVE_DATA' | 'CRITICAL_RISK' | 'ANALYSIS_COMPLETE';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  entityType?: string;
  entityId?: number;
  createdAt: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | ''>('');
  const [filterType, setFilterType] = useState<NotificationType | ''>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rssiApi.getNotifications();
      let data: Notification[] = Array.isArray(res.data.data) ? res.data.data : [];
      data = data.filter(n => n && (n.title || n.message));
      setNotifications(data);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleDeleteAll = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      setNotifications([]);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    switch (notification.type) {
      case 'DOCUMENT_UPLOAD':
        navigate('/documents');
        break;
      case 'SENSITIVE_DATA':
        navigate('/sensitive-data');
        break;
      case 'CRITICAL_RISK':
        navigate('/risks');
        break;
      case 'ANALYSIS_COMPLETE':
        navigate('/history');
        break;
      default:
        if (notification.entityType) {
          navigate(`/${notification.entityType.toLowerCase()}/${notification.entityId}`);
        }
    }
  };

  const filtered = notifications.filter(n => {
    if (showUnreadOnly && n.isRead) return false;
    if (filterCategory && n.category !== filterCategory) return false;
    if (filterType && n.type !== filterType) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (d: string) => {
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

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'CRITICAL': return 'bg-red-500';
      case 'ALERT': return 'bg-orange-500';
      case 'INFORMATION': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'DOCUMENT_UPLOAD': return <Upload className="h-5 w-5" />;
      case 'SENSITIVE_DATA': return <AlertTriangle className="h-5 w-5" />;
      case 'CRITICAL_RISK': return <AlertTriangle className="h-5 w-5" />;
      case 'ANALYSIS_COMPLETE': return <FileText className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case 'CRITICAL': return 'Critique';
      case 'ALERT': return 'Alerte';
      case 'INFORMATION': return 'Information';
      default: return 'Inconnu';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'DOCUMENT_UPLOAD': return 'Upload Document';
      case 'SENSITIVE_DATA': return 'Données Sensibles';
      case 'CRITICAL_RISK': return 'Risque Critique';
      case 'ANALYSIS_COMPLETE': return 'Analyse Terminée';
      default: return 'Autre';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Alertes et messages du système</p>
        </div>
        <Badge variant={unreadCount > 0 ? "destructive" : "secondary"} className="text-sm">
          {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as NotificationCategory | '')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Toutes catégories</option>
              <option value="INFORMATION">Information</option>
              <option value="ALERT">Alerte</option>
              <option value="CRITICAL">Critique</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NotificationType | '')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Tous les types</option>
              <option value="DOCUMENT_UPLOAD">Upload Document</option>
              <option value="SENSITIVE_DATA">Données Sensibles</option>
              <option value="CRITICAL_RISK">Risque Critique</option>
              <option value="ANALYSIS_COMPLETE">Analyse Terminée</option>
            </select>
          </div>

          <Button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
          >
            {showUnreadOnly ? 'Toutes' : 'Non lues'}
          </Button>

          <Button onClick={load} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          <Button onClick={handleDeleteAll} variant="destructive" size="sm" disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer tout
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucune notification.</div>
        ) : (
          filtered.map(n => (
            <Card 
              key={n.id} 
              className={`transition-all cursor-pointer hover:shadow-md ${!n.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getCategoryColor(n.category)} text-white shrink-0`}>
                    {getTypeIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">{n.title || 'Notification'}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(n.category)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(n.type)}
                      </Badge>
                      {!n.isRead && (
                        <Badge variant="default" className="text-xs">
                          Non lue
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{n.message || 'Aucun message'}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(n.createdAt)}</span>
                      {n.entityType && <span>Entité: {n.entityType} #{n.entityId}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!n.isRead && (
                      <Button
                        onClick={() => handleMarkAsRead(n.id)}
                        variant="ghost"
                        size="icon"
                        title="Marquer comme lu"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(n.id)}
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}