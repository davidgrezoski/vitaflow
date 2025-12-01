import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Utensils, Flame, Sparkles, X, Check, PartyPopper } from 'lucide-react';
import { useApp } from '../context/Store';
import { useTheme } from '../context/ThemeContext';
import { calculateFoodMacros } from '../lib/gemini';
import { toast } from 'sonner';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Opcional, mas bom para responsividade do confetti, vamos usar window direto se não tiver

const COLORS = {
  protein: '#10b981', // emerald-500
  carbs: '#f59e0b',   // amber-500
  fat: '#ef4444',     // red-500
  remainingLight: '#f3f4f6', // gray-100
  remainingDark: '#27272a'   // zinc-800
};

const UNITS = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'colher_sopa', label: 'Colher de Sopa' },
  { value: 'colher_cha', label: 'Colher de Chá' },
  { value: 'xicara', label: 'Xícara' },
  { value: 'unidade', label: 'Unidade(s)' },
  { value: 'fatia', label: 'Fatia(s)' },
  { value: 'copo', label: 'Copo (200ml)' },
];

const Dashboard = () => {
  const { dailyStats, addMeal, meals, deleteMeal } = useApp();
  const { theme } = useTheme();
  const { consumed, goals } = dailyStats;
  
  const [isAdding, setIsAdding] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Form States
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [calculatedMacros, setCalculatedMacros] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  // Confetti Logic
  useEffect(() => {
    // Trigger confetti if goals are met (e.g., calories >= 95% but < 110% to avoid overeating celebration)
    // Or simply if calories reached 100%
    const calPercent = (consumed.calories / goals.calories) * 100;
    
    if (calPercent >= 100 && calPercent <= 110 && !localStorage.getItem(`celebrated-${new Date().toDateString()}`)) {
      setShowConfetti(true);
      toast.success("Parabéns! Você atingiu sua meta diária! 🎉");
      localStorage.setItem(`celebrated-${new Date().toDateString()}`, 'true');
      
      // Stop confetti after 8 seconds
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [consumed.calories, goals.calories]);

  const remainingCalories = Math.max(0, goals.calories - consumed.calories);
  
  const macroData = [
    { name: 'Proteína', value: consumed.protein, color: COLORS.protein },
    { name: 'Carboidratos', value: consumed.carbs, color: COLORS.carbs },
    { name: 'Gorduras', value: consumed.fat, color: COLORS.fat },
  ];

  const chartData = macroData.filter(d => d.value > 0);
  if (chartData.length === 0) chartData.push({ 
    name: 'Vazio', 
    value: 1, 
    color: theme === 'dark' ? COLORS.remainingDark : COLORS.remainingLight 
  });

  const handleCalculate = async () => {
    if (!foodName || !amount) {
      toast.error("Preencha o nome do alimento e a quantidade.");
      return;
    }

    setLoadingAI(true);
    try {
      const result = await calculateFoodMacros(foodName, Number(amount), unit);
      setCalculatedMacros(result);
      toast.success("Macros calculados com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao calcular. Tente inserir os valores manualmente.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!calculatedMacros) return;

    await addMeal({
      name: `${foodName} (${amount} ${UNITS.find(u => u.value === unit)?.label || unit})`,
      ...calculatedMacros
    });

    // Reset form
    setFoodName('');
    setAmount('');
    setUnit('g');
    setCalculatedMacros(null);
    setIsAdding(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Fallback logic if user edits the macro fields manually would go here
    // For now, we rely on the AI flow or manual entry if implemented separately
    if (calculatedMacros) {
       handleSaveMeal();
    }
  };

  return (
    <div className="space-y-8 relative">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={200}
            gravity={0.2}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-emerald-500/30 text-center animate-slide-up pointer-events-auto">
             <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <PartyPopper size={40} />
             </div>
             <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Meta Atingida!</h2>
             <p className="text-gray-500 dark:text-zinc-400 font-medium mb-6">Você completou suas calorias diárias.</p>
             <button 
               onClick={() => setShowConfetti(false)}
               className="btn-primary w-full"
             >
               Continuar Focado
             </button>
          </div>
        </div>
      )}

      {/* Hero Card - Stats Principais */}
      <div className="card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Flame size={120} className="text-emerald-500 rotate-12" />
        </div>

        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="h-56 w-56 relative mb-4">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                {remainingCalories}
              </span>
              <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                Restantes
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            <MacroStat label="Proteína" value={consumed.protein} total={goals.protein} color="bg-emerald-500" textColor="text-emerald-500" />
            <MacroStat label="Carboidrato" value={consumed.carbs} total={goals.carbs} color="bg-amber-500" textColor="text-amber-500" />
            <MacroStat label="Gordura" value={consumed.fat} total={goals.fat} color="bg-red-500" textColor="text-red-500" />
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Diário Alimentar</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-500">Registre suas refeições</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isAdding 
              ? 'bg-red-500 text-white rotate-45' 
              : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-105'
          }`}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Smart Add Meal Form */}
      {isAdding && (
        <div className="card p-5 animate-slide-up border-emerald-500/20 ring-1 ring-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles size={100} className="text-emerald-500" />
          </div>

          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            Adicionar Inteligente
          </h4>

          <div className="space-y-4 relative z-10">
            {/* Nome do Alimento */}
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">O que você comeu?</label>
              <input 
                placeholder="Ex: Arroz Branco, Peito de Frango..." 
                className="input-field mt-1 font-medium"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
              />
            </div>

            {/* Quantidade e Unidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Quantidade</label>
                <input 
                  type="number"
                  placeholder="Ex: 100, 2..." 
                  className="input-field mt-1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Unidade</label>
                <select 
                  className="input-field mt-1 appearance-none"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                >
                  {UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botão de Calcular */}
            {!calculatedMacros ? (
              <button 
                onClick={handleCalculate}
                disabled={loadingAI || !foodName || !amount}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loadingAI ? (
                  <>
                    <Sparkles className="animate-spin" size={18} />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Calcular Macros Automaticamente
                  </>
                )}
              </button>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">Resultado da IA</span>
                   <button onClick={() => setCalculatedMacros(null)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <MiniStat label="Kcal" value={calculatedMacros.calories} />
                  <MiniStat label="Prot" value={calculatedMacros.protein} />
                  <MiniStat label="Carb" value={calculatedMacros.carbs} />
                  <MiniStat label="Gord" value={calculatedMacros.fat} />
                </div>

                <button 
                  onClick={handleSaveMeal}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Check size={18} />
                  Confirmar e Adicionar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal List */}
      <div className="space-y-4 pb-8">
        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-zinc-700 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-[2rem]">
            <Utensils size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhuma refeição registrada.</p>
          </div>
        ) : (
          meals.slice().reverse().map(meal => (
            <div key={meal.id} className="group bg-white dark:bg-dark-surface p-5 rounded-[1.5rem] border border-gray-100 dark:border-dark-border shadow-sm hover:border-emerald-500/30 transition-all flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-zinc-800 shrink-0">
                  {meal.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">{meal.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                      {meal.calories} kcal
                    </span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                      P: {meal.protein}g • C: {meal.carbs}g • G: {meal.fat}g
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deleteMeal(meal.id)} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:text-zinc-600 transition-colors shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string, value: number }) => (
  <div className="bg-white dark:bg-black/40 p-2 rounded-lg text-center border border-gray-100 dark:border-white/5">
    <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
    <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
  </div>
);

const MacroStat = ({ label, value, total, color, textColor }: { label: string, value: number, total: number, color: string, textColor: string }) => (
  <div className="bg-gray-50 dark:bg-black p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100 dark:border-zinc-900">
    <p className={`text-lg font-black ${textColor}`}>{value}g</p>
    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full my-2 overflow-hidden">
      <div 
        className={`h-full rounded-full ${color}`} 
        style={{ width: `${Math.min(100, (value/total)*100)}%` }}
      />
    </div>
    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wide">{label}</p>
  </div>
);

export default Dashboard;
