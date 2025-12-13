export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface NotificationSettings {
  workout: boolean;
  water: boolean;
  meal: boolean;
  news: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: 'lose' | 'maintain' | 'gain';
  tmb: number;
  tdee: number; // Total Daily Energy Expenditure
  water_goal?: number;
  created_at?: string;
  avatar_url?: string | null;
  notification_settings?: NotificationSettings;
  subscription_status?: 'trial' | 'pro';
  
  // Gamification Fields
  xp?: number;
  level?: number;
  current_streak?: number;
  last_log_date?: string;
}

export interface MacroGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at?: string;
}

export interface WaterLog {
  current: number; // ml
  goal: number; // ml
  history: { id: string; amount: number; created_at: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

// --- WORKOUT INTERFACES ---

export interface Exercise {
  id?: string; 
  name: string;
  sets: string;
  reps: string;
  rest?: string;
  load?: string; 
  notes?: string; 
  videoId?: string; 
  videoUrl?: string;
  videoTitle?: string;
  image?: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string; 
  muscleGroup: string; 
  duration?: string; 
  exercises: Exercise[];
}

export interface WeeklyWorkoutPlan {
  level: string;
  goal: string;
  days: WorkoutDay[];
}

export interface WorkoutPreferences {
  goal: string;
  level: string;
  equipment: string;
  frequency: string;
  focus: string;
  duration: string; 
  modalities: string[]; 
}

export interface Workout {
  id: string;
  name: string;
  muscleGroup: string;
  exercises: Exercise[];
}

// Diet Interfaces
export interface DietMealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietMeal {
  title: string; 
  items: DietMealItem[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DietPlan {
  introduction: string;
  meals: DietMeal[];
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Gamification Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
