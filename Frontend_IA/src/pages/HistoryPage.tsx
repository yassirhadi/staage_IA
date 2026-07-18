import { useEffect, useState } from 'react';
import { Search, Calendar, Filter, Eye, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import { aiApi } from '../api/services';
import '../styles/Pages.css';

interface HistoryEntry {
  id: number;
  user: string;
  question: string;
  answer: string;
  duration: number;
  tokensUsed: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await aiApi.chat('get_history');
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        // Map database fields to frontend interface
        const mappedHistory: HistoryEntry[] = data.map((item: any) => ({
          id: item.id,
          user: item.user_id ? `user_${item.user_id}` : 'admin', // Map user_id to username
          question: item.question,
          answer: item.answer,
          duration: item.duration || 0,
          tokensUsed: item.tokens_used || 0,
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setHistory(mappedHistory);
      } catch (e) {
        console.error('Error loading history:', e);
        setHistory([]); // Show empty state on error instead of mock data
      }
    };
    loadHistory();
  }, []);

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = searchTerm === '' || 
      entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filter === 'ALL' || entry.user === filter;
    
    const entryDate = new Date(entry.createdAt);
    const matchesStartDate = startDate === '' || entryDate >= new Date(startDate);
    const matchesEndDate = endDate === '' || entryDate <= new Date(endDate);
    
    return matchesSearch && matchesUser && matchesStartDate && matchesEndDate;
  });

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

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const uniqueUsers = ['ALL', ...Array.from(new Set(history.map((h) => h.user)))];

  const handleDelete = (id: number) => {
    setHistory(history.filter((entry) => entry.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
    setShowClearConfirm(false);
  };

  const exportToPDF = () => {
    alert('Export PDF - Fonctionnalité à implémenter avec une librairie comme jsPDF');
  };

  const exportToExcel = () => {
    alert('Export Excel - Fonctionnalité à implémenter avec une librairie comme xlsx');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Historique IA</h2>
          <p className="page-subtitle">Historique des interactions avec le Copilote IA</p>
        </div>
        <span className="page-badge">{history.length} interaction(s)</span>
      </div>

      <div className="card-panel">
        <div className="filters-row">
          <div className="filter-group">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <Calendar size={16} />
              Date début:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <Calendar size={16} />
              Date fin:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <Filter size={16} />
              Utilisateur:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user === 'ALL' ? 'Tous les utilisateurs' : user}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group export-buttons">
            <button onClick={exportToPDF} className="btn-export pdf">
              <FileText size={16} />
              Export PDF
            </button>
            <button onClick={exportToExcel} className="btn-export excel">
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
          </div>
          
          <div className="filter-group">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-danger"
              disabled={history.length === 0}
            >
              <Trash2 size={16} />
              Vider l'historique
            </button>
          </div>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty">Aucun historique disponible.</div>
        ) : (
          filteredHistory.map((entry) => (
            <div key={entry.id} className="history-entry">
              <div className="history-header">
                <div className="history-user">
                  <span className="user-badge">{entry.user}</span>
                  <span className="history-time">{formatDate(entry.createdAt)}</span>
                </div>
                <div className="history-meta">
                  <span className="meta-item">⏱️ {formatDuration(entry.duration)}</span>
                  <span className="meta-item">🔤 {entry.tokensUsed} tokens</span>
                </div>
              </div>
              <div className="history-content">
                <div className="history-question">
                  <strong>Question:</strong>
                  <p>{entry.question}</p>
                </div>
                <div className="history-answer">
                  <strong>Réponse:</strong>
                  <p>{entry.answer}</p>
                </div>
              </div>
              <div className="history-actions">
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="btn-action btn-view"
                >
                  <Eye size={16} />
                  Voir détails
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="btn-action btn-delete"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir vider tout l'historique ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleClearHistory}
                className="btn-danger"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedEntry && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Détails de l'analyse</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="btn-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>ID:</strong> {selectedEntry.id}
              </div>
              <div className="detail-row">
                <strong>Utilisateur:</strong> {selectedEntry.user}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {formatDate(selectedEntry.createdAt)}
              </div>
              <div className="detail-row">
                <strong>Temps de réponse:</strong> {formatDuration(selectedEntry.duration)}
              </div>
              <div className="detail-row">
                <strong>Tokens utilisés:</strong> {selectedEntry.tokensUsed}
              </div>
              <div className="detail-section">
                <strong>Question:</strong>
                <p>{selectedEntry.question}</p>
              </div>
              <div className="detail-section">
                <strong>Réponse:</strong>
                <p>{selectedEntry.answer}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
