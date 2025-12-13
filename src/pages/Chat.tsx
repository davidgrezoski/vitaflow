import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Sparkles, MessageCircle, ChefHat } from 'lucide-react';
import { useApp } from '../context/Store';
import { getNutritionAdvice } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import DietGenerator from '../components/DietGenerator';

const Chat = () => {
  const { chatHistory, addMessage } = useApp();
  const [activeTab, setActiveTab] = useState<'chat' | 'diet'>('chat');
  
  // Chat States
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatHistory, isTyping, activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userContent = input;
    setInput('');
    setError(null);
    
    await addMessage({
      role: 'user',
      content: userContent,
    });

    setIsTyping(true);

    try {
      const response = await getNutritionAdvice(chatHistory, userContent);
      await addMessage({
        role: 'assistant',
        content: response,
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao conectar com a Nutri Yasmin.");
    } finally {
      setIsTyping(false);
    }
  };

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] relative">
      {!hasApiKey && (
        <div className="mx-4 mt-2 mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl text-amber-800 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-800 flex gap-2 items-center">
          <AlertCircle size={16} />
          <p>Configure sua API Key no arquivo .env</p>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="px-4 mb-4">
        <div className="bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chat' 
                ? 'bg-white dark:bg-zinc-800 text-primary dark:text-primary shadow-sm' 
                : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}
          >
            <MessageCircle size={16} />
            Chat Livre
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'diet' 
                ? 'bg-white dark:bg-zinc-800 text-primary dark:text-primary shadow-sm' 
                : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}
          >
            <ChefHat size={16} />
            Gerar Dieta
          </button>
        </div>
      </div>

      {activeTab === 'diet' ? (
        <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
          <DietGenerator />
        </div>
      ) : (
        <>
          {error && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-red-50 dark:bg-red-900/90 text-red-600 dark:text-red-200 px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-red-100 dark:border-red-800 animate-fade-in">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-2 space-y-6 pb-20 pt-2 scrollbar-hide">
            {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-zinc-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 relative">
                        <Bot size={40} strokeWidth={1.5} />
                    </div>
                    <p className="font-medium text-lg">Olá! Sou a Nutri Yasmin.</p>
                    <p className="text-sm opacity-60">Pergunte sobre dieta, macros ou saúde.</p>
                </div>
            )}

            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in group`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-transparent ${
                  msg.role === 'user' ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-orange-50 dark:bg-orange-900/20 text-primary dark:text-primary border-orange-100 dark:border-orange-900/30'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    msg.role === 'user' ? 'text-right text-gray-400 dark:text-zinc-600' : 'text-left text-primary dark:text-primary'
                  }`}>
                    {msg.role === 'user' ? 'Você' : 'Nutri Yasmin'}
                  </span>
                  
                  <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-sm' 
                      : 'bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm max-w-none prose-orange dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 text-primary dark:text-primary flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-600 rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-600 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="absolute bottom-4 left-0 w-full px-2">
            <form onSubmit={handleSend} className="flex gap-2 items-center bg-white dark:bg-zinc-900 p-2 pl-4 rounded-full border border-gray-200 dark:border-zinc-800 shadow-lg shadow-gray-200/20 dark:shadow-black/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida..."
                disabled={!hasApiKey || isTyping}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none font-medium min-w-0"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping || !hasApiKey}
                className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-zinc-800 transition-all active:scale-90 shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
