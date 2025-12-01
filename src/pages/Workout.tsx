import React, { useState } from 'react';
import { Dumbbell, Settings, Trash2, Sparkles, Check, ChevronRight } from 'lucide-react';
import { generateId } from '../lib/utils';
import { Workout as WorkoutType } from '../types';
import { useApp } from '../context/Store';
import { toast } from 'sonner';
import { generateWorkoutPlan } from '../lib/gemini';

const Workout = () => {
  const { workouts, addWorkout, deleteWorkout } = useApp();
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    goal: 'Hipertrofia',
    level: 'Iniciante',
    equipment: 'Academia Completa'
  });

  const [generatedPreview, setGeneratedPreview] = useState<WorkoutType[]>([]);

  const handleGenerateWorkout = async () => {
    setLoading(true);
    try {
      const aiWorkouts = await generateWorkoutPlan(preferences);
      const newWorkouts: WorkoutType[] = aiWorkouts.map((w: any) => ({
        ...w,
        id: generateId()
      }));
      setGeneratedPreview(newWorkouts);
      for (const w of newWorkouts) {
        await addWorkout(w);
      }
      toast.success("Treino criado pela IA com sucesso!");
      setStep('result');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar treino.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {step === 'config' ? (
        <>
          {/* Header Section */}
          <div className="flex items-center justify-between px-1">
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerador IA</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-500">Crie treinos personalizados</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles size={20} />
             </div>
          </div>

          {/* Configuration Card */}
          <div className="card p-6 space-y-6">
            <OptionGroup label="Qual seu objetivo?">
              {['Hipertrofia', 'Força', 'Resistência'].map(opt => (
                <SelectPill 
                  key={opt} 
                  active={preferences.goal === opt} 
                  onClick={() => setPreferences({...preferences, goal: opt})}
                  label={opt}
                />
              ))}
            </OptionGroup>

            <OptionGroup label="Nível de experiência">
              {['Iniciante', 'Intermediário', 'Avançado'].map(opt => (
                <SelectPill 
                  key={opt} 
                  active={preferences.level === opt} 
                  onClick={() => setPreferences({...preferences, level: opt})}
                  label={opt}
                />
              ))}
            </OptionGroup>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 ml-1">Equipamentos</label>
              <div className="relative">
                <select 
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black text-gray-900 dark:text-white text-sm font-bold border border-transparent focus:border-indigo-500/50 outline-none appearance-none transition-all"
                  value={preferences.equipment}
                  onChange={(e) => setPreferences({...preferences, equipment: e.target.value})}
                >
                  <option value="Academia Completa">Academia Completa</option>
                  <option value="Pesos Livres (Halteres)">Pesos Livres</option>
                  <option value="Peso do Corpo (Calistenia)">Peso do Corpo</option>
                  <option value="Elásticos">Elásticos</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
              </div>
            </div>

            <button 
                onClick={handleGenerateWorkout}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-full font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
            >
                {loading ? (
                <>
                    <LoaderIcon />
                    <span>Criando...</span>
                </>
                ) : (
                <>
                    Gerar Treino
                    <Sparkles size={18} className="text-indigo-200" />
                </>
                )}
            </button>
          </div>

          {/* History Section */}
          {workouts.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg px-1">Seus Treinos</h3>
              <div className="grid gap-4">
                {workouts.map(w => (
                  <div key={w.id} className="card p-5 relative group hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{w.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md mt-2 inline-block">
                          {w.muscleGroup}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteWorkout(w.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                            <Dumbbell size={14} />
                            <span className="font-medium">{(w.exercises || []).length} exercícios</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Resultado</h2>
            <button onClick={() => setStep('config')} className="text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Voltar</button>
          </div>

          {generatedPreview.map((workout, idx) => (
            <div key={idx} className="card overflow-hidden border-indigo-100 dark:border-indigo-900/30">
              <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-2xl mb-2">{workout.name}</h3>
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                    {workout.muscleGroup}
                    </span>
                </div>
                <Dumbbell className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
              </div>
              <div className="p-6 space-y-4">
                {(workout.exercises || []).map((ex, i) => (
                  <div key={i} className="flex justify-between items-center text-sm pb-4 border-b border-gray-50 dark:border-zinc-800 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-gray-900 dark:text-gray-200 font-bold text-base">{ex.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-indigo-900 dark:text-indigo-200 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-xs">{ex.sets} x {ex.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="bg-emerald-500 text-white p-4 rounded-full text-sm font-bold text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
            <Check size={18} />
            Salvo no histórico automaticamente!
          </div>
        </div>
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
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
        : 'bg-transparent text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:text-indigo-500'
    }`}
  >
    {label}
  </button>
);

const LoaderIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Workout;
