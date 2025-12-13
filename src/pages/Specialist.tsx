import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  ChevronLeft, 
  MessageCircle,
  Stethoscope,
  Dumbbell,
  Utensils
} from 'lucide-react';
import { useApp } from '../context/Store';
import { getPersonaChatResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

// Definição das Personas
type PersonaType = 'nutri' | 'physio' | 'trainer';

interface Persona {
  id: PersonaType;
  name: string;
  role: string;
  avatar: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  systemPrompt: string;
  welcomeMessage: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'nutri',
    name: 'Dra. Clara',
    role: 'Nutricionista Esportiva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara&hair=longButNotTooLong&clothing=blazerAndShirt',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: <Utensils size={20} />,
    systemPrompt: `
      Você é a Dra. Clara, uma Nutricionista Esportiva renomada do app VitaFlow.
      SUA PERSONALIDADE:
      - Empática, carinhosa, mas firme nos objetivos.
      - Usa emojis relacionados a comida (🍎, 🥗, 🥑).
      - Foca em reeducação alimentar, não em dietas malucas.
      - Sempre explica o "porquê" dos alimentos.
      - Se perguntarem de treino, dê uma dica básica mas sugira falar com o Coach Bruno.
      - Se perguntarem de dor, sugira falar com o Dr. André.
    `,
    welcomeMessage: "Olá! Sou a Dra. Clara. Vamos ajustar sua alimentação para você ter mais energia e resultados? O que você comeu hoje?"
  },
  {
    id: 'physio',
    name: 'Dr. André',
    role: 'Fisioterapeuta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andre&facialHair=beardMedium&clothing=collarAndSweater',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: <Stethoscope size={20} />,
    systemPrompt: `
      Você é o Dr. André, Fisioterapeuta Especialista em Biomecânica e Reabilitação.
      SUA PERSONALIDADE:
      - Técnico, preciso, calmo e tranquilizador.
      - Usa emojis relacionados a saúde e corpo (💪, 🦴, 🩺).
      - Foca em postura, prevenção de lesões, mobilidade e alívio de dores.
      - Sempre pergunta sobre o nível de dor (0 a 10).
      - Se o assunto for dieta, encaminhe para a Dra. Clara.
    `,
    welcomeMessage: "Olá. Sou o Dr. André. Estou aqui para cuidar da sua recuperação e mobilidade. Está sentindo algum desconforto muscular ou articular hoje?"
  },
  {
    id: 'trainer',
    name: 'Coach Bruno',
    role: 'Personal Trainer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno&facialHair=beardLight&clothing=hoodie',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: <Dumbbell size={20} />,
    systemPrompt: `
      Você é o Coach Bruno, Personal Trainer de Alta Performance.
      SUA PERSONALIDADE:
      - Energético, motivador, usa gírias de academia (mas profissional).
      - Usa emojis de força e fogo (🔥, 🚀, 🏋️).
      - Foca em execução correta, periodização, hipertrofia e emagrecimento.
      - "Sem dor, sem ganho" (mas com segurança).
      - Se o aluno relatar dor aguda, PARE e mande falar com o Dr. André.
    `,
    welcomeMessage: "E aí, campeão! Coach Bruno na área. Bora esmagar esse treino? Qual é o foco de hoje: crescer ou secar? 🚀"
  }
];

const Specialist = () => {
  const { user } = useApp();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  
  // Chat States (independente para cada sessão seria ideal, aqui simplificado)
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Inicia o chat quando uma persona é selecionada
  useEffect(() => {
    if (selectedPersona) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: selectedPersona.welcomeMessage
      }]);
    }
  }, [selectedPersona]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPersona) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getPersonaChatResponse(
        messages, 
        input, 
        selectedPersona.systemPrompt
      );
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setIsTyping(false);
    }
  };

  // --- TELA DE SELEÇÃO ---
  if (!selectedPersona) {
    return (
      <div className="animate-fade-in pb-24 px-6">
        <div className="mb-8 mt-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sua Equipe</h2>
          <p className="text-gray-500 dark:text-zinc-400">Escolha um especialista para conversar agora.</p>
        </div>

        <div className="grid gap-4">
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona)}
              className="group relative bg-white dark:bg-dark-surface rounded-[2rem] p-6 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-left flex items-center gap-5 overflow-hidden"
            >
              {/* Avatar com Círculo Decorativo */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${persona.bgColor}`}></div>
                <div className={`w-16 h-16 rounded-full border-2 ${persona.borderColor} overflow-hidden relative z-10 bg-gray-100`}>
                  <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm z-20 ${persona.color}`}>
                  {persona.icon}
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {persona.name}
                </h3>
                <p className={`text-sm font-medium ${persona.color} mb-1`}>
                  {persona.role}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Online agora
                </div>
              </div>

              <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                <MessageCircle className="text-gray-300 dark:text-zinc-600" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-center">
            <p className="text-xs text-orange-800 dark:text-orange-200 font-medium">
                💡 Dica: Você pode trocar de especialista a qualquer momento para tratar de assuntos diferentes.
            </p>
        </div>
      </div>
    );
  }

  // --- TELA DE CHAT ---
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] relative animate-slide-up">
      
      {/* Header do Chat */}
      <div className="px-4 mb-2 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedPersona(null)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border ${selectedPersona.borderColor} overflow-hidden`}>
                <img src={selectedPersona.avatar} alt={selectedPersona.name} className="w-full h-full object-cover" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{selectedPersona.name}</h3>
                <p className={`text-xs font-bold ${selectedPersona.color}`}>{selectedPersona.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-20 pt-2 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${
              msg.role === 'user' 
                ? 'bg-gray-900 dark:bg-white border-transparent' 
                : `${selectedPersona.bgColor} ${selectedPersona.borderColor}`
            }`}>
              {msg.role === 'user' ? (
                <User size={14} className="text-white dark:text-black" />
              ) : (
                <img src={selectedPersona.avatar} alt="Bot" className="w-full h-full object-cover" />
              )}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm shadow-sm max-w-[85%] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-sm' 
                : 'bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-tl-sm'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPersona.bgColor} ${selectedPersona.color}`}>
              <div className="w-2 h-2 bg-current rounded-full animate-ping" />
            </div>
            <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center border border-gray-100 dark:border-dark-border">
              <span className="text-xs text-gray-400 font-medium">Digitando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        <form onSubmit={handleSend} className="flex gap-2 items-center bg-white dark:bg-zinc-900 p-2 pl-4 rounded-full border border-gray-200 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-black/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Mensagem para ${selectedPersona.name}...`}
            disabled={isTyping}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none font-medium min-w-0"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-zinc-800 transition-all active:scale-90 shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Specialist;
