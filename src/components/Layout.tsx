import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Dumbbell, 
  MessageCircle, 
  User,
  Moon,
  Sun,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/Store';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { trialStatus } = useApp();
  const location = useLocation();

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Visão Geral';
      case '/hydration': return 'Hidratação';
      case '/workout': return 'Treinos';
      case '/chat': return 'Nutri Yasmin';
      case '/profile': return 'Perfil';
      default: return 'VitaFlow';
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-50 dark:bg-black transition-colors duration-500">
      {/* App Container - Centralizado e com largura máxima de app mobile/tablet */}
      <div className="w-full max-w-[500px] min-h-screen bg-white dark:bg-black shadow-2xl shadow-black/5 relative flex flex-col border-x border-gray-100 dark:border-zinc-900">
        
        {/* Trial Banner */}
        {!trialStatus.isExpired && trialStatus.daysRemaining <= 3 && (
          <div className="bg-indigo-600 text-white text-[10px] font-bold text-center py-1 px-4 flex items-center justify-center gap-2">
             <Clock size={10} />
             {trialStatus.daysRemaining} dias restantes no seu teste grátis
          </div>
        )}

        {/* Header Minimalista */}
        <header className="px-6 py-5 flex justify-between items-center bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100 dark:border-zinc-900/50">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all active:scale-90"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>

        {/* Main Content com padding para a barra de navegação */}
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-28 px-4 pt-4">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
        
        {/* Floating Bottom Navigation - Estilo Glassmorphism Premium */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[460px] px-4 z-40">
          <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/50 rounded-full px-2 py-2 flex justify-between items-center shadow-xl shadow-gray-200/50 dark:shadow-black/50">
            <NavItem to="/" icon={<LayoutDashboard size={24} />} label="Home" />
            <NavItem to="/hydration" icon={<Droplets size={24} />} label="Água" />
            <NavItem to="/workout" icon={<Dumbbell size={24} />} label="Treino" />
            <NavItem to="/chat" icon={<MessageCircle size={24} />} label="Chat" />
            <NavItem to="/profile" icon={<User size={24} />} label="Perfil" />
          </nav>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex-1 flex flex-col items-center justify-center py-3 rounded-full transition-all duration-300 relative group",
        isActive 
          ? "text-emerald-600 dark:text-emerald-400" 
          : "text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400"
      )
    }
  >
    <div className={cn(
      "transition-transform duration-300",
      ({ isActive }: any) => isActive ? "-translate-y-1" : ""
    )}>
      {icon}
    </div>
    {/* Indicador de ativo sutil */}
    <span className={cn(
      "absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500 transition-all duration-300",
      ({ isActive }: any) => isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
    )} />
  </NavLink>
);

export default Layout;
