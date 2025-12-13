import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, Meal, WaterLog, ChatMessage, MacroGoal, Workout, NotificationSettings } from '../types';
import { toast } from 'sonner';
import { calculateMacroGoals } from '../lib/utils';

interface AppState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  updateUser: (user: UserProfile) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  updateNotifications: (settings: NotificationSettings) => Promise<void>;
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
  trialStatus: { isExpired: boolean; daysRemaining: number; };
  upgradeAccount: () => Promise<void>;
  // Gamification Actions
  awardXP: (amount: number) => void;
  // Modal State
  levelUpModal: { isOpen: boolean; level: number };
  closeLevelUpModal: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  workout: true, water: true, meal: false, news: true
};

const TRIAL_DAYS = 30; 

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [water, setWater] = useState<WaterLog>({ current: 0, goal: 2500, history: [] });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [trialStatus, setTrialStatus] = useState({ isExpired: false, daysRemaining: TRIAL_DAYS });
  const [isPro, setIsPro] = useState(false);

  // Gamification Modal State
  const [levelUpModal, setLevelUpModal] = useState({ isOpen: false, level: 1 });

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) await fetchData(session.user.id);
        else setLoading(false);
      } catch (e) {
        console.error("Erro ao iniciar sessão:", e);
        setLoading(false);
      }
    };

    initSession();

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

  useEffect(() => {
    if (isPro) {
      setTrialStatus({ isExpired: false, daysRemaining: 999 });
      return;
    }
    if (user && user.created_at) {
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const isExpired = diffDays > TRIAL_DAYS;
      const remaining = Math.max(0, TRIAL_DAYS - diffDays + 1);
      setTrialStatus({ isExpired, daysRemaining: remaining });
    }
  }, [user, isPro]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

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
          water_goal: profile.water_goal || 2500,
          notification_settings: profile.notification_settings || DEFAULT_NOTIFICATIONS,
          subscription_status: profile.subscription_status || 'trial',
          xp: profile.xp || 0,
          level: profile.level || 1,
          current_streak: profile.current_streak || 0,
          last_log_date: profile.last_log_date || null
        });
        if (profile.subscription_status === 'pro') setIsPro(true);
      } else if (profileError) {
        console.warn("Perfil não encontrado ou erro:", profileError);
      }

      const [mealsResult, waterResult, chatResult, workoutResult] = await Promise.allSettled([
        supabase.from('meals').select('*').eq('user_id', userId).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`),
        supabase.from('water_logs').select('*').eq('user_id', userId).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`),
        supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('workouts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (mealsResult.status === 'fulfilled' && mealsResult.value.data) {
        setMeals(mealsResult.value.data);
      }

      if (waterResult.status === 'fulfilled' && waterResult.value.data) {
        const waterData = waterResult.value.data;
        const total = waterData.reduce((acc, curr) => acc + curr.amount, 0);
        setWater({
          current: total,
          goal: profile?.water_goal || 2500,
          history: waterData
        });
      }

      if (chatResult.status === 'fulfilled' && chatResult.value.data) {
        setChatHistory(chatResult.value.data);
      }

      if (workoutResult.status === 'fulfilled' && workoutResult.value.data) {
        const mappedWorkouts = workoutResult.value.data.map(w => ({
          id: w.id,
          name: w.name,
          muscleGroup: w.muscle_group,
          exercises: w.exercises
        }));
        setWorkouts(mappedWorkouts);
      }

    } catch (error) {
      console.error('Erro crítico no fetchData:', error);
      toast.error("Erro ao carregar alguns dados.");
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

  const goals = user && user.tdee ? calculateMacroGoals(user.tdee, user.goal) : { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const updateUser = async (u: UserProfile) => {
    if (!session?.user.id) return;
    setUser(prev => ({ ...prev, ...u }));
    
    // Ensure gamification fields are safe
    const safeXP = u.xp ?? 0;
    const safeLevel = u.level ?? 1;
    const safeStreak = u.current_streak ?? 0;
    const safeLastLog = u.last_log_date ?? null;

    const { error } = await supabase.from('profiles').upsert({
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
        avatar_url: u.avatar_url,
        notification_settings: u.notification_settings,
        subscription_status: u.subscription_status,
        xp: safeXP,
        level: safeLevel,
        current_streak: safeStreak,
        last_log_date: safeLastLog
    });

    if (error) {
        console.error("Erro ao salvar perfil:", error);
    }
  };

  const awardXP = (amount: number) => {
    if (!user) return;
    const currentXP = user.xp || 0;
    const newXP = currentXP + amount;
    const currentLevel = user.level || 1;
    
    // Simple level formula: Level * 100 XP needed for next level
    const xpNeeded = currentLevel * 100;
    
    let updatedUser = { ...user, xp: newXP };
    
    if (newXP >= xpNeeded) {
        const newLevel = currentLevel + 1;
        updatedUser.level = newLevel;
        updatedUser.xp = newXP - xpNeeded;
        
        // Trigger Level Up Modal
        setLevelUpModal({ isOpen: true, level: newLevel });
    }

    updateUser(updatedUser);
  };

  const closeLevelUpModal = () => {
    setLevelUpModal(prev => ({ ...prev, isOpen: false }));
  };

  const uploadAvatar = async (file: File) => {
    if (!session?.user.id) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await updateUser({ ...user!, avatar_url: publicUrl });
      toast.success("Foto atualizada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar foto.");
    }
  };

  const updateNotifications = async (settings: NotificationSettings) => {
     if (user) await updateUser({ ...user, notification_settings: settings });
  };

  const addMeal = async (meal: Omit<Meal, 'id'>) => {
    if (!session?.user.id) return;
    
    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user?.current_streak || 0;
    let lastLog = user?.last_log_date;

    if (lastLog !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLog === yesterdayStr) {
            newStreak += 1; // Continued streak
        } else {
            newStreak = 1; // Reset or new streak
        }
        
        // Update user with new streak and last log date
        if (user) {
            updateUser({ ...user, current_streak: newStreak, last_log_date: today });
        }
    }

    const { data, error } = await supabase.from('meals').insert([{ ...meal, user_id: session.user.id }]).select().single();
    if (!error && data) {
        setMeals([...meals, data]);
        awardXP(15); // +15 XP per meal
    }
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
      awardXP(5); // +5 XP per water log
    }
  };

  const addMessage = async (msg: Omit<ChatMessage, 'id'>) => {
    if (!session?.user.id) return;
    const tempId = Math.random().toString();
    setChatHistory(prev => [...prev, { ...msg, id: tempId }]); 
    
    const { data, error } = await supabase.from('chat_messages').insert([{ ...msg, user_id: session.user.id }]).select().single();
    if (error) {
        console.error("Erro ao salvar mensagem:", error);
    } else if (data) {
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
      awardXP(50); // +50 XP per workout
    }
  };

  const deleteWorkout = async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (!error) setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const upgradeAccount = async () => {
    if (!session?.user.id || !user) return;
    try {
      const { error } = await supabase.from('profiles').update({ subscription_status: 'pro' }).eq('id', session.user.id);
      if (error) throw error;
      setUser({ ...user, subscription_status: 'pro' });
      setIsPro(true);
      toast.success("Conta Premium ativada!");
    } catch (error) {
      toast.error("Erro ao ativar assinatura.");
    }
  };

  return (
    <AppContext.Provider value={{
      session, user, loading, updateUser, uploadAvatar, updateNotifications,
      meals, addMeal, deleteMeal, water, addWater, chatHistory, addMessage,
      workouts, addWorkout, deleteWorkout, dailyStats: { consumed, goals },
      signOut, trialStatus, upgradeAccount, awardXP,
      levelUpModal, closeLevelUpModal
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
