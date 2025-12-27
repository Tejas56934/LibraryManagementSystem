import React, { useState } from 'react';
import AIService from '../api/AIService';
import './AIChatWidget.css'; // You'll need some basic CSS for positioning

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am your Library Assistant. Ask me anything!' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add User Message
        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        setInput("");

        try {
            // Call Backend
            const data = await AIService.chatWithAI(userMsg.text);

            // Add Bot Response
            setMessages(prev => [...prev, { sender: 'bot', text: data.summary }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting." }]);
        }
        setLoading(false);
    };

    return (
        <div className="ai-widget-container">
            {/* The Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>📚 Library AI</h4>
                        <button onClick={() => setIsOpen(false)}>X</button>
                    </div>
                    <div className="chat-body">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="message bot">Thinking...</div>}
                    </div>
                    <div className="chat-footer">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about books..."
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}

            {/* The Floating Button */}
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    🤖 Chat
                </button>
            )}
        </div>
    );
};

export default AIChatWidget;