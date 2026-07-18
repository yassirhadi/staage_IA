import React, { useState } from 'react';
import axios from 'axios';

const InventoryDashboard = () => {
    const [path, setPath] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('info');

    const handleScanSubmit = async (e) => {
        e.preventDefault();
        if (!path) {
            setMessage('Veuillez entrer un chemin de dossier valide.');
            setStatus('error');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post('http://localhost:8080/api/inventory/scan', { path: path });
            setMessage(response.data.message);
            setStatus('success');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Une erreur est survenue lors du scan.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '700px', margin: '40px auto', fontFamily: 'Segoe UI, sans-serif', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
            <h2 style={{ color: '#1a73e8', marginBottom: '10px' }}>🛡️ Dashboard d'Inventaire Automatique</h2>
            <p style={{ color: '#5f6368', fontSize: '14px' }}>Analyse continue et détection des risques de sécurité (Copilote RSSI).</p>
            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
            <form onSubmit={handleScanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ fontWeight: '600', color: '#3c4043' }}>Chemin absolu du dossier à scanner :</label>
                <input type="text" placeholder="Ex: C:/Users/CISO/Documents/SecretFiles" value={path} onChange={(e) => setPath(e.target.value)} style={{ padding: '12px', fontSize: '15px', borderRadius: '6px', border: '1px solid #dadce0', outline: 'none' }} />
                <button type="submit" disabled={loading} style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: loading ? '#ccc' : '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Analyse et traitement IA en cours...' : 'Lancer l\'analyse (Scan Folder)'}
                </button>
            </form>
            {message && (
                <div style={{ marginTop: '25px', padding: '15px', borderRadius: '6px', fontSize: '14px', backgroundColor: status === 'success' ? '#e6f4ea' : status === 'error' ? '#fce8e6' : '#f1f3f4', color: status === 'success' ? '#137333' : status === 'error' ? '#c5221f' : '#3c4043', borderLeft: `5px solid ${status === 'success' ? '#137333' : status === 'error' ? '#c5221f' : '#3c4043'}` }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default InventoryDashboard;