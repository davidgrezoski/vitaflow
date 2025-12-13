import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Activity, 
  Droplets, 
  Plus, 
  Search, 
  Utensils, 
  ArrowRight, 
  Trophy,
  GlassWater,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { useApp } from '../context/Store';
import { calculateFoodMacros } from '../lib/gemini';
import { parseFoodInput } from '../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { dailyStats, user, addMeal, water, addWater } = useApp();
  const { consumed, goals } = dailyStats;
  const navigate = useNavigate();
  
  // Estado para input de alimento
  const [foodInput, setFoodInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievement, setAchievement] = useState<{title: string, icon: any} | null>(null);

  // Verifica se o usuário tem TMB calculada
  const hasMetabolism = user?.tmb && user?.tdee;

  // Cálculo de porcentagens de Macros
  const calPercent = Math.min(100, (consumed.calories / (goals.calories || 2000)) * 100);
  const protPercent = Math.min(100, (consumed.protein / (goals.protein || 1)) * 100);
  const carbPercent = Math.min(100, (consumed.carbs / (goals.carbs || 1)) * 100);
  const fatPercent = Math.min(100, (consumed.fat / (goals.fat || 1)) * 100);

  // Gamification Data
  const currentStreak = user?.current_streak || 0;
  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpToNextLevel = currentLevel * 100;
  const xpPercent = Math.min(100, (currentXP / xpToNextLevel) * 100);

  // --- LÓGICA DE ÁGUA GAMIFICADA ---
  const waterPercent = Math.min(100, (water.current / water.goal) * 100);
  
  const getWaterLevel = (percent: number) => {
    if (percent >= 100) return { title: "Mestre das Águas 🔱", color: "text-blue-600 dark:text-blue-400", icon: "🔱" };
    if (percent >= 80) return { title: "Aquático 🐬", color: "text-blue-500 dark:text-blue-300", icon: "🐬" };
    if (percent >= 50) return { title: "Hidratado 🌊", color: "text-blue-400 dark:text-blue-200", icon: "🌊" };
    if (percent >= 20) return { title: "Iniciante 💧", color: "text-blue-300 dark:text-blue-100", icon: "💧" };
    return { title: "Cacto Seco 🌵", color: "text-gray-400 dark:text-gray-500", icon: "🌵" };
  };

  const waterLevelInfo = getWaterLevel(waterPercent);

  const handleAddWater = async (amount: number) => {
    await addWater(amount);
    toast.success(`+${amount}ml registrados! 💧`);
    
    if (water.current + amount >= water.goal && water.current < water.goal) {
        triggerAchievement("Hidratação Completa!", <Droplets size={40} className="text-blue-500" />);
    }
  };

  // --- LÓGICA DE ALIMENTOS ---

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodInput.trim()) return;

    const parsed = parseFoodInput(foodInput);
    
    if (!parsed) {
        toast.error("Formato inválido. Tente: '200g arroz' ou '1 banana'");
        return;
    }

    setIsAdding(true);
    try {
        const macros = await calculateFoodMacros(parsed.name, parsed.amount, parsed.unit);
        
        await addMeal({
            name: `${parsed.amount}${parsed.unit} ${parsed.name}`,
            ...macros
        });

        // Gamification Checks
        if (consumed.protein + macros.protein >= goals.protein && consumed.protein < goals.protein) {
            triggerAchievement("Meta de Proteína Batida!", <DumbbellIcon />);
        }
        
        // First meal of the day check (simplified)
        if (consumed.calories === 0) {
           triggerAchievement("Primeira Refeição!", <Utensils size={40} className="text-orange-500" />);
        } else {
           toast.success(`+${macros.calories} kcal | +15 XP`);
        }

        setFoodInput('');
    } catch (error) {
        console.error(error);
        toast.error("Não foi possível identificar o alimento.");
    } finally {
        setIsAdding(false);
    }
  };

  const triggerAchievement = (title: string, icon: any) => {
    setAchievement({ title, icon });
    setShowConfetti(true);
    setTimeout(() => {
        setAchievement(null);
        setShowConfetti(false);
    }, 4000);
  };

  if (!hasMetabolism) {
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center px-6 text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-primary mb-4 animate-pulse">
                <Activity size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil Incompleto</h2>
            <p className="text-gray-500 dark:text-zinc-400 max-w-xs">
                Para rastrear sua dieta com precisão, precisamos calcular seu metabolismo basal primeiro.
            </p>
            <button 
                onClick={() => navigate('/profile')}
                className="btn-primary w-full max-w-xs flex items-center justify-center gap-2"
            >
                Configurar Agora <ArrowRight size={20} />
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}
      
      {/* ACHIEVEMENT MODAL */}
      <AnimatePresence>
        {achievement && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -50 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
            >
                <div className="bg-white dark:bg-zinc-900 border-2 border-primary p-8 rounded-3xl shadow-2xl shadow-primary/30 flex flex-col items-center text-center gap-4 max-w-sm w-full">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center animate-bounce">
                        {achievement.icon}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Conquista!</h3>
                        <p className="text-primary font-bold text-lg">{achievement.title}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-xs font-bold text-gray-500 dark:text-zinc-400">
                        +50 XP Bônus
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* GAMIFICATION HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30">
                    {currentLevel}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-gray-700">
                    LVL
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progresso XP</p>
                <div className="w-32 h-2.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercent}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5 text-right font-medium">
                    {Math.round(currentXP)} / {xpToNextLevel} XP
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className={`p-1.5 rounded-full ${currentStreak > 0 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
                <Flame size={18} fill={currentStreak > 0 ? "currentColor" : "none"} className={currentStreak > 0 ? "animate-pulse" : ""} />
            </div>
            <div>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{currentStreak}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dias Seguidos</p>
            </div>
        </div>
      </div>

      {/* Hero Card - Resumo Calórico */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-primary/10 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
        <div className="p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
                        Hoje
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Zap size={12} className="text-yellow-500" fill="currentColor" />
                        Energia Diária
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-primary">{Math.max(0, goals.calories - consumed.calories)}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase">Kcal Restantes</p>
                </div>
            </div>
            
            {/* Progress Bar Principal */}
            <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                    <span>{consumed.calories} consumidas</span>
                    <span>Meta: {goals.calories}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-black h-5 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 relative" 
                        initial={{ width: 0 }}
                        animate={{ width: `${calPercent}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        {calPercent > 10 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Star size={10} className="text-white animate-spin-slow" fill="currentColor" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Macro Bars */}
            <div className="grid grid-cols-3 gap-4 mt-2">
                <MacroBar label="Proteína" current={consumed.protein} total={goals.protein} color="from-blue-400 to-blue-600" percent={protPercent} />
                <MacroBar label="Carbo" current={consumed.carbs} total={goals.carbs} color="from-green-400 to-green-600" percent={carbPercent} />
                <MacroBar label="Gordura" current={consumed.fat} total={goals.fat} color="from-yellow-400 to-yellow-600" percent={fatPercent} />
            </div>
        </div>
      </div>

      {/* --- WIDGET DE ÁGUA GAMIFICADO --- */}
      <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-dark-surface p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

         <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg text-blue-500">
                        <Droplets size={18} fill="currentColor" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hidratação</h3>
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider ${waterLevelInfo.color} flex items-center gap-1`}>
                    Nível: {waterLevelInfo.title}
                </p>
            </div>
            <div className="text-right">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{water.current}</span>
                <span className="text-xs text-gray-400 font-bold ml-1">/ {water.goal}ml</span>
            </div>
         </div>

         <div className="w-full bg-blue-100 dark:bg-black h-6 rounded-full overflow-hidden mb-6 relative border border-blue-200 dark:border-blue-900/30">
            <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 relative flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: `${waterPercent}%` }}
                transition={{ type: "spring", stiffness: 50 }}
            >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                {waterPercent > 10 && <span className="text-[10px] font-bold text-white relative z-10">{Math.round(waterPercent)}%</span>}
            </motion.div>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => handleAddWater(250)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all"
            >
                <GlassWater size={16} />
                +250ml
            </button>
            <button 
                onClick={() => handleAddWater(500)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all"
            >
                <Plus size={16} />
                +500ml
            </button>
         </div>
      </div>

      {/* Input Inteligente de Alimentos */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full text-primary">
                <Utensils size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registrar Alimento</h3>
                <p className="text-[10px] text-gray-400 font-medium">Ganhe XP a cada registro!</p>
            </div>
        </div>
        
        <form onSubmit={handleAddFood} className="relative z-10">
            <input 
                type="text" 
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="Ex: 200g de arroz, 1 banana..."
                disabled={isAdding}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white p-5 pr-14 rounded-2xl outline-none focus:border-primary/50 transition-all font-medium placeholder-gray-400 focus:ring-4 focus:ring-primary/10"
            />
            <button 
                type="submit"
                disabled={!foodInput.trim() || isAdding}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-90"
            >
                {isAdding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
            </button>
        </form>
        
        {/* Decorative background elements */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Row - Detalhes */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estatísticas</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <StatCard 
                icon={<Activity size={20} />} 
                label="Metabolismo" 
                value={`${user?.tmb || 0}`} 
                subValue="Kcal Basal"
                color="text-purple-500"
                bgColor="bg-purple-500/10"
            />
            <StatCard 
                icon={<Flame size={20} />} 
                label="Gasto Total" 
                value={`${user?.tdee || 0}`} 
                subValue="Kcal/Dia"
                color="text-orange-500"
                bgColor="bg-orange-500/10"
            />
        </div>
      </div>
    </div>
  );
};

const MacroBar = ({ label, current, total, color, percent }: any) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-zinc-400">
            <span>{label}</span>
            <span>{Math.round(current)}/{total}g</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-black h-2.5 rounded-full overflow-hidden">
            <motion.div 
                className={`h-full bg-gradient-to-r ${color} rounded-full`} 
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
        </div>
    </div>
);

const StatCard = ({ icon, label, value, subValue, color, bgColor }: any) => (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-[1.5rem] border border-gray-100 dark:border-dark-border flex flex-col items-start gap-3 shadow-sm hover:scale-[1.02] transition-transform">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-[10px] text-gray-400">{subValue}</p>
        </div>
    </div>
);

// Helper Icon Component
const DumbbellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
);

export default Dashboard;
