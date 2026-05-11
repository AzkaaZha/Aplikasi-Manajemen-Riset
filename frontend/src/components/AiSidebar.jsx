import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Copy, X, Loader2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiApi } from '../lib/api';

const SUGGESTIONS = [
  "Buatkan draf abstrak",
  "Perbaiki tata bahasa tulisan ini",
  "Ringkas isi dokumen ini"
];

export default function AiSidebar({ onClose, documentContext, messages, setMessages }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e, text = input) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    
    // Create history (exclude the very first greeting)
    const history = messages.slice(1);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const res = await aiApi.chat(userMessage.content, documentContext, history, abortControllerRef.current.signal);
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        setMessages(prev => [...prev, { role: 'ai', content: '*Membalas dibatalkan oleh pengguna.*' }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, terjadi kesalahan saat menghubungi asisten AI.' }]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Teks disalin ke clipboard!');
  };

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Bot className="text-blue-600" /> AI Assistant
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className={`p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            {msg.role === 'ai' && i > 0 && (
              <button 
                onClick={() => copyToClipboard(msg.content)}
                className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 ml-1"
              >
                <Copy size={12} /> Salin Teks
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex self-start items-start max-w-[90%]">
             <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-sm text-gray-500">
               <Loader2 size={16} className="animate-spin text-blue-600" />
               AI sedang mengetik...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(null, sug)}
              disabled={loading}
              className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100 disabled:opacity-50 text-left whitespace-nowrap"
            >
              {sug}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="relative flex gap-2 items-end">
          <div className="relative flex-1">
            <textarea
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya asisten AI... (Shift+Enter untuk baris baru)"
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 resize-none min-h-[44px] max-h-32"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
            />
          </div>
          
          {loading ? (
            <button 
              type="button"
              onClick={handleStop}
              className="p-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors mb-[2px]"
              title="Batalkan"
            >
              <Square size={18} fill="currentColor" />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-colors mb-[2px]"
            >
              <Send size={18} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
