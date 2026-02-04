import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askIslamicAssistant } from '../services/geminiService';
import { Send, User, Sparkles } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      content: "Assalamu Alaykum. I am Nur, your Islamic assistant. How can I help you today with questions about the Quran, Hadith, or Fiqh?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const answer = await askIslamicAssistant(input);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: answer
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-2 opacity-70 text-xs uppercase tracking-wider font-bold">
                {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                {msg.role === 'user' ? 'You' : 'Nur Assistant'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 rounded-bl-none flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Sparkles size={16} />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a ruling, Ayah, or Hadith..."
            className="w-full pl-4 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
          Nur AI can make mistakes. Please verify critical rulings with qualified scholars.
        </p>
      </div>
    </div>
  );
};