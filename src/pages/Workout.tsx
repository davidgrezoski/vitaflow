import React, { useState } from 'react';
import { Sparkles, Calendar, Loader2, ChevronRight, Check } from 'lucide-react';
import { generateId } from '../lib/utils';
import { WeeklyWorkoutPlan, WorkoutPreferences } from '../types';
import { toast } from 'sonner';
import { generateWorkoutPlan } from '../lib/gemini';
import WeeklyWorkoutSheet from '../components/WeeklyWorkoutSheet';
import WeeklyAgenda from '../components/WeeklyAgenda';

const Workout = () => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goal: 'Hipertrofia',
    level: 'Intermediário',
    equipment: 'Academia Completa',
    frequency: '5',
    focus: 'Corpo Todo (Full Body)',
    duration: '60',
    modalities: ['Musculação']
  });

  const [generatedWeeklyPlan, setGeneratedWeeklyPlan] = useState<WeeklyWorkoutPlan | null>(null);

  const MODALITIES = ['Musculação', 'Cardio', 'CrossFit', 'Funcional', 'Calistenia', 'Lutas', 'Yoga/Pilates'];
  const DURATIONS = ['30', '45', '60', '90'];

  const toggleModality = (mod: string) => {
    setPreferences(prev => {
        const current = prev.modalities;
        if (current.includes(mod)) return { ...prev, modalities: current.filter(m => m !== mod) };
        else return { ...prev, modalities: [...current, mod] };
    });
  };

  const handleGenerateWorkout = async () => {
    if (preferences.modalities.length === 0) {
        toast.error("Selecione pelo menos uma modalidade.");
        return;
    }

    setLoading(true);
    try {
      // Chama a IA (que agora retorna array de dias enriquecidos)
      const aiDays = await generateWorkoutPlan(preferences);
      
      if (!aiDays || aiDays.length === 0) {
        throw new Error("Nenhum treino gerado pela IA.");
      }

      // Mapeia para a estrutura WeeklyWorkoutPlan
      const weeklyPlan: WeeklyWorkoutPlan = {
        level: preferences.level,
        goal: preferences.goal,
        days: aiDays.map((day: any) => ({
            id: day.id || generateId(),
            dayName: day.dayName,
            muscleGroup: day.muscleGroup,
            duration: `${preferences.duration} min`,
            exercises: day.exercises
        }))
      };
      
      setGeneratedWeeklyPlan(weeklyPlan);
      toast.success("Ficha semanal criada com sucesso!");
      setStep('result');

    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar treino. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* MODO SWITCHER */}
      <div className="bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl flex mb-6">
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'ai' 
              ? 'bg-white dark:bg-black text-primary shadow-sm' 
              : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          <Sparkles size={16} />
          Smart Planner (IA)
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'manual' 
              ? 'bg-white dark:bg-black text-primary shadow-sm' 
              : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          <Calendar size={16} />
          Agenda Manual
        </button>
      </div>

      {mode === 'manual' ? (
        <WeeklyAgenda />
      ) : (
        <>
          {step === 'config' ? (
            <>
              <div className="flex items-center justify-between px-1">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Planner</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-500">IA de Treinamento Avançada</p>
                 </div>
              </div>

              <div className="card p-6 space-y-8 animate-slide-up">
                
                <div className="space-y-6">
                    <OptionGroup label="Qual seu objetivo principal?">
                    {['Hipertrofia', 'Emagrecimento', 'Força Pura', 'Resistência', 'Saúde Geral'].map(opt => (
                        <SelectPill 
                        key={opt} 
                        active={preferences.goal === opt} 
                        onClick={() => setPreferences({...preferences, goal: opt})}
                        label={opt}
                        />
                    ))}
                    </OptionGroup>

                    <OptionGroup label="Nível de experiência">
                    {['Iniciante', 'Intermediário', 'Avançado', 'Atleta'].map(opt => (
                        <SelectPill 
                        key={opt} 
                        active={preferences.level === opt} 
                        onClick={() => setPreferences({...preferences, level: opt})}
                        label={opt}
                        />
                    ))}
                    </OptionGroup>
                </div>

                <div className="h-px bg-gray-100 dark:bg-zinc-800" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 ml-1">Dias / Semana</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black text-gray-900 dark:text-white text-sm font-bold border border-transparent focus:border-primary/50 outline-none appearance-none transition-all"
                        value={preferences.frequency}
                        onChange={(e) => setPreferences({...preferences, frequency: e.target.value})}
                      >
                        {[2,3,4,5,6,7].map(num => (
                          <option key={num} value={num}>{num} dias</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 ml-1">Duração (min)</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black text-gray-900 dark:text-white text-sm font-bold border border-transparent focus:border-primary/50 outline-none appearance-none transition-all"
                        value={preferences.duration}
                        onChange={(e) => setPreferences({...preferences, duration: e.target.value})}
                      >
                        {DURATIONS.map(d => (
                          <option key={d} value={d}>{d} min</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-zinc-800" />

                <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 ml-1">Modalidades</label>
                    <div className="flex flex-wrap gap-2">
                        {MODALITIES.map(mod => {
                            const isActive = preferences.modalities.includes(mod);
                            return (
                                <button
                                    key={mod}
                                    onClick={() => toggleModality(mod)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border flex items-center gap-2 ${
                                    isActive 
                                        ? 'bg-primary/10 text-primary border-primary' 
                                        : 'bg-transparent text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-primary/50'
                                    }`}
                                >
                                    {isActive && <Check size={14} />}
                                    {mod}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 ml-1">Divisão de Treino</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black text-gray-900 dark:text-white text-sm font-bold border border-transparent focus:border-primary/50 outline-none appearance-none transition-all"
                        value={preferences.focus}
                        onChange={(e) => setPreferences({...preferences, focus: e.target.value})}
                      >
                        <option value="Corpo Todo (Full Body)">Full Body (Corpo Todo)</option>
                        <option value="Superior/Inferior (Upper/Lower)">Upper / Lower (Sup/Inf)</option>
                        <option value="Push/Pull/Legs (ABC)">Push / Pull / Legs (ABC)</option>
                        <option value="Body Part Split (Bro Split)">Grupos Isolados (Bro Split)</option>
                        <option value="Híbrido (Musculação + Cardio)">Híbrido (Força + Cardio)</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                    </div>
                </div>

                <button 
                    onClick={handleGenerateWorkout}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-orange-600 text-white py-5 rounded-full font-bold shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                >
                    {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-lg">Criando Ficha...</span>
                    </>
                    ) : (
                    <>
                        <span className="text-lg">Gerar Planejamento</span>
                        <Sparkles size={20} className="text-orange-200" />
                    </>
                    )}
                </button>
              </div>
            </>
          ) : (
            <div className="animate-slide-up">
              <div className="mb-4 flex justify-between items-center px-2">
                 <button onClick={() => setStep('config')} className="text-sm text-gray-500 dark:text-zinc-500 font-bold hover:text-primary transition-colors flex items-center gap-1">
                    ← Ajustar Preferências
                 </button>
                 <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {preferences.goal}
                 </span>
              </div>

              {generatedWeeklyPlan && (
                 <WeeklyWorkoutSheet plan={generatedWeeklyPlan} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const OptionGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 ml-1">{label}</label>
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);

const SelectPill = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${
      active 
        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
        : 'bg-transparent text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-primary/50 hover:text-primary'
    }`}
  >
    {label}
  </button>
);

export default Workout;
