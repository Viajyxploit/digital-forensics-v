import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIAssistant = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/ai/chat`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = { role: 'ai', content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error', error);
      const errorMessage = { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-8 top-8 bottom-24 w-96 glass-panel flex flex-col"
        style={{ zIndex: 99998 }}
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3 }}
        data-testid="ai-assistant-panel"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-electric-violet" />
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>AI ASSISTANT</h2>
          </div>
          <button onClick={onClose} className="hover:text-neon-red transition-colors" data-testid="ai-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="ai-messages-container">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <Brain className="w-16 h-16 mx-auto mb-4 text-electric-violet" />
              <p style={{ fontFamily: 'Outfit, sans-serif' }}>Ask me anything about digital forensics!</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-cyan-core/20 border border-cyan-core/30 ml-8'
                  : 'bg-electric-violet/20 border border-electric-violet/30 mr-8'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              data-testid={`ai-message-${idx}`}
            >
              <p className="text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{msg.content}</p>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              className="p-3 rounded-lg bg-electric-violet/20 border border-electric-violet/30 mr-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Thinking...</p>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 bg-surface/50 border border-white/10 focus:border-cyan-core/50 outline-none"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              data-testid="ai-input"
            />
            <motion.button
              onClick={sendMessage}
              className="px-4 py-2 bg-electric-violet hover:bg-cyan-core transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              data-testid="ai-send-btn"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistant;