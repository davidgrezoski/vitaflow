import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  User,
  Bell,
  Users // Ícone de Equipe/Especialistas
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/Store';
import LevelUpModal from './LevelUpModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, trialStatus, levelUpModal, closeLevelUpModal } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const showHeader = location.pathname !== '/profile';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100 dark:bg-black transition-colors duration-500">
      <div className="w-full max-w-[480px] min-h-screen bg-white dark:bg-black shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Global Level Up Modal */}
        <LevelUpModal 
          isOpen={levelUpModal.isOpen} 
          level={levelUpModal.level} 
          onClose={closeLevelUpModal} 
        />

        {!trialStatus.isExpired && trialStatus.daysRemaining <= 3 && trialStatus.daysRemaining > 0 && (
          <div className="bg-primary text-white text-[10px] font-bold text-center py-1 px-4">
             {trialStatus.daysRemaining} dias restantes no teste
          </div>
        )}

        {showHeader && (
          <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-transparent z-30">
            <div>
              <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium mb-1">{getGreeting()}</p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user?.name?.split(' ')[0] || 'Visitante'}
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-primary rounded-full"></span>
              </button>
              
              <button onClick={() => navigate('/profile')} className="relative group">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden border border-transparent group-hover:border-primary transition-all">
                    <img 
                        src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto scrollbar-hide pb-28 px-6 pt-2">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
        
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40">
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />
          
          <nav className="relative bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-zinc-900 px-6 py-4 flex justify-between items-center pb-8">
            <NavItem to="/" icon={<LayoutDashboard size={22} />} />
            
            <div className="-mt-8">
                <NavLink 
                    to="/workout"
                    className={({ isActive }) => cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 transition-transform active:scale-95 border-4 border-white dark:border-black",
                        isActive ? "bg-primary text-white" : "bg-primary text-white"
                    )}
                >
                    <Dumbbell size={24} fill="currentColor" />
                </NavLink>
            </div>

            {/* Especialistas (Substitui o antigo Chat e Specialist) */}
            <NavItem to="/specialist" icon={<Users size={22} />} />
            
            <NavItem to="/profile" icon={<User size={22} />} />
          </nav>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon }: { to: string; icon: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300",
        isActive 
          ? "text-primary dark:text-primary" 
          : "text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400"
      )
    }
  >
    {icon}
    <span className={cn(
      "mt-1 w-1 h-1 rounded-full bg-primary transition-all duration-300",
      ({ isActive }: any) => isActive ? "opacity-100" : "opacity-0"
    )} />
  </NavLink>
);

export default Layout;
