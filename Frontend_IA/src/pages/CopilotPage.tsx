import { useState } from 'react';
import { aiApi, inventoryApi, rssiApi } from '../api/services';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'database';
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const SUGGESTIONS = [
  'Quels documents contiennent un CIN ?',
  'Quels sont les principaux risques détectés ?',
  'Explique ISO 27001',
  'Quels documents sont confidentiels ?',
  'Comment gérer un mot de passe en clair ?',
  'Qu\'est-ce que le NIST Cybersecurity Framework ?',
  'Combien de contrats sont dans l\'inventaire ?',
  'Quels risques sont critiques ?',
  'Comment classer un document RH ?',
  'Génère un rapport de conformité',
  'Qu\'est-ce que la loi 09-08 ?',
  'Quels documents contiennent un IBAN ?',
  'Explique les CIS Controls',
  'Comment fonctionne l\'inventaire automatique ?',
  'Quels types d\'actifs informationnels existent ?',
];

const DB_SUGGESTIONS = [
  '📄 Rechercher dans les documents',
  '⚠️ Rechercher dans les risques',
  '📋 Rechercher dans les rapports',
];

export default function CopilotPage() {
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      title: 'Conversation du 12/07/2026',
      messages: [],
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'ai' | 'database'>('ai');
  const [error, setError] = useState<string | null>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0];

  const updateCurrentConversation = (newMessages: Message[]) => {
    setConversations(prev => prev.map(c =>
      c.id === currentConversationId
        ? { ...c, messages: newMessages, updatedAt: new Date().toISOString(), title: newMessages[0]?.content.substring(0, 40) + '...' || c.title }
        : c
    ));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function for timeout
  const fetchWithTimeout = (promise: Promise<any>, timeoutMs: number = 30000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      ),
    ]);
  };

  const askQuestion = async (q: string) => {
    if (!q.trim()) {
      setError('La question ne peut pas être vide.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);

    const userMessage: Message = {
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...currentConversation.messages, userMessage];
    updateCurrentConversation(newMessages);
    setLoading(true);
    setQuestion('');

    try {
      const res = await fetchWithTimeout(aiApi.chat('chat', { question: q }));
      console.log('Chat API Response:', res);
      const answer = res?.data?.answer || res?.data?.data?.answer || res?.data?.reply || res?.data?.message || null;
      console.log('Extracted answer:', answer);
      
      if (!answer) {
        console.error('No answer in response:', res);
        throw new Error('NoResponse');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
      };

      updateCurrentConversation([...newMessages, assistantMessage]);
    } catch (err: any) {
      let errorMessage: string;
      
      if (err?.message === 'Timeout') {
        errorMessage = 'Temps d\'attente dépassé. Veuillez réessayer.';
      } else if (err?.message === 'NoResponse') {
        errorMessage = 'Aucune réponse trouvée.';
      } else {
        errorMessage = 'Service IA indisponible. Démarrez le service Python (cd IA && python run.py).';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };
      updateCurrentConversation([...newMessages, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const searchDatabase = async (q: string) => {
    if (!q.trim()) {
      setError('La recherche ne peut pas être vide.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);

    const userMessage: Message = {
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...currentConversation.messages, userMessage];
    updateCurrentConversation(newMessages);
    setLoading(true);
    setQuestion('');

    try {
      // Search in documents
      const docsRes = await inventoryApi.getDocuments();
      const documents = docsRes.data.data || [];
      const filteredDocs = documents.filter((doc: any) =>
        doc.fileName?.toLowerCase().includes(q.toLowerCase()) ||
        doc.documentType?.toLowerCase().includes(q.toLowerCase()) ||
        doc.confidentialityLevel?.toLowerCase().includes(q.toLowerCase())
      );

      // Search in risks (simulate since we don't have real endpoint yet)
      const filteredRisks: any[] = [
        { title: 'Données bancaires exposées', severity: 'Critique' },
      ];

      // Search in reports
      const recsRes = await rssiApi.getReports();
      const recommendations = recsRes.data.data || [];
      const filteredRecs = recommendations.filter((rec: any) =>
        rec.title?.toLowerCase().includes(q.toLowerCase()) ||
        rec.description?.toLowerCase().includes(q.toLowerCase())
      );

      let response = '';
      if (filteredDocs.length > 0) {
        response += `\n📄 Documents trouvés (${filteredDocs.length}):\n`;
        filteredDocs.forEach((doc: any) => {
          response += `- ${doc.fileName} (${doc.documentType}, ${doc.confidentialityLevel})\n`;
        });
      }
      if (filteredRisks.length > 0) {
        response += `\n⚠️ Risques trouvés (${filteredRisks.length}):\n`;
        filteredRisks.forEach((risk: any) => {
          response += `- ${risk.title} (${risk.severity})\n`;
        });
      }
      if (filteredRecs.length > 0) {
        response += `\n📋 Rapports trouvés (${filteredRecs.length}):\n`;
        filteredRecs.forEach((rec: any) => {
          response += `- ${rec.title}\n`;
        });
      }

      if (!response) {
        response = 'Aucun résultat trouvé dans la base de données.';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        type: 'database',
      };

      updateCurrentConversation([...newMessages, assistantMessage]);
    } catch {
      const errorMessage = 'Erreur lors de la recherche dans la base de données.';
      const assistantMessage: Message = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };
      updateCurrentConversation([...newMessages, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'ai') {
      askQuestion(question);
    } else {
      searchDatabase(question);
    }
  };

  const createNewConversation = () => {
    const newId = conversations.length + 1;
    const newConversation: Conversation = {
      id: newId,
      title: 'Nouvelle conversation',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
  };

  const deleteConversation = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      const filtered = conversations.filter(c => c.id !== id);
      setConversations(filtered);
      if (filtered.length > 0) {
        setCurrentConversationId(filtered[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  return (
    <div className="page flex h-[calc(100vh-6rem)]">
      {/* Sidebar - Conversation History */}
      <div className="w-64 bg-zinc-800 border-r border-zinc-700 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-200">Historique</h3>
          <Button variant="default" size="sm" onClick={createNewConversation}>
            + Nouvelle conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                conv.id === currentConversationId
                  ? 'bg-blue-900/30 border border-blue-700'
                  : 'bg-zinc-700/50 hover:bg-zinc-700'
              }`}
              onClick={() => setCurrentConversationId(conv.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200 truncate">
                  {conv.title}
                </span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="text-zinc-400 hover:text-red-400 text-xs"
                >
                  🗑️
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(conv.updatedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="page-header border-b border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2>Copilote IA</h2>
              <p className="page-subtitle">Assistant intelligent pour le RSSI — conformité, risques, classification</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={searchMode === 'ai' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('ai')}
              >
                🤖 Mode IA
              </Button>
              <Button
                variant={searchMode === 'database' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('database')}
              >
                🔍 Recherche DB
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mx-4 my-2 bg-red-900/30 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {currentConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-2xl font-semibold text-zinc-200 mb-2">Bonjour ! Je suis votre Copilote RSSI.</h3>
              <p className="text-zinc-400 max-w-lg mb-6">
                {searchMode === 'ai'
                  ? 'Posez vos questions sur l\'inventaire, les risques, la classification et la conformité (ISO 27001, NIST, CIS).'
                  : 'Recherchez dans la base de données pour trouver des documents, risques et rapports.'}
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
                {searchMode === 'ai'
                  ? SUGGESTIONS.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        onClick={() => askQuestion(s)}
                      >
                        {s}
                      </Button>
                    ))
                  : DB_SUGGESTIONS.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const query = s.replace(/^[^\s]+\s/, '');
                          searchDatabase(query);
                        }}
                      >
                        {s}
                      </Button>
                    ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentConversation.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-zinc-700 text-zinc-200 rounded-bl-sm'
                  }`}>
                    <pre className="whitespace-pre-wrap text-sm">{msg.content}</pre>
                    <p className="text-xs text-zinc-400 mt-2 text-right">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-700 text-zinc-200 p-4 rounded-lg rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">⏳</span>
                      <span>{searchMode === 'ai' ? 'Analyse en cours...' : 'Recherche en cours...'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form className="p-4 border-t border-zinc-700 bg-zinc-800/50" onSubmit={handleAsk}>
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={searchMode === 'ai' ? 'Posez votre question au Copilote RSSI...' : 'Recherchez dans la base de données...'}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg bg-zinc-900 text-zinc-100 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              {searchMode === 'ai' ? 'Envoyer' : 'Rechercher'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
