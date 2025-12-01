import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Droplets, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/Store';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { session } = useApp();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Redirecionar automaticamente se já estiver logado
  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setMessage("Cadastro realizado! Verifique seu email para confirmar a conta antes de entrar.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message;
      
      // Tradução de erros comuns do Supabase
      if (msg.includes('Invalid login credentials')) msg = 'Email ou senha incorretos.';
      if (msg.includes('Email not confirmed')) msg = 'Email não confirmado. Verifique sua caixa de entrada.';
      if (msg.includes('User already registered')) msg = 'Este email já está cadastrado.';
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="w-full max-w-sm space-y-10 animate-fade-in">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Droplets className="text-white w-12 h-12" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">VitaFlow</h1>
            <p className="text-gray-500 dark:text-zinc-500 mt-2 font-medium text-lg">Sua saúde, simplificada.</p>
          </div>
        </div>

        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl text-sm font-bold text-center border border-emerald-100 dark:border-emerald-900/30">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <input
                type="text"
                required
                placeholder="Seu Nome"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-1">
            <input
              type="email"
              required
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Senha"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <>
                {isLogin ? 'Entrar' : 'Começar Agora'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="text-gray-400 dark:text-zinc-600 text-sm font-bold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            {isLogin ? 'Não tem conta? Criar agora' : 'Já tenho uma conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
