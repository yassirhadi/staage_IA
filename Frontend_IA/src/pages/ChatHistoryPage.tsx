import { useState, useEffect } from 'react';
import { Search, Trash2, Download, Eye, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aiApi } from '../api/services';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Chat {
  id: number;
  question: string;
  response: string;
  date: string;
}

export default function ChatHistoryPage() {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await aiApi.chat('get_history');
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        // Map database fields to frontend interface
        const mappedChats: Chat[] = data.map((item: any) => ({
          id: item.id,
          question: item.question,
          response: item.answer,
          date: item.created_at || new Date().toISOString(),
        }));
        setChats(mappedChats);
      } catch (e) {
        console.error('Error loading chat history:', e);
        setChats([]); // Show empty state on error instead of mock data
      }
    };
    loadChats();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = 
      chat.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? chat.date.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
  const paginatedChats = filteredChats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteChat = (id: number) => {
    setChats(chats.filter((chat) => chat.id !== id));
    if (selectedChat?.id === id) setSelectedChat(null);
  };

  const handleDeleteAll = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les conversations ?')) {
      setChats([]);
      setSelectedChat(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Historique des Conversations IA', 14, 22);
    doc.setFontSize(11);
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    let yPosition = 40;
    filteredChats.forEach((chat, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(12);
      doc.text(`Conversation ${index + 1}`, 14, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.text(`Question: ${chat.question}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Réponse: ${chat.response}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Date: ${chat.date}`, 14, yPosition);
      yPosition += 12;
    });

    doc.save('historique_conversations.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredChats.map((chat) => ({
        Question: chat.question,
        Réponse: chat.response,
        Date: chat.date,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique');
    XLSX.writeFile(workbook, 'historique_conversations.xlsx');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historique IA</h1>
        <p className="text-muted-foreground">Voir toutes les conversations avec l'assistant.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher dans les conversations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
          <Button onClick={handleDeleteAll} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer tout
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Réponse</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedChats.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Aucune conversation trouvée
                </td>
              </tr>
            ) : (
              paginatedChats.map((chat) => (
                <tr key={chat.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{chat.question}</td>
                  <td className="px-4 py-3">{chat.response}</td>
                  <td className="px-4 py-3">{chat.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => setSelectedChat(chat)}
                        variant="ghost"
                        size="icon"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteChat(chat.id)}
                        variant="ghost"
                        size="icon"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {selectedChat && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <CardContent className="bg-card w-full max-w-2xl max-h-[80vh] overflow-auto rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Détails de la conversation</h2>
              <Button
                onClick={() => setSelectedChat(null)}
                variant="ghost"
                size="icon"
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Question</label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedChat.question}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Réponse</label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedChat.response}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="mt-1">{selectedChat.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
