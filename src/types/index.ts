export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

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
  created_at?: string; // Adicionado para controle do Trial
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

export interface Workout {
  id: string;
  name: string;
  muscleGroup: string;
  exercises: { name: string; sets: string; reps: string }[];
}
