import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserProfile } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => Math.random().toString(36).substr(2, 9);

// --- CÁLCULOS NUTRICIONAIS (Mifflin-St Jeor) ---

export const calculateBMR = (
  weight: number, 
  height: number, 
  age: number, 
  gender: 'male' | 'female'
): number => {
  // Fórmula de Mifflin-St Jeor
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return Math.round(bmr);
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multipliers: Record<string, number> = {
    'sedentary': 1.2,      // Pouco ou nenhum exercício
    'light': 1.375,        // Exercício leve 1-3 dias/semana
    'moderate': 1.55,      // Exercício moderado 3-5 dias/semana
    'active': 1.725,       // Exercício pesado 6-7 dias/semana
    'very_active': 1.9     // Exercício muito pesado + trabalho físico
  };

  const factor = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * factor);
};

export const calculateMacroGoals = (tdee: number, goal: 'lose' | 'maintain' | 'gain') => {
  let targetCalories = tdee;

  if (goal === 'lose') targetCalories -= 500; // Déficit calórico
  if (goal === 'gain') targetCalories += 500; // Superávit calórico

  // Distribuição Padrão Balanceada (40% Carb, 30% Prot, 30% Gordura)
  // Ajustável conforme necessidade
  return {
    calories: Math.round(targetCalories),
    protein: Math.round((targetCalories * 0.30) / 4),
    carbs: Math.round((targetCalories * 0.40) / 4),
    fat: Math.round((targetCalories * 0.30) / 9)
  };
};

// Parser de Linguagem Natural para Alimentos
// Ex: "200g de arroz" -> { amount: 200, unit: 'g', name: 'arroz' }
export const parseFoodInput = (input: string) => {
  // Regex para capturar: (Quantidade) (Unidade opcional) (Conector opcional) (Nome do alimento)
  // Aceita: "200g arroz", "1 banana", "1.5 xicara de aveia", "100 ml leite"
  const regex = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s+(?:de\s+)?(.+)$/i;
  
  const match = input.trim().match(regex);
  
  if (match) {
    const amount = parseFloat(match[1].replace(',', '.'));
    // Se não tiver unidade explícita (ex: "2 ovos"), assume "unidade"
    const unit = match[2] ? match[2].toLowerCase() : 'unidade'; 
    const name = match[3].trim();
    
    return { amount, unit, name };
  }
  
  return null;
};
