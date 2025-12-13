import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Dumbbell, 
  Save, 
  RotateCcw, 
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

interface AgendaExercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface AgendaDay {
  id: string;
  dayName: string;
  focus: string;
  exercises: AgendaExercise[];
}

const INITIAL_WEEK: AgendaDay[] = [
  { id: 'seg', dayName: 'Segunda-feira', focus: '', exercises: [] },
  { id: 'ter', dayName: 'Terça-feira', focus: '', exercises: [] },
  { id: 'qua', dayName: 'Quarta-feira', focus: '', exercises: [] },
  { id: 'qui', dayName: 'Quinta-feira', focus: '', exercises: [] },
  { id: 'sex', dayName: 'Sexta-feira', focus: '', exercises: [] },
  { id: 'sab', dayName: 'Sábado', focus: '', exercises: [] },
  { id: 'dom', dayName: 'Domingo', focus: '', exercises: [] },
];

const WeeklyAgenda = () => {
  const [week, setWeek] = useState<AgendaDay[]>(() => {
    const saved = localStorage.getItem('vitaflow-weekly-agenda');
    return saved ? JSON.parse(saved) : INITIAL_WEEK;
  });

  // Persistência automática
  useEffect(() => {
    localStorage.setItem('vitaflow-weekly-agenda', JSON.stringify(week));
  }, [week]);

  const updateFocus = (dayIndex: number, newFocus: string) => {
    const newWeek = [...week];
    newWeek[dayIndex].focus = newFocus;
    setWeek(newWeek);
  };

  const addExercise = (dayIndex: number) => {
    const newWeek = [...week];
    newWeek[dayIndex].exercises.push({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sets: '3',
      reps: '10'
    });
    setWeek(newWeek);
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof AgendaExercise, value: string) => {
    const newWeek = [...week];
    newWeek[dayIndex].exercises[exIndex] = {
      ...newWeek[dayIndex].exercises[exIndex],
      [field]: value
    };
    setWeek(newWeek);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newWeek = [...week];
    newWeek[dayIndex].exercises.splice(exIndex, 1);
    setWeek(newWeek);
  };

  const clearDay = (dayIndex: number) => {
    if (confirm('Tem certeza que deseja limpar o treino deste dia?')) {
      const newWeek = [...week];
      newWeek[dayIndex].exercises = [];
      newWeek[dayIndex].focus = '';
      setWeek(newWeek);
      toast.success('Dia limpo com sucesso.');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-primary">
          <Calendar size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda Semanal</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Organize sua rotina manualmente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {week.map((day, dayIndex) => (
          <div 
            key={day.id} 
            className="group bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Header do Card */}
            <div className="bg-gray-50 dark:bg-black p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  {day.dayName}
                </h3>
                <input
                  type="text"
                  placeholder="Definir Foco (ex: Costas)"
                  value={day.focus}
                  onChange={(e) => updateFocus(dayIndex, e.target.value)}
                  className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-700 outline-none focus:text-primary transition-colors"
                />
              </div>
              <button 
                onClick={() => clearDay(dayIndex)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                title="Limpar dia"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Lista de Exercícios */}
            <div className="p-4 space-y-3 flex-1 min-h-[200px]">
              {day.exercises.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-zinc-700 gap-2 min-h-[150px]">
                  <Dumbbell size={32} strokeWidth={1} />
                  <p className="text-xs font-medium">Dia de descanso ou sem treino</p>
                </div>
              ) : (
                day.exercises.map((ex, exIndex) => (
                  <div key={ex.id} className="flex items-center gap-2 animate-slide-up">
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      {/* Nome */}
                      <div className="col-span-6">
                        <input
                          type="text"
                          placeholder="Exercício"
                          value={ex.name}
                          onChange={(e) => updateExercise(dayIndex, exIndex, 'name', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:border-primary outline-none transition-all"
                        />
                      </div>
                      {/* Séries */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Sér"
                          value={ex.sets}
                          onChange={(e) => updateExercise(dayIndex, exIndex, 'sets', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-lg px-2 py-2 text-sm text-center text-gray-600 dark:text-zinc-400 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      {/* Reps */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Rep"
                          value={ex.reps}
                          onChange={(e) => updateExercise(dayIndex, exIndex, 'reps', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 rounded-lg px-2 py-2 text-sm text-center text-gray-600 dark:text-zinc-400 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeExercise(dayIndex, exIndex)}
                      className="text-gray-300 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer com Botão Adicionar */}
            <div className="p-4 pt-0">
              <button
                onClick={() => addExercise(dayIndex)}
                className="w-full py-3 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
              >
                <Plus size={16} />
                Adicionar Exercício
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyAgenda;
