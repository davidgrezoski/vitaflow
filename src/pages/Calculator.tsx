import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/Store';
import { supabase } from '../lib/supabase';
import { 
    User, 
    Settings, 
    Shield, 
    Bell, 
    CreditCard, 
    HelpCircle, 
    ChevronRight, 
    LogOut,
    Camera,
    ChevronLeft,
    Save,
    Loader2,
    Check,
    Mail,
    Lock,
    Upload,
    Crown,
    Calculator as CalcIcon,
    ToggleLeft,
    ToggleRight,
    Send,
    Bot,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { NotificationSettings } from '../types';
import { calculateBMR, calculateTDEE } from '../lib/utils';
import { getPersonaChatResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

type ViewState = 'main' | 'profile' | 'security' | 'notifications' | 'subscription' | 'help';

const Calculator = () => {
  const { user, signOut, loading, updateUser, trialStatus, upgradeAccount, uploadAvatar } = useApp();
  const [currentView, setCurrentView] = useState<ViewState>('main');

  // Se o usuário não tiver TMB calculada, força a tela de edição de perfil
  useEffect(() => {
    if (user && (!user.tmb || !user.tdee) && currentView === 'main') {
        setCurrentView('profile');
        toast.info("Complete seu perfil para desbloquear o app!", { duration: 5000 });
    }
  }, [user, currentView]);

  // --- SUB-COMPONENTS RENDER ---
  
  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileEditView onBack={() => setCurrentView('main')} forceSetup={!user?.tmb} />;
      case 'security':
        return <SecurityView onBack={() => setCurrentView('main')} email={user?.email || ''} />;
      case 'notifications':
        return <NotificationsView onBack={() => setCurrentView('main')} />;
      case 'subscription':
        return <SubscriptionView onBack={() => setCurrentView('main')} trialStatus={trialStatus} onUpgrade={upgradeAccount} isPro={user?.subscription_status === 'pro'} />;
      case 'help':
        return <HelpView onBack={() => setCurrentView('main')} userName={user?.name || 'Usuário'} />;
      default:
        return <MainSettingsView onViewChange={setCurrentView} onSignOut={signOut} user={user} onUploadAvatar={uploadAvatar} trialStatus={trialStatus} />;
    }
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="pt-4 pb-20 animate-fade-in">
      {renderView()}
    </div>
  );
};

// --- VIEW PRINCIPAL ---

const MainSettingsView = ({ onViewChange, onSignOut, user, onUploadAvatar, trialStatus }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      await onUploadAvatar(e.target.files[0]);
      setUploading(false);
    }
  };

  const isPro = user?.subscription_status === 'pro';

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full bg-dark-surface border-2 border-primary p-1 overflow-hidden relative shadow-lg shadow-primary/20">
                {uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                ) : (
                  <img 
                      src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover bg-gray-800"
                  />
                )}
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-2 border-black group-hover:scale-110 transition-transform shadow-md">
                <Camera size={14} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'Usuário'}</h2>
        
        <div className={`px-3 py-1 rounded-full mt-2 text-xs font-bold flex items-center gap-1.5 ${
            isPro 
            ? 'bg-primary/20 text-primary border border-primary/20' 
            : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
        }`}>
            {isPro ? <Crown size={12} fill="currentColor" /> : null}
            {isPro ? "Membro Premium" : trialStatus.isExpired ? "Plano Gratuito" : "Período de Teste"}
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-3">
        <SettingItem icon={<User size={20} />} label="Informações e Metas (TMB)" onClick={() => onViewChange('profile')} />
        <SettingItem icon={<Shield size={20} />} label="Segurança e Senha" onClick={() => onViewChange('security')} />
        <SettingItem icon={<Bell size={20} />} label="Notificações" onClick={() => onViewChange('notifications')} />
        <SettingItem icon={<CreditCard size={20} />} label="Pagamentos e Assinatura" onClick={() => onViewChange('subscription')} />
        <SettingItem icon={<HelpCircle size={20} />} label="Ajuda e Suporte IA" onClick={() => onViewChange('help')} />
      </div>

      <div className="pt-4">
        <button 
            onClick={onSignOut}
            className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
            <LogOut size={20} />
            Sair da Conta
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">Versão 2.1.0 (Beta)</p>
      </div>
    </div>
  );
};

// --- VIEW: EDITAR PERFIL ---

const ProfileEditView = ({ onBack, forceSetup = false }: { onBack: () => void, forceSetup?: boolean }) => {
  const { user, updateUser } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    weight: user?.weight || 0,
    height: user?.height || 0,
    age: user?.age || 0,
    gender: user?.gender || 'male',
    goal: user?.goal || 'maintain',
    activityLevel: user?.activityLevel || 'moderate'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const bmr = calculateBMR(
        Number(formData.weight), 
        Number(formData.height), 
        Number(formData.age), 
        formData.gender as 'male' | 'female'
    );
    
    const tdee = calculateTDEE(bmr, formData.activityLevel);

    try {
      await updateUser({
        ...user!,
        ...formData,
        weight: Number(formData.weight),
        height: Number(formData.height),
        age: Number(formData.age),
        tmb: bmr,
        tdee: tdee
      });
      toast.success("Perfil e Metas atualizados!");
      onBack();
    } catch (error) {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <Header title={forceSetup ? "Configuração Inicial" : "Editar Perfil"} onBack={forceSetup ? () => {} : onBack} />
      
      {forceSetup && (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl mb-6 border border-orange-100 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium flex gap-2">
                <CalcIcon size={18} />
                Precisamos calcular seu metabolismo para liberar a dieta.
            </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 mt-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
          <input 
            type="text" 
            required
            className="input-field" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Peso (kg)</label>
            <input 
              type="number" 
              required
              min={30}
              max={300}
              className="input-field" 
              value={formData.weight || ''}
              onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Altura (cm)</label>
            <input 
              type="number" 
              required
              min={100}
              max={250}
              className="input-field" 
              value={formData.height || ''}
              onChange={e => setFormData({...formData, height: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Idade</label>
            <input 
              type="number" 
              required
              min={10}
              max={120}
              className="input-field" 
              value={formData.age || ''}
              onChange={e => setFormData({...formData, age: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Gênero</label>
            <select 
              className="input-field appearance-none" 
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value as any})}
            >
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Objetivo Atual</label>
          <select 
            className="input-field appearance-none" 
            value={formData.goal}
            onChange={e => setFormData({...formData, goal: e.target.value as any})}
          >
            <option value="lose">Perder Peso (Déficit)</option>
            <option value="maintain">Manter Peso (Manutenção)</option>
            <option value="gain">Ganhar Massa (Superávit)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nível de Atividade</label>
          <select 
            className="input-field appearance-none" 
            value={formData.activityLevel}
            onChange={e => setFormData({...formData, activityLevel: e.target.value as any})}
          >
            <option value="sedentary">Sedentário (Escritório, sem treino)</option>
            <option value="light">Leve (Treino 1-3x/semana)</option>
            <option value="moderate">Moderado (Treino 3-5x/semana)</option>
            <option value="active">Ativo (Treino 6-7x/semana)</option>
            <option value="very_active">Muito Ativo (Atleta/Trabalho pesado)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-8 active:scale-95 transition-all"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {forceSetup ? "Calcular Metas e Iniciar" : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

// --- VIEW: SEGURANÇA ---

const SecurityView = ({ onBack, email }: { onBack: () => void, email: string }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
    }
    if (password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setLoading(true);
    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Senha atualizada com sucesso!");
        setPassword('');
        setConfirmPassword('');
        onBack();
    } catch (error: any) {
        toast.error(error.message || "Erro ao atualizar senha.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <Header title="Segurança" onBack={onBack} />
      
      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border mt-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-full">
                <Mail size={20} className="text-gray-500" />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Email Vinculado</p>
                <p className="font-medium text-gray-900 dark:text-white">{email}</p>
            </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-zinc-800 my-6" />

        <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock size={18} className="text-primary" />
                Alterar Senha
            </h3>
            
            <input 
                type="password" 
                placeholder="Nova Senha"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Confirmar Nova Senha"
                className="input-field"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
            />

            <button 
                type="submit"
                disabled={loading || !password}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Atualizar Senha"}
            </button>
        </form>
      </div>
    </div>
  );
};

// --- VIEW: NOTIFICAÇÕES ---

const NotificationsView = ({ onBack }: { onBack: () => void }) => {
  const { user, updateNotifications } = useApp();
  const [settings, setSettings] = useState<NotificationSettings>(
    user?.notification_settings || { workout: true, water: true, meal: false, news: true }
  );

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    updateNotifications(newSettings); // Salva no contexto/banco
  };

  return (
    <div className="animate-slide-up">
      <Header title="Notificações" onBack={onBack} />
      
      <div className="space-y-4 mt-6">
        <ToggleItem 
            label="Lembretes de Treino" 
            desc="Receba avisos para não perder o foco."
            active={settings.workout} 
            onToggle={() => handleToggle('workout')} 
        />
        <ToggleItem 
            label="Hidratação Inteligente" 
            desc="Alertas periódicos para beber água."
            active={settings.water} 
            onToggle={() => handleToggle('water')} 
        />
        <ToggleItem 
            label="Horário das Refeições" 
            desc="Lembretes para bater seus macros."
            active={settings.meal} 
            onToggle={() => handleToggle('meal')} 
        />
        <ToggleItem 
            label="Novidades e Dicas" 
            desc="Atualizações do app e dicas de saúde."
            active={settings.news} 
            onToggle={() => handleToggle('news')} 
        />
      </div>
    </div>
  );
};

// --- VIEW: ASSINATURA ---

const SubscriptionView = ({ onBack, trialStatus, onUpgrade, isPro }: any) => {
  return (
    <div className="animate-slide-up">
      <Header title="Assinatura" onBack={onBack} />
      
      <div className="mt-6 space-y-6">
        {/* Status Card */}
        <div className={`p-6 rounded-[2rem] border ${isPro ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-zinc-800'}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPro ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900/20 text-primary'}`}>
                    <Crown size={24} fill={isPro ? "currentColor" : "none"} />
                </div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isPro ? 'text-white/80' : 'text-gray-500'}`}>Plano Atual</p>
                    <h3 className={`text-2xl font-black ${isPro ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {isPro ? "VitaFlow Premium" : "Plano Gratuito"}
                    </h3>
                </div>
            </div>
            
            {!isPro && (
                <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-3 flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                        Teste expira em: <span className="font-bold text-gray-900 dark:text-white">{trialStatus.daysRemaining} dias</span>
                    </p>
                </div>
            )}

            {isPro ? (
                <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/10 p-3 rounded-xl">
                    <Check size={16} /> Assinatura ativa e renovável.
                </div>
            ) : (
                <button 
                    onClick={onUpgrade}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                    Desbloquear Premium Agora
                </button>
            )}
        </div>

        {/* Features List */}
        {!isPro && (
            <div className="space-y-3 px-2">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Benefícios Premium:</h4>
                <FeatureItem text="Nutricionista IA Ilimitada" />
                <FeatureItem text="Gerador de Treinos Personalizados" />
                <FeatureItem text="Acesso aos Especialistas (Fisio/Personal)" />
                <FeatureItem text="Sem anúncios e suporte prioritário" />
            </div>
        )}

        {isPro && (
            <button className="w-full py-4 text-gray-400 text-sm font-medium hover:text-red-500 transition-colors">
                Gerenciar ou Cancelar Assinatura
            </button>
        )}
      </div>
    </div>
  );
};

// --- VIEW: AJUDA E SUPORTE (CHATBOT) ---

const HelpView = ({ onBack, userName }: { onBack: () => void, userName: string }) => {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: `Olá, ${userName}! Sou o Suporte Inteligente do VitaFlow. Como posso te ajudar hoje?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
        const systemPrompt = `
            Você é o Agente de Suporte do aplicativo VitaFlow.
            Responda dúvidas sobre:
            - Como criar treinos (vá na aba Workout)
            - Como gerar dieta (vá no Chat -> Aba Dieta)
            - Assinaturas e pagamentos
            - Configurações de perfil
            Seja educado, breve e prestativo. Use emojis.
        `;

        const response = await getPersonaChatResponse(messages as any, input, systemPrompt);
        
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response
        }]);
    } catch (error) {
        toast.error("Erro ao conectar com o suporte.");
    } finally {
        setTyping(false);
    }
  };

  return (
    <div className="animate-slide-up h-[calc(100vh-140px)] flex flex-col">
      <Header title="Suporte IA" onBack={onBack} />
      
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 mt-4">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-primary text-white'
                }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                    msg.role === 'user' 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-sm' 
                    : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
            </div>
        ))}
        {typing && (
            <div className="flex gap-2 text-gray-400 text-xs ml-12">
                <span>Digitando...</span>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite sua dúvida..."
            className="flex-1 input-field py-3"
        />
        <button type="submit" disabled={!input.trim() || typing} className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors">
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const Header = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="flex items-center gap-4 mb-2">
    <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
      <ChevronLeft size={20} />
    </button>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
  </div>
);

const SettingItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center justify-between group hover:border-primary/50 transition-all shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-black flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-sm">{label}</span>
        </div>
        <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
    </button>
);

const ToggleItem = ({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle: () => void }) => (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center justify-between">
        <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{label}</h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{desc}</p>
        </div>
        <button onClick={onToggle} className={`transition-colors ${active ? 'text-primary' : 'text-gray-300 dark:text-zinc-600'}`}>
            {active ? <ToggleRight size={32} fill="currentColor" /> : <ToggleLeft size={32} />}
        </button>
    </div>
);

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
        <div className="bg-primary/10 p-1 rounded-full text-primary">
            <Check size={12} strokeWidth={3} />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{text}</span>
    </div>
);

export default Calculator;
