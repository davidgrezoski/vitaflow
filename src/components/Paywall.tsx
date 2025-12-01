import React from 'react';
import { Lock, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/Store';

const Paywall = () => {
  const { signOut } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-emerald-500/10 animate-slide-up">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
        
        <div className="p-8 relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 rotate-3">
            <Lock className="text-white w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            Período de Teste Finalizado
          </h2>
          <p className="text-zinc-400 mb-8 font-medium">
            Esperamos que você tenha gostado do VitaFlow! Para continuar evoluindo sua saúde, desbloqueie a versão completa.
          </p>

          <div className="w-full bg-black/50 rounded-2xl p-6 border border-zinc-800 mb-8">
            <div className="flex justify-between items-end mb-4 border-b border-zinc-800 pb-4">
              <span className="text-zinc-400 font-bold text-sm">Plano Vitalício</span>
              <div className="text-right">
                <span className="text-sm text-zinc-500 line-through mr-2">R$ 149,90</span>
                <span className="text-2xl font-black text-white">R$ 89,90</span>
              </div>
            </div>
            
            <div className="space-y-3 text-left">
              <Feature text="Nutricionista IA Ilimitada" />
              <Feature text="Gerador de Treinos Personalizados" />
              <Feature text="Controle de Macros e Água" />
              <Feature text="Sem mensalidades, pagamento único" />
            </div>
          </div>

          <button 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
            onClick={() => alert("Integração de pagamento seria iniciada aqui.")}
          >
            <Star size={20} fill="currentColor" className="text-emerald-200" />
            Desbloquear Agora
          </button>

          <button 
            onClick={() => signOut()}
            className="text-zinc-500 text-sm font-bold hover:text-white transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
    <span className="text-zinc-300 text-sm font-medium">{text}</span>
  </div>
);

export default Paywall;
