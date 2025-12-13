import React, { useState, useEffect } from 'react';
import { useApp } from '../context/Store';
import { generateDietPlan } from '../lib/gemini';
import { DietPlan } from '../types';
import { Sparkles, ChefHat, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const DietGenerator = () => {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DietPlan | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    age: 25,
    weight: 70,
    height: 170,
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'sedentary',
    restrictions: '',
    foodPreferences: ''
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        age: user.age || 25,
        weight: user.weight || 70,
        height: user.height || 170,
        gender: user.gender || 'male',
        goal: user.goal || 'maintain',
        activityLevel: user.activityLevel || 'sedentary'
      }));
    }
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    try {
      const result = await generateDietPlan(
        {
          age: Number(formData.age),
          weight: Number(formData.weight),
          height: Number(formData.height),
          gender: formData.gender,
          goal: formData.goal,
          activityLevel: formData.activityLevel
        },
        {
          restrictions: formData.restrictions,
          foodPreferences: formData.foodPreferences
        }
      );
      setPlan(result);
      toast.success("Plano alimentar gerado com sucesso!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao gerar dieta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {!plan ? (
        <div className="animate-fade-in space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-start gap-3">
            <div className="bg-orange-100 dark:bg-orange-800/30 p-2 rounded-full text-primary dark:text-primary shrink-0">
              <ChefHat size={20} />
            </div>
            <div>
              <h3 className="font-bold text-orange-800 dark:text-orange-200 text-sm">Nutri IA Personalizada</h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Preencha seus dados e preferências para receber um plano alimentar completo focado no seu objetivo.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Peso (kg)">
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                />
              </InputGroup>
              <InputGroup label="Altura (cm)">
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </InputGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Idade">
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                />
              </InputGroup>
              <InputGroup label="Objetivo">
                <div className="relative">
                  <select
                    className="input-field appearance-none"
                    value={formData.goal}
                    onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  >
                    <option value="lose">Perder Peso</option>
                    <option value="maintain">Manter Peso</option>
                    <option value="gain">Ganhar Massa</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </InputGroup>
            </div>

            <InputGroup label="Restrições Alimentares (Opcional)">
              <input
                type="text"
                placeholder="Ex: Sem glúten, intolerante a lactose, vegano..."
                className="input-field"
                value={formData.restrictions}
                onChange={e => setFormData({ ...formData, restrictions: e.target.value })}
              />
            </InputGroup>

            <InputGroup label="Preferências (Opcional)">
              <input
                type="text"
                placeholder="Ex: Gosto de frango, prefiro comidas práticas..."
                className="input-field"
                value={formData.foodPreferences}
                onChange={e => setFormData({ ...formData, foodPreferences: e.target.value })}
              />
            </InputGroup>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Sparkles className="animate-spin" size={18} />
                  Criando Dieta...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Gerar Plano Alimentar
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-slide-up space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seu Plano</h2>
            <button 
              onClick={() => setPlan(null)}
              className="text-sm font-bold text-primary dark:text-primary hover:underline"
            >
              Gerar Novo
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed italic">
              "{plan.introduction}"
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-gray-100 dark:border-zinc-800 pt-4">
               <TotalStat label="Kcal" value={plan.dailyTotals.calories} />
               <TotalStat label="Prot" value={plan.dailyTotals.protein} />
               <TotalStat label="Carb" value={plan.dailyTotals.carbs} />
               <TotalStat label="Gord" value={plan.dailyTotals.fat} />
            </div>
          </div>

          <div className="space-y-4">
            {plan.meals.map((meal, idx) => (
              <div key={idx} className="card overflow-hidden">
                <div className="bg-orange-50 dark:bg-orange-900/20 px-5 py-3 border-b border-orange-100 dark:border-orange-900/30 flex justify-between items-center">
                  <h3 className="font-bold text-orange-800 dark:text-orange-200">{meal.title}</h3>
                  <span className="text-xs font-bold text-primary dark:text-primary bg-white dark:bg-black/20 px-2 py-1 rounded-md">
                    {meal.totalMacros.calories} kcal
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {meal.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-gray-500 dark:text-zinc-500 text-xs">{item.portion}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-zinc-600 font-medium whitespace-nowrap">
                        P:{item.protein} C:{item.carbs} G:{item.fat}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3 text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/30">
            <AlertCircle size={18} className="shrink-0" />
            <p>Lembre-se: Este é um plano gerado por IA. Consulte um nutricionista para prescrições médicas.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
    {children}
  </div>
);

const TotalStat = ({ label, value }: { label: string, value: number }) => (
  <div className="text-center">
    <p className="text-lg font-black text-gray-900 dark:text-white">{value}</p>
    <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
  </div>
);

export default DietGenerator;
