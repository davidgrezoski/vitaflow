import React, { useState, useEffect } from 'react';
import { WeeklyWorkoutPlan, WorkoutDay, Exercise } from '../types';
import { 
  Printer, 
  Download, 
  Dumbbell, 
  Trash2, 
  Plus, 
  Edit3, 
  Calendar,
  Clock,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { generateWorkoutPDF } from '../lib/pdf';
import { useApp } from '../context/Store';

interface WeeklyWorkoutSheetProps {
  plan: WeeklyWorkoutPlan;
}

const WeeklyWorkoutSheet: React.FC<WeeklyWorkoutSheetProps> = ({ plan: initialPlan }) => {
  const { user } = useApp();
  
  // Estado local do plano para permitir edição (CRUD)
  const [localPlan, setLocalPlan] = useState<WeeklyWorkoutPlan>(initialPlan);
  const [selectedDayId, setSelectedDayId] = useState<string>(initialPlan.days[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);

  // Atualiza o plano local se o plano inicial mudar (nova geração)
  useEffect(() => {
    setLocalPlan(initialPlan);
    setSelectedDayId(initialPlan.days[0]?.id || '');
  }, [initialPlan]);

  const selectedDayIndex = localPlan.days.findIndex(d => d.id === selectedDayId);
  const selectedDay = localPlan.days[selectedDayIndex] || localPlan.days[0];

  // --- CRUD OPERATIONS ---

  const handleUpdateExercise = (exerciseIndex: number, field: keyof Exercise, value: string) => {
    const updatedDays = [...localPlan.days];
    const updatedExercises = [...updatedDays[selectedDayIndex].exercises];
    
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      [field]: value
    };

    updatedDays[selectedDayIndex] = {
      ...updatedDays[selectedDayIndex],
      exercises: updatedExercises
    };

    setLocalPlan({ ...localPlan, days: updatedDays });
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
    const updatedDays = [...localPlan.days];
    updatedDays[selectedDayIndex].exercises.splice(exerciseIndex, 1);
    setLocalPlan({ ...localPlan, days: updatedDays });
    toast.success("Exercício removido.");
  };

  const handleAddExercise = () => {
    const updatedDays = [...localPlan.days];
    updatedDays[selectedDayIndex].exercises.push({
      id: Math.random().toString(36).substr(2, 9),
      name: "Novo Exercício",
      sets: "3",
      reps: "10",
      rest: "60s",
      notes: ""
    });
    setLocalPlan({ ...localPlan, days: updatedDays });
    setIsEditing(true); // Força modo de edição ao adicionar
    
    // Scroll para o fim da lista
    setTimeout(() => {
        const list = document.getElementById('exercise-list');
        if (list) list.scrollTop = list.scrollHeight;
    }, 100);
  };

  const handleSavePlan = () => {
    setIsEditing(false);
    toast.success("Alterações salvas localmente!");
    // Aqui você poderia salvar no Supabase se quisesse persistência
  };

  // --- EXPORT ---

  const handleDownloadPDF = () => {
    toast.info("Gerando PDF...");
    try {
      generateWorkoutPDF(localPlan, user?.name || 'Atleta');
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF.");
    }
  };

  // Helper para abreviação dos dias
  const getDayAbbreviation = (fullName: string) => {
    const map: Record<string, string> = {
      'Segunda-feira': 'Seg', 'Terça-feira': 'Ter', 'Quarta-feira': 'Qua',
      'Quinta-feira': 'Qui', 'Sexta-feira': 'Sex', 'Sábado': 'Sáb', 'Domingo': 'Dom'
    };
    const key = Object.keys(map).find(k => fullName.includes(k));
    return key ? map[key] : fullName.substring(0, 3);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Seu Treino</h2>
          <p className="text-gray-500 dark:text-zinc-400">Personalize, edite e exporte sua rotina.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20 active:scale-95"
          >
            <Download size={16} />
            Baixar PDF
          </button>
        </div>
      </div>

      {/* SELETOR DE DIAS */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold">
          <Calendar size={20} />
          <h3>Cronograma Semanal</h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {localPlan.days.map((day) => {
            const isSelected = selectedDayId === day.id;
            const abbr = getDayAbbreviation(day.dayName);
            
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`flex flex-col items-center justify-center min-w-[100px] p-4 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary bg-orange-50 dark:bg-orange-900/20 shadow-sm transform scale-105' 
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-500'}`}>
                  {abbr}
                </span>
                <span className={`text-xs text-center line-clamp-2 leading-tight ${isSelected ? 'text-primary font-bold' : 'text-gray-400 dark:text-zinc-600'}`}>
                  {day.muscleGroup}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ÁREA DE EDIÇÃO DO DIA */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm min-h-[500px] flex flex-col">
        
        {/* Cabeçalho do Dia */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-zinc-800 pb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedDay.muscleGroup}
            </h3>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-medium text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
                <Clock size={12} />
                Duração estimada: {selectedDay.duration || '60 min'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => isEditing ? handleSavePlan() : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                isEditing 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            {isEditing ? <><Save size={16} /> Salvar</> : <><Edit3 size={16} /> Editar Treino</>}
          </button>
        </div>

        {/* Lista de Exercícios */}
        <div id="exercise-list" className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[500px] scrollbar-hide">
          {selectedDay.exercises.map((exercise, index) => (
            <div 
              key={exercise.id || index}
              className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all bg-white dark:bg-zinc-900 ${
                isEditing ? 'border-primary/30 shadow-sm' : 'border-gray-200 dark:border-zinc-800 hover:border-primary/30'
              }`}
            >
              {/* Ícone */}
              <div className="hidden sm:flex w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 items-center justify-center text-gray-400 dark:text-zinc-500 group-hover:text-primary transition-colors shrink-0">
                <Dumbbell size={20} />
              </div>
              
              {/* Campos de Edição ou Visualização */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                
                {/* Nome */}
                <div className="sm:col-span-5">
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={exercise.name}
                            onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 dark:text-white focus:border-primary outline-none"
                            placeholder="Nome do exercício"
                        />
                    ) : (
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">{exercise.name}</h4>
                    )}
                </div>

                {/* Séries e Reps */}
                <div className="sm:col-span-3 flex gap-2">
                    {isEditing ? (
                        <>
                            <input 
                                type="text" 
                                value={exercise.sets}
                                onChange={(e) => handleUpdateExercise(index, 'sets', e.target.value)}
                                className="w-1/2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs font-medium text-center focus:border-primary outline-none"
                                placeholder="Séries"
                                title="Séries"
                            />
                            <input 
                                type="text" 
                                value={exercise.reps}
                                onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                                className="w-1/2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs font-medium text-center focus:border-primary outline-none"
                                placeholder="Reps"
                                title="Repetições"
                            />
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">
                            {exercise.sets} séries × {exercise.reps} reps
                        </p>
                    )}
                </div>

                {/* Obs/Carga */}
                <div className="sm:col-span-4">
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={exercise.notes || ''}
                            onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-zinc-400 focus:border-primary outline-none"
                            placeholder="Obs: Carga, descanso..."
                        />
                    ) : (
                        <p className="text-xs text-gray-400 dark:text-zinc-600 truncate">
                            {exercise.notes || 'Sem observações'}
                        </p>
                    )}
                </div>
              </div>

              {/* Botão Remover (Só no modo edição) */}
              {isEditing && (
                <button 
                  onClick={() => handleDeleteExercise(index)}
                  className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0 self-end sm:self-center"
                  title="Remover exercício"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botão Adicionar */}
        <button 
            onClick={handleAddExercise}
            className="w-full mt-6 py-4 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-gray-500 dark:text-zinc-500 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-primary transition-all group"
        >
          <div className="bg-gray-200 dark:bg-zinc-800 rounded-full p-1 group-hover:bg-primary group-hover:text-white transition-colors">
            <Plus size={16} />
          </div>
          Adicionar Exercício
        </button>

      </div>
    </div>
  );
};

export default WeeklyWorkoutSheet;
