import React, { useState } from 'react';
import InventoryDashboard from './components/InventoryDashboard';
import CopilotChat from './components/CopilotChat';
import axios from 'axios';

function App() {
  const [activeTab, setActiveTab] = useState('inventory');

  const downloadExcelReport = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/reports/excel', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Rapport_Inventaire_RSSI.xlsx');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        alert('Erreur lors du téléchargement du rapport.');
    }
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f1f3f4', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#1a73e8', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <h2 style={{ margin: 0 }}>🛡️ SecOps Copilot v1.0</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setActiveTab('inventory')} style={{ background: activeTab === 'inventory' ? '#fff' : 'transparent', color: activeTab === 'inventory' ? '#1a73e8' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Inventaire & Analyse
          </button>
          <button onClick={() => setActiveTab('chat')} style={{ background: activeTab === 'chat' ? '#fff' : 'transparent', color: activeTab === 'chat' ? '#1a73e8' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Copilote IA (Chat)
          </button>
          <button onClick={downloadExcelReport} style={{ background: '#34a853', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            📊 Exporter Excel
          </button>
        </div>
      </nav>
      <div style={{ padding: '20px' }}>
        {activeTab === 'inventory' ? <InventoryDashboard /> : <CopilotChat />}
      </div>
    </div>
  );
}

export default App;