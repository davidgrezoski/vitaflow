import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Eye, EyeOff, Github } from 'lucide-react';
import { useApp } from '../context/Store';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

const Auth = () => {
  const { session } = useApp();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country] = useState<'BR' | 'US'>('BR');
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name,
              country,
              preferred_language: language
            },
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setIsLogin(true);
          toast.success("Cadastro realizado! Verifique seu email.");
        }
      }
    } catch (err: any) {
      console.warn("Auth attempt failed:", err.message);
      let msg = err.message;
      
      if (msg.includes('Invalid login credentials')) msg = 'Email ou senha incorretos.';
      if (msg.includes('Email not confirmed')) msg = 'Email não confirmado. Verifique sua caixa de entrada.';
      if (msg.includes('User already registered')) msg = 'Email já cadastrado.';
      
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("GitHub Auth Error:", error);
      toast.error("Erro ao conectar com GitHub.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background Image com Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop" 
            alt="Fitness Background" 
            className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-8 pb-12 pt-20 justify-end">
        
        {/* Header Text */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-5xl font-bold text-white mb-2 leading-tight">
            Bem-vindo ao <br />
            <span className="text-primary">VitaFlow</span>
          </h1>
          <p className="text-gray-300 text-sm max-w-[250px]">
            Sua jornada de saúde e fitness começa aqui. Transforme seu corpo e mente.
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          {error && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-xs font-bold border border-red-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Seu Nome"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 p-5 rounded-2xl outline-none focus:border-primary transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 p-5 rounded-2xl outline-none focus:border-primary transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Senha"
                className="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 p-5 rounded-2xl outline-none focus:border-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                <>
                  {isLogin ? "Entrar com Email" : "Criar Conta"}
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500 font-bold">Ou continue com</span>
            </div>
          </div>

          {/* Botão GitHub */}
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-full border border-zinc-700 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Github size={20} />
            Entrar com GitHub
          </button>

          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
            >
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
