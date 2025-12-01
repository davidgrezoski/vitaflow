import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
];

const NUTRITIONIST_SYSTEM_PROMPT = `
Você é a Nutri Yasmin, uma nutricionista virtual inteligente, empática e profissional do aplicativo VitaFlow.
Seu objetivo é ajudar os usuários a atingirem seus objetivos de saúde.
Responda sempre em Português do Brasil. Seja concisa e use emojis.
`;

async function withModelFallback(
  operation: (model: any) => Promise<string>
): Promise<string> {
  if (!genAI) throw new Error("Gemini API Key não configurada.");

  let lastError: any;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await operation(model);
    } catch (error: any) {
      console.warn(`Modelo ${modelName} falhou:`, error.message || error);
      lastError = error;
    }
  }
  
  throw new Error("Não foi possível conectar com a IA no momento.");
}

export const getNutritionAdvice = async (
  history: { role: 'user' | 'assistant'; content: string }[],
  currentMessage: string
) => {
  return withModelFallback(async (model) => {
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: NUTRITIONIST_SYSTEM_PROMPT }] },
        ...chatHistory
      ],
    });

    const result = await chat.sendMessage(currentMessage);
    return result.response.text();
  });
};

export const generateWorkoutPlan = async (
  preferences: { goal: string; level: string; equipment: string }
) => {
  const prompt = `
    Crie um plano de treino JSON para: ${preferences.goal}, Nível: ${preferences.level}, Equipamento: ${preferences.equipment}.
    Retorne APENAS JSON válido com esta estrutura:
    [{"name": "Nome", "muscleGroup": "Grupo", "exercises": [{"name": "Exercicio", "sets": "3", "reps": "12"}]}]
  `;

  const responseText = await withModelFallback(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  try {
    let jsonString = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    const workouts = Array.isArray(parsed) ? parsed : (parsed.workouts || []);
    return workouts.map((w: any) => ({
      name: w.name || "Treino Personalizado",
      muscleGroup: w.muscleGroup || "Geral",
      exercises: Array.isArray(w.exercises) ? w.exercises : []
    }));
  } catch (error) {
    console.error("Erro parse treino:", error);
    return [];
  }
};

// --- CORREÇÃO DO CÁLCULO DE MACROS ---
export const calculateFoodMacros = async (foodName: string, amount: number, unit: string) => {
  // Prompt muito mais específico e rígido
  const prompt = `
    Atue como um banco de dados nutricional científico.
    Tarefa: Calcular macronutrientes.
    
    Entrada:
    - Alimento: "${foodName}"
    - Quantidade: ${amount}
    - Unidade: "${unit}"

    Instruções Críticas:
    1. Converta a unidade para gramas se necessário para fazer o cálculo preciso.
    2. Use dados nutricionais padrão (USDA/TACO).
    3. Retorne APENAS um objeto JSON. Sem texto antes, sem texto depois.
    
    Formato JSON Obrigatório:
    {
      "calories": (número inteiro),
      "protein": (número inteiro),
      "carbs": (número inteiro),
      "fat": (número inteiro)
    }
  `;

  const responseText = await withModelFallback(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  try {
    // Limpeza agressiva do JSON
    let jsonString = responseText.trim();
    // Remove code blocks markdown se existirem
    jsonString = jsonString.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    // Tenta encontrar o primeiro { e o último } para ignorar lixo textual
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonString);

    // Validação básica para garantir que não venha zerado ou errado
    return {
      calories: Number(data.calories) || 0,
      protein: Number(data.protein) || 0,
      carbs: Number(data.carbs) || 0,
      fat: Number(data.fat) || 0
    };
  } catch (error) {
    console.error("Erro ao calcular macros:", responseText);
    throw new Error("Não foi possível calcular os macros. Tente simplificar o nome do alimento.");
  }
};
