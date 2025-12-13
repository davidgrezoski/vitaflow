import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { findVideoForExercise } from "../data/videoLibrary";
import { WorkoutPreferences, WeeklyWorkoutPlan, DietPlan } from "../types";
import { generateId } from "./utils";

// Configuração da API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicialização do SDK
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// --- BANCO DE DADOS LOCAL DE ALIMENTOS (FALLBACK DE ALTA PRECISÃO) ---
const FOOD_DATABASE: Record<string, { calories: number, protein: number, carbs: number, fat: number, unit_weight: number }> = {
  "ovo": { calories: 70, protein: 6, carbs: 0.5, fat: 5, unit_weight: 50 }, // unidade
  "ovos": { calories: 70, protein: 6, carbs: 0.5, fat: 5, unit_weight: 50 },
  "frango": { calories: 165, protein: 31, carbs: 0, fat: 3.6, unit_weight: 100 }, // 100g
  "peito de frango": { calories: 165, protein: 31, carbs: 0, fat: 3.6, unit_weight: 100 },
  "arroz": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit_weight: 100 }, // 100g cozido
  "arroz branco": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit_weight: 100 },
  "feijao": { calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, unit_weight: 100 }, // 100g carioca
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit_weight: 100 }, // unidade média ~100g
  "batata doce": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit_weight: 100 },
  "aveia": { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, unit_weight: 100 },
  "leite": { calories: 60, protein: 3.2, carbs: 4.7, fat: 3.2, unit_weight: 100 }, // 100ml
  "whey": { calories: 120, protein: 24, carbs: 3, fat: 1, unit_weight: 30 }, // dose 30g
  "figado": { calories: 175, protein: 26, carbs: 5, fat: 5, unit_weight: 100 }, // Fígado bovino
};

// --- FUNÇÃO DE LIMPEZA DE JSON ---
const extractJSON = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try { return JSON.parse(jsonMatch[1]); } catch (e2) { console.warn("Falha parse bloco"); }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (e3) { console.warn("Falha parse substring"); }
    }
    throw new Error("JSON inválido");
  }
};

// --- CHAT GENÉRICO (PERSONAS) ---
export const getPersonaChatResponse = async (
  history: { role: 'user' | 'assistant'; content: string }[],
  currentMessage: string,
  personaContext: string
) => {
  if (!genAI) return "⚠️ Erro: API Key não configurada.";

  for (const modelName of MODELS_TO_TRY) {
    try {
      const isLegacy = modelName.includes('gemini-pro') && !modelName.includes('1.5');
      const modelConfig: any = { model: modelName };
      if (!isLegacy) modelConfig.systemInstruction = personaContext;

      const model = genAI.getGenerativeModel(modelConfig);

      const chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      if (chatHistory.length > 0 && chatHistory[0].role === 'model') chatHistory.shift();

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: { maxOutputTokens: 800 },
        safetySettings
      });

      let messageToSend = currentMessage;
      if (isLegacy) messageToSend = `[Instrução: ${personaContext}]\n\n${currentMessage}`;

      const result = await chat.sendMessage(messageToSend);
      return result.response.text();
    } catch (error: any) {
      console.warn(`Erro modelo ${modelName}:`, error.message);
    }
  }
  return "⚠️ O sistema está instável. Tente novamente.";
};

// --- RESTAURAÇÃO: CHAT NUTRI (LEGACY SUPPORT) ---
// Esta função é usada pelo Chat.tsx antigo
export const getNutritionAdvice = async (
  history: { role: 'user' | 'assistant'; content: string }[],
  currentMessage: string
) => {
  const NUTRI_CONTEXT = `
    Você é a Nutri Yasmin, nutricionista do VitaFlow.
    Fale de forma amigável, use emojis de comida.
    Foque em reeducação alimentar e saúde.
    Se perguntarem de treino, dê uma dica leve mas sugira o Personal.
  `;
  return getPersonaChatResponse(history, currentMessage, NUTRI_CONTEXT);
};

// --- CÁLCULO DE MACROS (HÍBRIDO: LOCAL + IA) ---
export const calculateFoodMacros = async (foodName: string, amount: number, unit: string) => {
  // 1. Tenta Banco de Dados Local (Mais rápido e preciso para básicos)
  const normalizedName = foodName.toLowerCase().trim();
  
  // Busca parcial (ex: "ovos cozidos" acha "ovos")
  const dbKey = Object.keys(FOOD_DATABASE).find(key => normalizedName.includes(key));
  
  if (dbKey) {
    const data = FOOD_DATABASE[dbKey];
    let multiplier = 0;

    // Lógica de conversão de unidades
    if (unit.includes('g') || unit.includes('ml')) {
      multiplier = amount / 100; // Base do DB é 100g/ml
    } else if (unit.includes('uni') || unit.includes('fatia') || unit.includes('colher')) {
      // Se for unidade, usa o peso médio da unidade definido no DB
      // Ex: 2 ovos -> 2 * (50g / 100g base) * valor nutricional? Não.
      // Se o DB é por unidade (como ovo), multiplica direto.
      // Se o DB é por 100g, estima o peso da unidade.
      
      if (dbKey === 'ovo' || dbKey === 'ovos') {
        multiplier = amount; // Ovos no DB já estão normalizados por unidade média (~50g) se ajustarmos o DB, mas ali pus unit_weight 50.
        // Correção: O DB acima tem valores para "unidade" no caso do ovo?
        // Ovo: 70kcal. Isso é 1 unidade grande. Então multiplier = amount.
      } else {
        // Para outros itens (ex: banana), assume peso médio
        multiplier = (amount * data.unit_weight) / 100;
      }
    }

    if (multiplier > 0) {
      return {
        calories: Math.round(data.calories * multiplier),
        protein: Math.round(data.protein * multiplier),
        carbs: Math.round(data.carbs * multiplier),
        fat: Math.round(data.fat * multiplier)
      };
    }
  }

  // 2. Se não achar localmente, usa a IA
  if (!genAI) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const prompt = `
    Aja como uma tabela nutricional precisa (TACO/USDA).
    Calcule os macros para: ${amount} ${unit} de ${foodName}.
    Retorne APENAS JSON válido: { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
  `;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      return extractJSON(result.response.text());
    } catch (error) {
      console.warn(`Erro macros IA (${modelName}):`, error);
    }
  }
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
};

// --- GERADOR DE TREINOS ---
export const generateWorkoutPlan = async (preferences: WorkoutPreferences): Promise<any[]> => {
  if (!genAI) return enrichWorkoutWithVideos(getFallbackWorkout(preferences.focus));

  const prompt = `
    Crie uma ficha de treino SEMANAL (Segunda a Domingo) para:
    Objetivo: ${preferences.goal}, Nível: ${preferences.level}, Foco: ${preferences.focus}, 
    Duração: ${preferences.duration}min, Modalidades: ${preferences.modalities.join(', ')}.
    
    IMPORTANTE: Retorne APENAS um JSON válido com a seguinte estrutura exata:
    {
      "days": [
        {
          "dayName": "Segunda-feira",
          "muscleGroup": "Peito e Tríceps",
          "exercises": [
            { "name": "Supino Reto", "sets": "4", "reps": "10", "notes": "Carga moderada" }
          ]
        }
      ]
    }
  `;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const json = extractJSON(result.response.text());
      
      let days = json.days || (Array.isArray(json) ? json : []);
      if (days.length === 0) throw new Error("JSON vazio");

      return enrichWorkoutWithVideos(days);
    } catch (error) {
      console.warn(`Erro treino IA (${modelName}):`, error);
    }
  }
  return enrichWorkoutWithVideos(getFallbackWorkout(preferences.focus));
};

// --- GERADOR DE DIETA ---
export const generateDietPlan = async (profile: any, preferences: any): Promise<DietPlan> => {
  if (!genAI) return getFallbackDiet();

  const prompt = `
    Crie uma dieta para: ${profile.weight}kg, ${profile.goal}.
    Retorne APENAS JSON:
    { 
      "introduction": "Texto motivacional", 
      "dailyTotals": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }, 
      "meals": [
        { 
          "title": "Café", 
          "totalMacros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }, 
          "items": [{ "name": "Ovo", "portion": "2 uni", "calories": 140, "protein": 12, "carbs": 1, "fat": 10 }] 
        }
      ] 
    }
  `;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      return extractJSON(result.response.text());
    } catch (error) {
      console.warn(`Erro dieta IA (${modelName}):`, error);
    }
  }
  return getFallbackDiet();
};

// --- HELPERS ---

const enrichWorkoutWithVideos = (days: any[]) => {
  return days.map(day => ({
    id: generateId(),
    dayName: day.dayName || "Dia X",
    muscleGroup: day.muscleGroup || "Geral",
    exercises: (day.exercises || []).map((ex: any) => {
      const match = findVideoForExercise(ex.name, day.muscleGroup);
      return {
        ...ex,
        id: generateId(),
        videoId: match.videoId,
        videoUrl: `https://www.youtube.com/embed/${match.videoId}`,
        videoTitle: match.title
      };
    })
  }));
};

const getFallbackWorkout = (focus: string) => {
  return [
    {
      dayName: "Segunda-feira",
      muscleGroup: "Treino de Segurança (Offline)",
      exercises: [
        { name: "Agachamento Livre", sets: "3", reps: "12", notes: "Foco na amplitude" },
        { name: "Flexão de Braço", sets: "3", reps: "10", notes: "Peito no chão" },
        { name: "Polichinelos", sets: "3", reps: "50", notes: "Aqueça bem" }
      ]
    }
  ];
};

const getFallbackDiet = (): DietPlan => ({
  introduction: "⚠️ Modo Offline: Exemplo base.",
  dailyTotals: { calories: 2000, protein: 150, carbs: 200, fat: 70 },
  meals: [
    {
      title: "Café da Manhã",
      totalMacros: { calories: 400, protein: 20, carbs: 40, fat: 15 },
      items: [{ name: "Ovos Mexidos", portion: "2 unidades", calories: 140, protein: 12, carbs: 1, fat: 10 }]
    }
  ]
});
