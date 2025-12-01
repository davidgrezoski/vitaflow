import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/Store';
import { UserProfile, ActivityLevel, Gender } from '../types';
import { Save, Calculator as CalcIcon, LogOut, ChevronDown } from 'lucide-react';

const Calculator = () => {
  const { user, updateUser, signOut } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    weight: 70,
    height: 170,
    gender: 'male',
    activityLevel: 'sedentary',
    goal: 'maintain'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || 25,
        weight: user.weight || 70,
        height: user.height || 170,
        gender: user.gender || 'male',
        activityLevel: user.activityLevel || 'sedentary',
        goal: user.goal || 'maintain'
      });
    }
  }, [user]);

  const calculateMetrics = () => {
    const { weight, height, age, gender, activityLevel } = formData as UserProfile;
    
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * multipliers[activityLevel];

    return { tmb: Math.round(bmr), tdee: Math.round(tdee) };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const metrics = calculateMetrics();
      await updateUser({ ...formData, ...metrics } as UserProfile);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500">Mantenha seus dados atualizados.</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5">
            <InputGroup label="Nome">
              <input 
                type="text" 
                required
                className="input-field"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </InputGroup>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Idade">
                <input 
                  type="number" 
                  required
                  className="input-field"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                />
              </InputGroup>
              <InputGroup label="Gênero">
                <div className="relative">
                  <select 
                    className="input-field appearance-none"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </InputGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Peso (kg)">
                <input 
                  type="number" 
                  required
                  className="input-field"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                />
              </InputGroup>
              <InputGroup label="Altura (cm)">
                <input 
                  type="number" 
                  required
                  className="input-field"
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                />
              </InputGroup>
            </div>

            <InputGroup label="Nível de Atividade">
              <div className="relative">
                <select 
                  className="input-field appearance-none"
                  value={formData.activityLevel}
                  onChange={e => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}
                >
                  <option value="sedentary">Sedentário (Pouco exercício)</option>
                  <option value="light">Leve (1-3 dias/semana)</option>
                  <option value="moderate">Moderado (3-5 dias/semana)</option>
                  <option value="active">Ativo (6-7 dias/semana)</option>
                  <option value="very_active">Muito Ativo (Intenso)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </InputGroup>

            <InputGroup label="Objetivo">
              <div className="relative">
                <select 
                  className="input-field appearance-none"
                  value={formData.goal}
                  onChange={e => setFormData({...formData, goal: e.target.value as any})}
                >
                  <option value="lose">Perder Peso</option>
                  <option value="maintain">Manter Peso</option>
                  <option value="gain">Ganhar Massa</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </InputGroup>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Calculando...' : 'Salvar e Recalcular'}
          </button>
        </form>
      </div>

      {user && user.tdee > 0 && (
        <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <CalcIcon size={100} />
          </div>
          <h3 className="font-bold text-emerald-50 flex items-center gap-2 mb-6 opacity-90 relative z-10">
            <CalcIcon size={18} />
            Suas Metas Diárias
          </h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-black/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-wider mb-1">Metabolismo Basal</p>
              <p className="text-3xl font-black tracking-tight">{user.tmb} <span className="text-sm font-medium opacity-70">kcal</span></p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
              <p className="text-[10px] text-white uppercase font-bold tracking-wider mb-1">Gasto Total</p>
              <p className="text-3xl font-black tracking-tight">{user.tdee} <span className="text-sm font-medium opacity-70">kcal</span></p>
            </div>
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

export default Calculator;
