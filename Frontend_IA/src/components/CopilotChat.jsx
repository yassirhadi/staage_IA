import React, { useState } from 'react';
import axios from 'axios';

const CopilotChat = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Bonjour CISO. Je suis votre Copilote Intelligent. Comment puis-je vous assister aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/ai/chat', { query: currentInput });
            setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Erreur lors de la récupération de la réponse du Copilote.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '25px', maxWidth: '750px', margin: '20px auto', fontFamily: 'Segoe UI, sans-serif' }}>
            <h3 style={{ color: '#202124' }}>💬 Assistant Conversationnel - Copilote RSSI</h3>
            <div style={{ border: '1px solid #dadce0', height: '400px', overflowY: 'auto', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <div style={{ background: msg.sender === 'user' ? '#1a73e8' : '#fff', color: msg.sender === 'user' ? '#fff' : '#3c4043', padding: '12px 16px', borderRadius: '18px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', whiteSpace: 'pre-line' }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && <p style={{ color: '#5f6368', fontSize: '13px' }}>Le Copilote réfléchit...</p>}
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input type="text" placeholder="Posez une question (Ex: Quels risques ont été détectés ?)" value={input} onChange={(e) => setInput(e.target.value)} style={{ flexGrow: 1, padding: '12px', borderRadius: '24px', border: '1px solid #dadce0', outline: 'none' }} />
                <button type="submit" style={{ padding: '12px 24px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold' }}>Envoyer</button>
            </form>
        </div>
    );
};

export default CopilotChat;