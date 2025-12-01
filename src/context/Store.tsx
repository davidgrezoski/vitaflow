import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, Meal, WaterLog, ChatMessage, MacroGoal, Workout } from '../types';
import { differenceInDays } from 'date-fns'; // Vamos calcular manualmente para não depender de lib extra se não tiver

interface AppState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  updateUser: (user: UserProfile) => Promise<void>;
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  water: WaterLog;
  addWater: (amount: number) => Promise<void>;
  chatHistory: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id'>) => Promise<void>;
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  dailyStats: {
    consumed: { calories: number; protein: number; carbs: number; fat: number };
    goals: MacroGoal;
  };
  signOut: () => Promise<void>;
  trialStatus: {
    isExpired: boolean;
    daysRemaining: number;
  };
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_GOALS: MacroGoal = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

const TRIAL_DAYS = 3;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [water, setWater] = useState<WaterLog>({ current: 0, goal: 2500, history: [] });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Trial Logic
  const [trialStatus, setTrialStatus] = useState({ isExpired: false, daysRemaining: TRIAL_DAYS });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
        setUser(null);
        setMeals([]);
        setWater({ current: 0, goal: 2500, history: [] });
        setChatHistory([]);
        setWorkouts([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calcula status do trial sempre que o usuário muda
  useEffect(() => {
    if (user && user.created_at) {
      const createdDate = new Date(user.created_at);
      const now = new Date();
      
      // Diferença em milissegundos
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      // Diferença em dias (arredondado para cima)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // Se criou hoje, diffDays é 0 ou 1. 
      // Se diffDays > 3, expirou.
      const isExpired = diffDays > TRIAL_DAYS;
      const remaining = Math.max(0, TRIAL_DAYS - diffDays + 1); // +1 para contar o dia atual

      setTrialStatus({
        isExpired,
        daysRemaining: remaining
      });
    }
  }, [user]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUser({
          ...profile,
          activityLevel: profile.activity_level,
          water_goal: profile.water_goal || 2500
        });
      } else if (profileError && profileError.code !== 'PGRST116') {
         console.error("Error fetching profile:", profileError);
      }

      // Fetch Today's Meals
      const today = new Date().toISOString().split('T')[0];
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: true });

      if (mealsData) setMeals(mealsData);

      // Fetch Water
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (waterData) {
        const total = waterData.reduce((acc, curr) => acc + curr.amount, 0);
        setWater({
          current: total,
          goal: profile?.water_goal || 2500,
          history: waterData
        });
      }

      // Fetch Chat
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
        
      if (chatData) setChatHistory(chatData);

      // Fetch Workouts
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (workoutData) {
        const mappedWorkouts = workoutData.map(w => ({
          id: w.id,
          name: w.name,
          muscleGroup: w.muscle_group,
          exercises: w.exercises
        }));
        setWorkouts(mappedWorkouts);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const consumed = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goals = user ? calculateGoals(user) : DEFAULT_GOALS;

  function calculateGoals(u: UserProfile): MacroGoal {
    let targetCals = u.tdee || 2000;
    if (u.goal === 'lose') targetCals -= 500;
    if (u.goal === 'gain') targetCals += 500;

    return {
      calories: Math.round(targetCals),
      protein: Math.round((targetCals * 0.3) / 4),
      carbs: Math.round((targetCals * 0.4) / 4),
      fat: Math.round((targetCals * 0.3) / 9),
    };
  }

  const updateUser = async (u: UserProfile) => {
    if (!session?.user.id) return;
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        name: u.name,
        age: u.age,
        weight: u.weight,
        height: u.height,
        gender: u.gender,
        activity_level: u.activityLevel,
        goal: u.goal,
        tmb: u.tmb,
        tdee: u.tdee,
        water_goal: u.water_goal,
        // Não atualizamos created_at aqui para não reiniciar o trial
      });

    if (!error) setUser(prev => ({ ...prev, ...u }));
    else console.error("Error updating profile:", error);
  };
  
  const addMeal = async (meal: Omit<Meal, 'id'>) => {
    if (!session?.user.id) return;
    const { data, error } = await supabase.from('meals').insert([{ ...meal, user_id: session.user.id }]).select().single();
    if (!error && data) setMeals([...meals, data]);
  };
  
  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    if (!error) setMeals(meals.filter(m => m.id !== id));
  };

  const addWater = async (amount: number) => {
    if (!session?.user.id) return;
    const { data, error } = await supabase.from('water_logs').insert([{ amount, user_id: session.user.id }]).select().single();
    if (!error && data) {
      setWater(prev => ({ ...prev, current: prev.current + amount, history: [...prev.history, data] }));
    }
  };

  const addMessage = async (msg: Omit<ChatMessage, 'id'>) => {
    if (!session?.user.id) return;
    const tempId = Math.random().toString();
    setChatHistory(prev => [...prev, { ...msg, id: tempId }]);
    const { data, error } = await supabase.from('chat_messages').insert([{ ...msg, user_id: session.user.id }]).select().single();
    if (!error && data) {
      setChatHistory(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    if (!session?.user.id) return;
    const { data, error } = await supabase.from('workouts').insert([{
        user_id: session.user.id,
        name: workout.name,
        muscle_group: workout.muscleGroup,
        exercises: workout.exercises
      }]).select().single();
    if (!error && data) {
      setWorkouts(prev => [{ id: data.id, name: data.name, muscleGroup: data.muscle_group, exercises: data.exercises }, ...prev]);
    }
  };

  const deleteWorkout = async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (!error) setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{
      session, user, loading, updateUser,
      meals, addMeal, deleteMeal,
      water, addWater,
      chatHistory, addMessage,
      workouts, addWorkout, deleteWorkout,
      dailyStats: { consumed, goals },
      signOut,
      trialStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
